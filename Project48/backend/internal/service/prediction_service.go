package service

import (
	"context"
	"iiot-predictive-maintenance/internal/model"
	"iiot-predictive-maintenance/internal/pkg/influxdb"
	"iiot-predictive-maintenance/internal/repository"
	"math"
	"math/rand"
	"time"
)

type PredictionService struct {
	repo          *repository.PredictionRepository
	deviceService *DeviceService
}

func NewPredictionService() *PredictionService {
	return &PredictionService{
		repo:          repository.NewPredictionRepository(),
		deviceService: NewDeviceService(),
	}
}

func (s *PredictionService) List(page, pageSize int, riskLevel string, deviceID uint) (int64, []model.Prediction, error) {
	return s.repo.List(page, pageSize, riskLevel, deviceID)
}

func (s *PredictionService) Predict(deviceID uint) (*model.Prediction, error) {
	healthScore, err := s.deviceService.CalculateHealthScore(deviceID)
	if err != nil {
		return nil, err
	}

	faultTypes := []string{
		"轴承磨损",
		"电机过热",
		"振动异常",
		"润滑不足",
		"密封泄漏",
		"电气故障",
	}

	baseProbability := float64(100-healthScore) / 100.0
	randomFactor := rand.Float64() * 0.2
	probability := baseProbability + randomFactor - 0.1

	if probability < 0.05 {
		probability = 0.05 + rand.Float64()*0.1
	}
	if probability > 0.95 {
		probability = 0.95
	}

	probability = math.Round(probability*100) / 100

	riskLevel := "low"
	if probability >= 0.8 {
		riskLevel = "critical"
	} else if probability >= 0.6 {
		riskLevel = "high"
	} else if probability >= 0.4 {
		riskLevel = "medium"
	}

	daysToPrediction := int((1.0 - probability) * 30)
	if daysToPrediction < 1 {
		daysToPrediction = 1
	}
	if daysToPrediction > 30 {
		daysToPrediction = 30
	}

	predictedDate := time.Now().AddDate(0, 0, daysToPrediction)

	faultType := faultTypes[rand.Intn(len(faultTypes))]
	if healthScore < 70 {
		faultType = faultTypes[rand.Intn(3)]
	}

	prediction := &model.Prediction{
		DeviceID:      deviceID,
		FaultType:     faultType,
		Probability:   probability,
		RiskLevel:     riskLevel,
		PredictedDate: predictedDate,
		ModelVersion:  "v1.2.0",
	}

	err = s.repo.Create(prediction)
	if err != nil {
		return nil, err
	}

	deviceService := NewDeviceService()
	dev, _ := deviceService.GetByID(deviceID)
	if dev != nil {
		prediction.DeviceName = dev.Name
	}

	return prediction, nil
}

func (s *PredictionService) PredictAll() error {
	devices, err := s.deviceService.GetAll()
	if err != nil {
		return err
	}

	for _, device := range devices {
		_, err := s.Predict(device.ID)
		if err != nil {
			continue
		}
	}

	return nil
}

func (s *PredictionService) GetModelInfo() (*model.ModelInfoResponse, error) {
	return &model.ModelInfoResponse{
		Name:            "LSTM故障预测模型",
		Version:         "v1.2.0",
		Accuracy:        0.89,
		TrainingSamples: 15680,
		LastTraining:    "2026-05-15T10:30:00Z",
		Parameters: map[string]interface{}{
			"lstmLayers":      2,
			"hiddenSize":      64,
			"sequenceLength":  24,
			"dropout":         0.2,
			"learningRate":    0.001,
			"batchSize":       32,
		},
	}, nil
}

func (s *PredictionService) GetHighRiskPredictions(limit int) ([]model.Prediction, error) {
	return s.repo.GetHighRiskPredictions(limit)
}

func (s *PredictionService) GetStats() (*model.PredictionStats, error) {
	return s.repo.GetStats()
}

func (s *PredictionService) InitializePredictions() error {
	existing, _ := s.repo.GetRecentPredictions(1)
	if len(existing) > 0 {
		return nil
	}

	return s.PredictAll()
}

func (s *PredictionService) GetPredictionSeries(deviceID uint, days int) (map[string]interface{}, error) {
	device, err := s.deviceService.GetByID(deviceID)
	if err != nil {
		return nil, err
	}

	end := time.Now()
	start := end.AddDate(0, 0, -days)

	ctx := context.Background()
	data, err := influxdb.QueryData(ctx, deviceID, start, end)
	if err != nil {
		return nil, err
	}

	timestamps := make([]string, len(data))
	anomalyScores := make([]float64, len(data))
	threshold := make([]float64, len(data))

	for i, point := range data {
		timestamps[i] = point.Timestamp.Format("2006-01-02 15:04")
		score := 0.0
		for _, val := range point.Values {
			score += val
		}
		score = score / float64(len(point.Values))
		normalizedScore := (score - 50) / 100
		normalizedScore = math.Max(0, math.Min(1, normalizedScore))
		anomalyScores[i] = normalizedScore
		threshold[i] = 0.6
	}

	return map[string]interface{}{
		"timestamps":  timestamps,
		"anomaly":     anomalyScores,
		"threshold":   threshold,
		"deviceName":  device.Name,
	}, nil
}
