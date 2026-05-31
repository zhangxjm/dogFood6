package main

import (
	"context"
	"encoding/json"
	"fmt"
	"iiot-predictive-maintenance/internal/config"
	"iiot-predictive-maintenance/internal/pkg/influxdb"
	"iiot-predictive-maintenance/internal/repository"
	"math/rand"
	"time"
)

func main() {
	if err := config.Load(); err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		return
	}

	if err := influxdb.Init(); err != nil {
		fmt.Printf("Failed to initialize InfluxDB: %v\n", err)
		return
	}

	deviceRepo := repository.NewDeviceRepository()
	devices, err := deviceRepo.GetAll()
	if err != nil {
		fmt.Printf("Failed to get devices: %v\n", err)
		return
	}

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	fmt.Println("IoT data simulation started...")
	fmt.Printf("Monitoring %d devices\n", len(devices))

	for range ticker.C {
		ctx := context.Background()
		now := time.Now()

		for _, device := range devices {
			sensorNames := make([]string, len(device.Sensors))
			for i, s := range device.Sensors {
				sensorNames[i] = s.Name
			}

			values := make(map[string]float64)
			for _, sensor := range device.Sensors {
				baseValue := (sensor.MinValue + sensor.MaxValue) / 2
				rangeSize := sensor.MaxValue - sensor.MinValue
				variation := rangeSize * 0.05
				value := baseValue + (rand.Float64()-0.5)*variation

				if device.HealthScore < 70 {
					value = baseValue * 1.15
				}

				values[sensor.Name] = value
			}

			data := influxdb.TimeSeriesData{
				DeviceID:  device.ID,
				Timestamp: now,
				Values:    values,
			}

			if err := influxdb.WriteData(ctx, data); err != nil {
				fmt.Printf("Failed to write data for device %d: %v\n", device.ID, err)
			} else {
				jsonData, _ := json.Marshal(values)
				fmt.Printf("[%s] Device %s: %s\n", now.Format("15:04:05"), device.Name, string(jsonData))
			}
		}
	}
}
