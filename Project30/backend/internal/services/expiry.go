package services

import (
	"time"

	"warehouse-system/internal/models"
	"warehouse-system/pkg/redis"
)

type ExpiryService struct{}

func NewExpiryService() *ExpiryService {
	return &ExpiryService{}
}

func (s *ExpiryService) CheckAndGenerateAlerts() error {
	now := time.Now()
	warningDays := 30
	criticalDays := 7

	var inventories []models.Inventory
	if err := models.DB.Where("status = ? AND expiry_date IS NOT NULL", "in_stock").Find(&inventories).Error; err != nil {
		return err
	}

	for _, inv := range inventories {
		if inv.ExpiryDate == nil {
			continue
		}

		daysLeft := int(inv.ExpiryDate.Sub(now).Hours() / 24)

		if daysLeft <= warningDays {
			var existingAlert models.ExpiryAlert
			result := models.DB.Where("inventory_id = ? AND status = ?", inv.ID, "active").First(&existingAlert)
			
			if result.Error != nil {
				level := "warning"
				if daysLeft <= criticalDays {
					level = "critical"
				}

				alert := &models.ExpiryAlert{
					WarehouseID: inv.WarehouseID,
					ProductID:   inv.ProductID,
					InventoryID: inv.ID,
					DaysLeft:    daysLeft,
					Quantity:    inv.Quantity,
					Level:       level,
					Status:      "active",
				}
				models.DB.Create(alert)

				redis.RedisClient.Publish("expiry_alerts", alert)
			} else {
				existingAlert.DaysLeft = daysLeft
				if daysLeft <= criticalDays {
					existingAlert.Level = "critical"
				}
				models.DB.Save(&existingAlert)
			}
		}
	}

	return nil
}

func (s *ExpiryService) GetActiveAlerts(warehouseID uint, level string, page, pageSize int) ([]models.ExpiryAlert, int64, error) {
	var alerts []models.ExpiryAlert
	var total int64

	query := models.DB.Model(&models.ExpiryAlert{}).Preload("Product").Preload("Inventory").Where("status = ?", "active")
	if warehouseID > 0 {
		query = query.Where("warehouse_id = ?", warehouseID)
	}
	if level != "" {
		query = query.Where("level = ?", level)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Order("level desc, days_left asc").Offset(offset).Limit(pageSize).Find(&alerts).Error; err != nil {
		return nil, 0, err
	}

	return alerts, total, nil
}

func (s *ExpiryService) ResolveAlert(id uint) error {
	alert := &models.ExpiryAlert{}
	if err := models.DB.First(alert, id).Error; err != nil {
		return err
	}

	alert.Status = "resolved"
	return models.DB.Save(alert).Error
}

func (s *ExpiryService) GetAlertStats() (map[string]interface{}, error) {
	var warningCount int64
	var criticalCount int64

	models.DB.Model(&models.ExpiryAlert{}).Where("status = ? AND level = ?", "active", "warning").Count(&warningCount)
	models.DB.Model(&models.ExpiryAlert{}).Where("status = ? AND level = ?", "active", "critical").Count(&criticalCount)

	return map[string]interface{}{
		"warning_count":  warningCount,
		"critical_count": criticalCount,
		"total_active":   warningCount + criticalCount,
	}, nil
}
