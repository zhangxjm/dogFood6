package repository

import (
	"iiot-predictive-maintenance/internal/model"
	"iiot-predictive-maintenance/internal/pkg/database"
)

type InventoryRepository struct{}

func NewInventoryRepository() *InventoryRepository {
	return &InventoryRepository{}
}

func (r *InventoryRepository) ListParts(page, pageSize int, keyword, category string) (int64, []model.InventoryPart, error) {
	var total int64
	var parts []model.InventoryPart

	query := database.DB.Model(&model.InventoryPart{})

	if keyword != "" {
		query = query.Where("name LIKE ? OR sku LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}

	if err := query.Count(&total).Error; err != nil {
		return 0, nil, err
	}

	offset := (page - 1) * pageSize
	err := query.Order("last_updated DESC").Offset(offset).Limit(pageSize).Find(&parts).Error

	return total, parts, err
}

func (r *InventoryRepository) GetPartByID(id uint) (*model.InventoryPart, error) {
	var part model.InventoryPart
	err := database.DB.First(&part, id).Error
	if err != nil {
		return nil, err
	}
	return &part, nil
}

func (r *InventoryRepository) CreatePart(part *model.InventoryPart) error {
	return database.DB.Create(part).Error
}

func (r *InventoryRepository) UpdatePart(part *model.InventoryPart) error {
	return database.DB.Save(part).Error
}

func (r *InventoryRepository) DeletePart(id uint) error {
	return database.DB.Delete(&model.InventoryPart{}, id).Error
}

func (r *InventoryRepository) UpdateQuantity(id uint, quantity int) error {
	return database.DB.Model(&model.InventoryPart{}).Where("id = ?", id).Update("quantity", quantity).Error
}

func (r *InventoryRepository) GetAlerts() ([]model.InventoryAlert, error) {
	var alerts []model.InventoryAlert
	var parts []model.InventoryPart

	err := database.DB.Where("quantity <= safe_stock").Find(&parts).Error
	if err != nil {
		return nil, err
	}

	for _, part := range parts {
		level := "warning"
		if part.Quantity <= part.SafeStock/2 {
			level = "critical"
		}
		alerts = append(alerts, model.InventoryAlert{
			ID:              part.ID,
			PartID:          part.ID,
			PartName:        part.Name,
			CurrentQuantity: part.Quantity,
			SafeStock:       part.SafeStock,
			Shortage:        part.SafeStock - part.Quantity,
			Level:           level,
		})
	}

	return alerts, nil
}

func (r *InventoryRepository) GetStats() (*model.InventoryStats, error) {
	var stats model.InventoryStats

	database.DB.Model(&model.InventoryPart{}).Count(&stats.TotalItems)
	database.DB.Model(&model.InventoryPart{}).Where("quantity <= safe_stock AND quantity > 0").Count(&stats.LowStockItems)
	database.DB.Model(&model.InventoryPart{}).Where("quantity = 0").Count(&stats.OutStockItems)

	return &stats, nil
}

func (r *InventoryRepository) CreateTransaction(tx *model.InventoryTransaction) error {
	return database.DB.Create(tx).Error
}

func (r *InventoryRepository) GetTransactions(partID uint, limit int) ([]model.InventoryTransaction, error) {
	var transactions []model.InventoryTransaction
	query := database.DB.Order("created_at DESC")
	if partID > 0 {
		query = query.Where("part_id = ?", partID)
	}
	err := query.Limit(limit).Find(&transactions).Error
	return transactions, err
}

func (r *InventoryRepository) GetAllParts() ([]model.InventoryPart, error) {
	var parts []model.InventoryPart
	err := database.DB.Find(&parts).Error
	return parts, err
}
