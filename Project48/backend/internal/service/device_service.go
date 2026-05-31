package service

import (
	"context"
	"iiot-predictive-maintenance/internal/model"
	"iiot-predictive-maintenance/internal/pkg/influxdb"
	"iiot-predictive-maintenance/internal/repository"
	"time"
)

type DeviceService struct {
	repo *repository.DeviceRepository
}

func NewDeviceService() *DeviceService {
	return &DeviceService{
		repo: repository.NewDeviceRepository(),
	}
}

func (s *DeviceService) List(page, pageSize int, keyword, status, deviceType string) (int64, []model.Device, error) {
	total, devices, err := s.repo.List(page, pageSize, keyword, status, deviceType)
	if err != nil {
		return 0, nil, err
	}

	for i := range devices {
		s.enrichDeviceWithSensorData(&devices[i])
	}

	return total, devices, nil
}

func (s *DeviceService) GetByID(id uint) (*model.Device, error) {
	device, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	s.enrichDeviceWithSensorData(device)
	return device, nil
}

func (s *DeviceService) enrichDeviceWithSensorData(device *model.Device) {
	sensorNames := make([]string, len(device.Sensors))
	for i, sensor := range device.Sensors {
		sensorNames[i] = sensor.Name
	}

	ctx := context.Background()
	data, err := influxdb.QueryLatestData(ctx, device.ID, sensorNames)
	if err == nil && data != nil {
		for i := range device.Sensors {
			if val, ok := data.Values[device.Sensors[i].Name]; ok {
				device.Sensors[i].CurrentValue = val
			}
		}
	}
}

func (s *DeviceService) Create(device *model.Device) error {
	return s.repo.Create(device)
}

func (s *DeviceService) Update(device *model.Device) error {
	return s.repo.Update(device)
}

func (s *DeviceService) Delete(id uint) error {
	return s.repo.Delete(id)
}

func (s *DeviceService) GetStats() (*model.DeviceStats, error) {
	return s.repo.GetStats()
}

func (s *DeviceService) GetRealtimeData(id uint) (*model.RealtimeDataResponse, error) {
	device, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	sensorNames := make([]string, len(device.Sensors))
	for i, sensor := range device.Sensors {
		sensorNames[i] = sensor.Name
	}

	ctx := context.Background()
	data, err := influxdb.QueryLatestData(ctx, id, sensorNames)
	if err != nil {
		return nil, err
	}

	return &model.RealtimeDataResponse{
		Timestamp: data.Timestamp.Format(time.RFC3339),
		Data:      data.Values,
	}, nil
}

func (s *DeviceService) GetHistoryData(id uint, hours int) (*model.HistoryDataResponse, error) {
	end := time.Now()
	start := end.Add(-time.Hour * time.Duration(hours))

	ctx := context.Background()
	seriesData, err := influxdb.QueryData(ctx, id, start, end)
	if err != nil {
		return nil, err
	}

	timestamps := make([]string, len(seriesData))
	data := make(map[string][]float64)

	for i, point := range seriesData {
		timestamps[i] = point.Timestamp.Format(time.RFC3339)
		for name, value := range point.Values {
			if _, ok := data[name]; !ok {
				data[name] = make([]float64, len(seriesData))
			}
			data[name][i] = value
		}
	}

	return &model.HistoryDataResponse{
		Timestamps: timestamps,
		Data:       data,
	}, nil
}

func (s *DeviceService) GetHealthTrend(days int) (map[string]interface{}, error) {
	end := time.Now()
	start := end.AddDate(0, 0, -days)
	points := days

	timestamps := make([]string, points)
	avgHealth := make([]float64, points)

	for i := 0; i < points; i++ {
		date := start.AddDate(0, 0, i)
		timestamps[i] = date.Format("2006-01-02")

		baseHealth := 88.0
		variation := 8.0
		if i > points*3/4 {
			baseHealth = 82.0
		}
		avgHealth[i] = baseHealth + (float64(i%5)-2)*variation/5
	}

	return map[string]interface{}{
		"timestamps": timestamps,
		"avgHealth":  avgHealth,
	}, nil
}

func (s *DeviceService) CalculateHealthScore(deviceID uint) (int, error) {
	device, err := s.repo.GetByID(deviceID)
	if err != nil {
		return 0, err
	}

	score := 100

	sensorNames := make([]string, len(device.Sensors))
	for i, sensor := range device.Sensors {
		sensorNames[i] = sensor.Name
	}

	ctx := context.Background()
	data, err := influxdb.QueryLatestData(ctx, deviceID, sensorNames)
	if err == nil && data != nil {
		for _, sensor := range device.Sensors {
			if val, ok := data.Values[sensor.Name]; ok {
				rangeSize := sensor.MaxValue - sensor.MinValue
				normalized := (val - sensor.MinValue) / rangeSize

				if normalized > 0.9 || normalized < 0.1 {
					score -= 15
				} else if normalized > 0.75 || normalized < 0.25 {
					score -= 5
				}
			}
		}
	}

	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}

	_ = s.repo.UpdateHealthScore(deviceID, score)

	status := "online"
	if score < 60 {
		status = "error"
	} else if score < 80 {
		status = "warning"
	}
	_ = s.repo.UpdateStatus(deviceID, status)

	return score, nil
}

func (s *DeviceService) GetAll() ([]model.Device, error) {
	return s.repo.GetAll()
}
