package repository

import (
	"iiot-predictive-maintenance/internal/model"
	"iiot-predictive-maintenance/internal/pkg/database"
	"time"
)

type PredictionRepository struct{}

func NewPredictionRepository() *PredictionRepository {
	return &PredictionRepository{}
}

func (r *PredictionRepository) List(page, pageSize int, riskLevel string, deviceID uint) (int64, []model.Prediction, error) {
	var total int64
	var predictions []model.Prediction

	query := database.DB.Model(&model.Prediction{})

	if riskLevel != "" {
		query = query.Where("risk_level = ?", riskLevel)
	}
	if deviceID > 0 {
		query = query.Where("device_id = ?", deviceID)
	}

	if err := query.Count(&total).Error; err != nil {
		return 0, nil, err
	}

	offset := (page - 1) * pageSize
	err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&predictions).Error

	for i := range predictions {
		var device model.Device
		database.DB.Select("name").First(&device, predictions[i].DeviceID)
		predictions[i].DeviceName = device.Name
	}

	return total, predictions, err
}

func (r *PredictionRepository) Create(prediction *model.Prediction) error {
	return database.DB.Create(prediction).Error
}

func (r *PredictionRepository) GetLatestByDevice(deviceID uint) (*model.Prediction, error) {
	var prediction model.Prediction
	err := database.DB.Where("device_id = ?", deviceID).Order("created_at DESC").First(&prediction).Error
	if err != nil {
		return nil, err
	}
	return &prediction, nil
}

func (r *PredictionRepository) GetHighRiskPredictions(limit int) ([]model.Prediction, error) {
	var predictions []model.Prediction
	err := database.DB.Where("risk_level IN ?", []string{"high", "critical"}).
		Order("created_at DESC").
		Limit(limit).
		Find(&predictions).Error

	for i := range predictions {
		var device model.Device
		database.DB.Select("name").First(&device, predictions[i].DeviceID)
		predictions[i].DeviceName = device.Name
	}

	return predictions, err
}

func (r *PredictionRepository) GetStats() (*model.PredictionStats, error) {
	var stats model.PredictionStats

	database.DB.Model(&model.Prediction{}).Where("risk_level = ?", "low").Count(&stats.Low)
	database.DB.Model(&model.Prediction{}).Where("risk_level = ?", "medium").Count(&stats.Medium)
	database.DB.Model(&model.Prediction{}).Where("risk_level = ?", "high").Count(&stats.High)
	database.DB.Model(&model.Prediction{}).Where("risk_level = ?", "critical").Count(&stats.Critical)

	return &stats, nil
}

func (r *PredictionRepository) GetRecentPredictions(days int) ([]model.Prediction, error) {
	var predictions []model.Prediction
	since := time.Now().AddDate(0, 0, -days)
	err := database.DB.Where("created_at >= ?", since).
		Order("created_at DESC").
		Find(&predictions).Error
	return predictions, err
}

func (r *PredictionRepository) DeleteOldPredictions(days int) error {
	since := time.Now().AddDate(0, 0, -days)
	return database.DB.Where("created_at < ?", since).Delete(&model.Prediction{}).Error
}
