package repository

import (
	"iiot-predictive-maintenance/internal/model"
	"iiot-predictive-maintenance/internal/pkg/database"
	"time"

	"gorm.io/gorm"
)

type MaintenanceRepository struct{}

func NewMaintenanceRepository() *MaintenanceRepository {
	return &MaintenanceRepository{}
}

func (r *MaintenanceRepository) ListPlans(page, pageSize int, status string, deviceID uint) (int64, []model.MaintenancePlan, error) {
	var total int64
	var plans []model.MaintenancePlan

	query := database.DB.Model(&model.MaintenancePlan{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if deviceID > 0 {
		query = query.Where("device_id = ?", deviceID)
	}

	if err := query.Count(&total).Error; err != nil {
		return 0, nil, err
	}

	offset := (page - 1) * pageSize
	err := query.Preload("Parts").
		Order("scheduled_date DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&plans).Error

	for i := range plans {
		var device model.Device
		database.DB.Select("name").First(&device, plans[i].DeviceID)
		plans[i].DeviceName = device.Name

		if plans[i].AssigneeID != nil {
			var user model.User
			database.DB.Select("name").First(&user, *plans[i].AssigneeID)
			plans[i].AssigneeName = user.Name
		}

		for j := range plans[i].Parts {
			var part model.InventoryPart
			database.DB.Select("name").First(&part, plans[i].Parts[j].PartID)
			plans[i].Parts[j].PartName = part.Name
		}
	}

	return total, plans, err
}

func (r *MaintenanceRepository) GetPlanByID(id uint) (*model.MaintenancePlan, error) {
	var plan model.MaintenancePlan
	err := database.DB.Preload("Parts").First(&plan, id).Error
	if err != nil {
		return nil, err
	}

	var device model.Device
	database.DB.Select("name").First(&device, plan.DeviceID)
	plan.DeviceName = device.Name

	if plan.AssigneeID != nil {
		var user model.User
		database.DB.Select("name").First(&user, *plan.AssigneeID)
		plan.AssigneeName = user.Name
	}

	return &plan, nil
}

func (r *MaintenanceRepository) CreatePlan(plan *model.MaintenancePlan) error {
	return database.DB.Create(plan).Error
}

func (r *MaintenanceRepository) UpdatePlan(plan *model.MaintenancePlan) error {
	return database.DB.Save(plan).Error
}

func (r *MaintenanceRepository) UpdatePlanStatus(id uint, status string) error {
	return database.DB.Model(&model.MaintenancePlan{}).Where("id = ?", id).Update("status", status).Error
}

func (r *MaintenanceRepository) DeletePlan(id uint) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("plan_id = ?", id).Delete(&model.MaintenancePart{}).Error; err != nil {
			return err
		}
		return tx.Delete(&model.MaintenancePlan{}, id).Error
	})
}

func (r *MaintenanceRepository) GetStats() (*model.MaintenanceStats, error) {
	var stats model.MaintenanceStats
	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	weekStart := now.AddDate(0, 0, -int(now.Weekday()))
	weekEnd := weekStart.AddDate(0, 0, 7)

	database.DB.Model(&model.MaintenancePlan{}).Where("status = ?", "pending").Count(&stats.Pending)
	database.DB.Model(&model.MaintenancePlan{}).Where("status = ?", "approved").Count(&stats.Approved)
	database.DB.Model(&model.MaintenancePlan{}).Where("status = ?", "in_progress").Count(&stats.InProgress)
	database.DB.Model(&model.MaintenancePlan{}).Where("status = ?", "completed").Count(&stats.Completed)
	database.DB.Model(&model.MaintenancePlan{}).Where("status NOT IN ? AND scheduled_date < ?", []string{"completed", "cancelled"}, now).Count(&stats.Overdue)
	database.DB.Model(&model.MaintenancePlan{}).Where("scheduled_date >= ? AND scheduled_date < ?", todayStart, todayStart.AddDate(0, 0, 1)).Count(&stats.Today)
	database.DB.Model(&model.MaintenancePlan{}).Where("scheduled_date >= ? AND scheduled_date < ?", weekStart, weekEnd).Count(&stats.ThisWeek)

	return &stats, nil
}

func (r *MaintenanceRepository) GetPlansByDateRange(start, end time.Time) ([]model.MaintenancePlan, error) {
	var plans []model.MaintenancePlan
	err := database.DB.Where("scheduled_date >= ? AND scheduled_date < ?", start, end).
		Preload("Parts").
		Order("scheduled_date ASC").
		Find(&plans).Error

	for i := range plans {
		var device model.Device
		database.DB.Select("name").First(&device, plans[i].DeviceID)
		plans[i].DeviceName = device.Name
	}

	return plans, err
}

func (r *MaintenanceRepository) CreateRecord(record *model.MaintenanceRecord) error {
	return database.DB.Create(record).Error
}

func (r *MaintenanceRepository) GetRecords(deviceID uint, limit int) ([]model.MaintenanceRecord, error) {
	var records []model.MaintenanceRecord
	query := database.DB.Order("completed_at DESC")
	if deviceID > 0 {
		query = query.Where("device_id = ?", deviceID)
	}
	err := query.Limit(limit).Find(&records).Error
	return records, err
}
