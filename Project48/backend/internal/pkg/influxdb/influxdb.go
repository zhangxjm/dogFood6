package influxdb

import (
	"context"
	"fmt"
	"iiot-predictive-maintenance/internal/config"
	"math/rand"
	"time"
)

type TimeSeriesData struct {
	DeviceID  uint
	Timestamp time.Time
	Values    map[string]float64
}

var IsMockMode = true

func Init() error {
	if config.AppConfig.InfluxDB.Token == "" {
		IsMockMode = true
		return nil
	}
	IsMockMode = false
	return nil
}

func WriteData(ctx context.Context, data TimeSeriesData) error {
	if IsMockMode {
		return nil
	}
	return nil
}

func QueryData(ctx context.Context, deviceID uint, start, end time.Time) ([]TimeSeriesData, error) {
	if IsMockMode {
		return mockQueryData(deviceID, start, end), nil
	}
	return nil, nil
}

func QueryLatestData(ctx context.Context, deviceID uint, sensorNames []string) (*TimeSeriesData, error) {
	if IsMockMode {
		return mockLatestData(deviceID, sensorNames), nil
	}
	return nil, nil
}

func mockQueryData(deviceID uint, start, end time.Time) []TimeSeriesData {
	duration := end.Sub(start)
	points := int(duration.Hours())
	if points > 168 {
		points = 168
	}
	if points < 24 {
		points = 24
	}

	interval := duration / time.Duration(points)
	result := make([]TimeSeriesData, points)

	baseValues := getBaseValues(deviceID)

	for i := 0; i < points; i++ {
		timestamp := start.Add(interval * time.Duration(i))
		values := make(map[string]float64)
		for name, base := range baseValues {
			variation := base * 0.1
			values[name] = base + (rand.Float64()-0.5)*variation
			if i > points*3/4 && deviceID == 5 {
				values[name] = base * 1.3
			}
		}
		result[i] = TimeSeriesData{
			DeviceID:  deviceID,
			Timestamp: timestamp,
			Values:    values,
		}
	}
	return result
}

func mockLatestData(deviceID uint, sensorNames []string) *TimeSeriesData {
	baseValues := getBaseValues(deviceID)
	values := make(map[string]float64)
	for _, name := range sensorNames {
		if base, ok := baseValues[name]; ok {
			variation := base * 0.05
			values[name] = base + (rand.Float64()-0.5)*variation
		}
	}
	return &TimeSeriesData{
		DeviceID:  deviceID,
		Timestamp: time.Now(),
		Values:    values,
	}
}

func getBaseValues(deviceID uint) map[string]float64 {
	switch deviceID {
	case 1:
		return map[string]float64{
			"主轴温度":   45.0,
			"振动幅度":   2.5,
			"主轴转速":   3500.0,
			"负载电流":   28.0,
		}
	case 2:
		return map[string]float64{
			"关节1温度": 38.0,
			"关节2温度": 42.0,
			"TCP速度":  0.8,
		}
	case 3:
		return map[string]float64{
			"排气压力": 0.8,
			"油温":   65.0,
			"电机电流": 68.0,
		}
	case 4:
		return map[string]float64{
			"皮带张力": 280.0,
			"电机转速": 960.0,
		}
	case 5:
		return map[string]float64{
			"料筒温度": 245.0,
			"注射压力": 145.0,
			"锁模力":  3800.0,
		}
	case 6:
		return map[string]float64{
			"激光器温度": 26.0,
			"激光功率": 1500.0,
			"切割头位置": 1450.0,
		}
	default:
		return map[string]float64{
			"temperature": 25.0,
			"pressure":    1.0,
		}
	}
}

func GetSensorKey(name string, deviceID uint) string {
	return fmt.Sprintf("dev_%d_%s", deviceID, name)
}
