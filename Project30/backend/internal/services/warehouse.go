package services

import (
	"warehouse-system/internal/models"
	"warehouse-system/pkg/redis"
)

type WarehouseService struct{}

func NewWarehouseService() *WarehouseService {
	return &WarehouseService{}
}

func (s *WarehouseService) GetAllWarehouseList(page, pageSize int) ([]models.Warehouse, int64, error) {
	var warehouses []models.Warehouse
	var total int64

	models.DB.Model(&models.Warehouse{}).Count(&total)
	offset := (page - 1) * pageSize
	if err := models.DB.Offset(offset).Limit(pageSize).Find(&warehouses).Error; err != nil {
		return nil, 0, err
	}

	return warehouses, total, nil
}

func (s *WarehouseService) GetWarehouseByID(id uint) (*models.Warehouse, error) {
	var warehouse models.Warehouse
	if err := models.DB.First(&warehouse, id).Error; err != nil {
		return nil, err
	}
	return &warehouse, nil
}

func (s *WarehouseService) CreateWarehouse(warehouse *models.Warehouse) error {
	return models.DB.Create(warehouse).Error
}

func (s *WarehouseService) UpdateWarehouse(warehouse *models.Warehouse) error {
	return models.DB.Save(warehouse).Error
}

func (s *WarehouseService) DeleteWarehouse(id uint) error {
	return models.DB.Delete(&models.Warehouse{}, id).Error
}

func (s *WarehouseService) GetQuotaUsage(warehouseID uint) (map[string]interface{}, error) {
	warehouse := &models.Warehouse{}
	if err := models.DB.First(warehouse, warehouseID).Error; err != nil {
		return nil, err
	}

	remainingQuota := warehouse.BondedQuota - warehouse.UsedQuota
	usagePercent := 0.0
	if warehouse.BondedQuota > 0 {
		usagePercent = (warehouse.UsedQuota / warehouse.BondedQuota) * 100
	}

	return map[string]interface{}{
		"warehouse_id":    warehouse.ID,
		"warehouse_name":  warehouse.Name,
		"total_quota":     warehouse.BondedQuota,
		"used_quota":      warehouse.UsedQuota,
		"remaining_quota": remainingQuota,
		"usage_percent":   usagePercent,
	}, nil
}

func (s *WarehouseService) GetQuotaTransactions(warehouseID uint, page, pageSize int) ([]models.QuotaTransaction, int64, error) {
	var transactions []models.QuotaTransaction
	var total int64

	query := models.DB.Model(&models.QuotaTransaction{})
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&transactions).Error; err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}

func (s *WarehouseService) GetDashboardStats() (map[string]interface{}, error) {
	var totalWarehouses int64
	var totalProducts int64
	var totalInventory int64
	var totalInventoryValue float64

	models.DB.Model(&models.Warehouse{}).Count(&totalWarehouses)
	models.DB.Model(&models.Product{}).Count(&totalProducts)
	
	var inventories []models.Inventory
	models.DB.Preload("Product").Find(&inventories)
	
	for _, inv := range inventories {
		totalInventory += int64(inv.Quantity)
		totalInventoryValue += float64(inv.Quantity) * inv.Product.Price
	}

	var totalBondedQuota float64
	var totalUsedQuota float64
	var warehouses []models.Warehouse
	models.DB.Find(&warehouses)
	for _, w := range warehouses {
		totalBondedQuota += w.BondedQuota
		totalUsedQuota += w.UsedQuota
	}

	cacheKey := "dashboard:stats"
	stats := map[string]interface{}{
		"total_warehouses":    totalWarehouses,
		"total_products":     totalProducts,
		"total_inventory":    totalInventory,
		"total_inventory_value": totalInventoryValue,
		"total_bonded_quota":  totalBondedQuota,
		"total_used_quota":   totalUsedQuota,
		"quota_usage_percent":  (totalUsedQuota / totalBondedQuota) * 100,
	}
	
	redis.RedisClient.SetCache(cacheKey, stats, 300)

	return stats, nil
}

func (s *WarehouseService) GetWarehouseInventoryStats(warehouseID uint) (map[string]interface{}, error) {
	var totalItems int64
	var totalValue float64
	var categoryStats = make(map[string]int)

	var inventories []models.Inventory
	query := models.DB.Preload("Product")
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}
	query.Find(&inventories)

	for _, inv := range inventories {
		totalItems += int64(inv.Quantity)
		totalValue += float64(inv.Quantity) * inv.Product.Price
		categoryStats[inv.Product.Category] += inv.Quantity
	}

	return map[string]interface{}{
		"total_items":     totalItems,
		"total_value":     totalValue,
		"category_stats":  categoryStats,
	}, nil
}
