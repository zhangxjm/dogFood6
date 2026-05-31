package services

import (
	"fmt"
	"time"

	"warehouse-system/internal/models"
	"warehouse-system/pkg/redis"
	"warehouse-system/pkg/rfid"
)

type InventoryService struct {
	rfidService *rfid.RFIDReaderService
}

func NewInventoryService() *InventoryService {
	return &InventoryService{
		rfidService: rfid.NewRFIDReaderService(),
	}
}

func (s *InventoryService) GetInventoryList(warehouseID uint, page, pageSize int) ([]models.Inventory, int64, error) {
	var inventories []models.Inventory
	var total int64

	query := models.DB.Model(&models.Inventory{}).Preload("Product").Preload("Warehouse")
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Find(&inventories).Error; err != nil {
		return nil, 0, err
	}

	return inventories, total, nil
}

func (s *InventoryService) GetInventoryByID(id uint) (*models.Inventory, error) {
	var inventory models.Inventory
	if err := models.DB.Preload("Product").Preload("Warehouse").First(&inventory, id).Error; err != nil {
		return nil, err
	}
	return &inventory, nil
}

func (s *InventoryService) CreateInventory(inventory *models.Inventory) error {
	product := &models.Product{}
	if err := models.DB.First(product, inventory.ProductID).Error; err != nil {
		return err
	}

	warehouse := &models.Warehouse{}
	if err := models.DB.First(warehouse, inventory.WarehouseID).Error; err != nil {
		return err
	}

	dutyAmount := float64(inventory.Quantity) * product.BondedDuty
	if warehouse.UsedQuota+dutyAmount > warehouse.BondedQuota {
		return fmt.Errorf("insufficient bonded quota")
	}

	tx := models.DB.Begin()

	if err := tx.Create(inventory).Error; err != nil {
		tx.Rollback()
		return err
	}

	warehouse.UsedQuota += dutyAmount
	if err := tx.Save(warehouse).Error; err != nil {
		tx.Rollback()
		return err
	}

	quotaTx := &models.QuotaTransaction{
		WarehouseID: inventory.WarehouseID,
		ProductID:   inventory.ProductID,
		Amount:      dutyAmount,
		Type:        "deduct",
		ReferenceNo: fmt.Sprintf("INV-%d", inventory.ID),
		Remark:      "Inventory creation quota deduction",
	}
	if err := tx.Create(quotaTx).Error; err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()

	cacheKey := fmt.Sprintf("inventory:%d", inventory.ID)
	redis.RedisClient.DeleteCache(cacheKey)

	return nil
}

func (s *InventoryService) UpdateInventory(inventory *models.Inventory) error {
	if err := models.DB.Save(inventory).Error; err != nil {
		return err
	}

	cacheKey := fmt.Sprintf("inventory:%d", inventory.ID)
	redis.RedisClient.DeleteCache(cacheKey)

	return nil
}

func (s *InventoryService) DeleteInventory(id uint) error {
	inventory := &models.Inventory{}
	if err := models.DB.First(inventory, id).Error; err != nil {
		return err
	}

	product := &models.Product{}
	models.DB.First(product, inventory.ProductID)
	warehouse := &models.Warehouse{}
	models.DB.First(warehouse, inventory.WarehouseID)

	tx := models.DB.Begin()

	dutyAmount := float64(inventory.Quantity) * product.BondedDuty
	warehouse.UsedQuota -= dutyAmount
	if warehouse.UsedQuota < 0 {
		warehouse.UsedQuota = 0
	}
	if err := tx.Save(warehouse).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Delete(inventory).Error; err != nil {
		tx.Rollback()
		return err
	}

	quotaTx := &models.QuotaTransaction{
		WarehouseID: inventory.WarehouseID,
		ProductID:   inventory.ProductID,
		Amount:      dutyAmount,
		Type:        "refund",
		ReferenceNo: fmt.Sprintf("INV-DEL-%d", inventory.ID),
		Remark:      "Inventory deletion quota refund",
	}
	if err := tx.Create(quotaTx).Error; err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()

	cacheKey := fmt.Sprintf("inventory:%d", id)
	redis.RedisClient.DeleteCache(cacheKey)

	return nil
}

