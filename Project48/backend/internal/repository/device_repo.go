package repository

import (
	"iiot-predictive-maintenance/internal/model"
	"iiot-predictive-maintenance/internal/pkg/database"
	"time"
)

type DeviceRepository struct{}

func NewDeviceRepository() *DeviceRepository {
	return &DeviceRepository{}
}

func (r *DeviceRepository) List(page, pageSize int, keyword, status, deviceType string) (int64, []model.Device, error) {
	var total int64
	var devices []model.Device

	query := database.DB.Model(&model.Device{})

	if keyword != "" {
		query = query.Where("name LIKE ? OR code LIKE ? OR location LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if deviceType != "" {
		query = query.Where("type = ?", deviceType)
	}

	if err := query.Count(&total).Error; err != nil {
		return 0, nil, err
	}

	offset := (page - 1) * pageSize
	err := query.Preload("Sensors").Offset(offset).Limit(pageSize).Find(&devices).Error

	return total, devices, err
}

func (r *DeviceRepository) GetByID(id uint) (*model.Device, error) {
	var device model.Device
	err := database.DB.Preload("Sensors").First(&device, id).Error
	if err != nil {
		return nil, err
	}
	return &device, nil
}

func (r *DeviceRepository) Create(device *model.Device) error {
	return database.DB.Create(device).Error
}

func (r *DeviceRepository) Update(device *model.Device) error {
	return database.DB.Save(device).Error
}

func (r *DeviceRepository) Delete(id uint) error {
	return database.DB.Delete(&model.Device{}, id).Error
}

func (r *DeviceRepository) GetStats() (*model.DeviceStats, error) {
	var stats model.DeviceStats

	database.DB.Model(&model.Device{}).Count(&stats.Total)
	database.DB.Model(&model.Device{}).Where("status = ?", "online").Count(&stats.Online)
	database.DB.Model(&model.Device{}).Where("status = ?", "warning").Count(&stats.Warning)
	database.DB.Model(&model.Device{}).Where("status = ?", "error").Count(&stats.Error)

	var avgHealth *float64
	database.DB.Model(&model.Device{}).Select("AVG(health_score)").Row().Scan(&avgHealth)
	if avgHealth != nil {
		stats.AvgHealth = *avgHealth
	}

	return &stats, nil
}

func (r *DeviceRepository) GetAll() ([]model.Device, error) {
	var devices []model.Device
	err := database.DB.Preload("Sensors").Find(&devices).Error
	return devices, err
}

func (r *DeviceRepository) UpdateHealthScore(id uint, score int) error {
	return database.DB.Model(&model.Device{}).Where("id = ?", id).Update("health_score", score).Error
}

func (r *DeviceRepository) UpdateStatus(id uint, status string) error {
	return database.DB.Model(&model.Device{}).Where("id = ?", id).Update("status", status).Error
}

func (r *DeviceRepository) UpdateLastMaintenance(id uint, t time.Time) error {
	return database.DB.Model(&model.Device{}).Where("id = ?", id).Update("last_maintenance", t).Error
}