func (s *InventoryService) AutoStockTake(warehouseID uint) (*models.StockTake, error) {
	return s.rfidService.AutoStockTake(warehouseID)
}

func (s *InventoryService) GetStockTakeList(warehouseID uint, page, pageSize int) ([]models.StockTake, int64, error) {
	var stockTakes []models.StockTake
	var total int64

	query := models.DB.Model(&models.StockTake{})
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Order("taken_at desc").Offset(offset).Limit(pageSize).Find(&stockTakes).Error; err != nil {
		return nil, 0, err
	}

	return stockTakes, total, nil
}

func (s *InventoryService) SyncInventory(sourceWarehouseID, targetWarehouseID, productID, quantity uint) error {
	lockKey := fmt.Sprintf("sync:lock:%d:%d", sourceWarehouseID, targetWarehouseID)
	locked, err := redis.RedisClient.Lock(lockKey, "syncing", 30*time.Second)
	if err != nil || !locked {
		return fmt.Errorf("sync already in progress")
	}
	defer redis.RedisClient.Unlock(lockKey)

	syncID := fmt.Sprintf("SYNC-%d-%d-%d", sourceWarehouseID, targetWarehouseID, time.Now().Unix())

	syncLog := &models.SyncLog{
		SourceWarehouseID: sourceWarehouseID,
		TargetWarehouseID: targetWarehouseID,
		ProductID:         productID,
		Quantity:          int(quantity),
		Status:            "processing",
		SyncID:            syncID,
	}
	models.DB.Create(syncLog)

	tx := models.DB.Begin()

	var sourceInv models.Inventory
	if err := tx.Where("warehouse_id = ? AND product_id = ?", sourceWarehouseID, productID).First(&sourceInv).Error; err != nil {
		tx.Rollback()
		syncLog.Status = "failed"
		syncLog.ErrorMsg = "Source inventory not found"
		models.DB.Save(syncLog)
		return err
	}

	if sourceInv.Quantity < int(quantity) {
		tx.Rollback()
		syncLog.Status = "failed"
		syncLog.ErrorMsg = "Insufficient quantity"
		models.DB.Save(syncLog)
		return fmt.Errorf("insufficient quantity")
	}

	sourceInv.Quantity -= int(quantity)
	if err := tx.Save(&sourceInv).Error; err != nil {
		tx.Rollback()
		syncLog.Status = "failed"
		syncLog.ErrorMsg = err.Error()
		models.DB.Save(syncLog)
		return err
	}

	var targetInv models.Inventory
	err = tx.Where("warehouse_id = ? AND product_id = ?", targetWarehouseID, productID).First(&targetInv).Error
	if err != nil {
		newInv := models.Inventory{
			WarehouseID: targetWarehouseID,
			ProductID:   productID,
			RFIDTag:     fmt.Sprintf("RFID-SYNC-%d", time.Now().Unix()),
			Quantity:    int(quantity),
			BatchNumber: sourceInv.BatchNumber,
			ExpiryDate:  sourceInv.ExpiryDate,
			Status:      "in_stock",
		}
		if err := tx.Create(&newInv).Error; err != nil {
			tx.Rollback()
			syncLog.Status = "failed"
			syncLog.ErrorMsg = err.Error()
			models.DB.Save(syncLog)
			return err
		}
	} else {
		targetInv.Quantity += int(quantity)
		if err := tx.Save(&targetInv).Error; err != nil {
			tx.Rollback()
			syncLog.Status = "failed"
			syncLog.ErrorMsg = err.Error()
			models.DB.Save(syncLog)
			return err
		}
	}

	tx.Commit()

	syncLog.Status = "completed"
	models.DB.Save(syncLog)

	return nil
}

func (s *InventoryService) GetSyncLogs(page, pageSize int) ([]models.SyncLog, int64, error) {
	var logs []models.SyncLog
	var total int64

	models.DB.Model(&models.SyncLog{}).Count(&total)
	offset := (page - 1) * pageSize
	if err := models.DB.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}
