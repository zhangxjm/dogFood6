package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"edge-computing-platform/config"
	"edge-computing-platform/db"
	"edge-computing-platform/handlers"
	"edge-computing-platform/middleware"
	"edge-computing-platform/services"

	"github.com/labstack/echo/v4"
)

func main() {
	cfg := config.LoadConfig()

	if err := db.Init(cfg.DBPath); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	redisSvc := services.NewRedisService(cfg.RedisHost, cfg.RedisPort)
	defer redisSvc.Close()

	for i := 0; i < 10; i++ {
		if err := redisSvc.Ping(); err != nil {
			log.Printf("Waiting for Redis... (attempt %d/10): %v", i+1, err)
			time.Sleep(2 * time.Second)
		} else {
			log.Println("Connected to Redis successfully")
			break
		}
	}

	edgeSvc := services.NewEdgeService(redisSvc)

	if err := edgeSvc.SeedData(); err != nil {
		log.Printf("Seed data error: %v", err)
	}

	h := handlers.NewHandler(edgeSvc)

	e := echo.New()
	e.HideBanner = true

	e.Use(middleware.Logger())
	e.Use(middleware.CORS())

	e.GET("/api/health", h.HealthCheck)

	e.GET("/api/product-lines", h.GetProductLines)
	e.POST("/api/product-lines", h.CreateProductLine)
	e.PUT("/api/product-lines/:id", h.UpdateProductLine)
	e.DELETE("/api/product-lines/:id", h.DeleteProductLine)

	e.GET("/api/devices", h.GetDevices)
	e.GET("/api/devices/:id", h.GetDevice)
	e.POST("/api/devices", h.CreateDevice)
	e.PUT("/api/devices/:id", h.UpdateDevice)
	e.DELETE("/api/devices/:id", h.DeleteDevice)
	e.PUT("/api/devices/:id/status", h.UpdateDeviceStatus)

	e.GET("/api/tasks", h.GetTasks)
	e.POST("/api/tasks", h.CreateTask)
	e.PUT("/api/tasks/:id", h.UpdateTask)
	e.DELETE("/api/tasks/:id", h.DeleteTask)

	e.GET("/api/sensor-data", h.GetSensorData)
	e.POST("/api/sensor-data/ingest", h.IngestSensorData)

	e.GET("/api/logs", h.GetLogs)

	e.GET("/api/offline-cache", h.GetOfflineCache)
	e.POST("/api/offline-cache/sync", h.SyncCache)

	e.GET("/api/system-stats", h.GetSystemStats)

	e.POST("/api/gateway/ingest", h.GatewayIngest)

	go simulateData(edgeSvc, redisSvc)

	go syncCachePeriodically(edgeSvc)

	go func() {
		addr := fmt.Sprintf(":%s", cfg.ServerPort)
		log.Printf("Edge Computing Platform starting on %s", addr)
		if err := e.Start(addr); err != nil {
			log.Printf("Server shutdown: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := e.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server stopped")
}

func simulateData(edgeSvc *services.EdgeService, redisSvc *services.RedisService) {
	devices, _ := edgeSvc.GetAllDevices()
	if len(devices) == 0 {
		return
	}

	metrics := []struct {
		Name string
		Unit string
		Min  float64
		Max  float64
	}{
		{"temperature", "C", 20, 85},
		{"pressure", "kPa", 100, 500},
		{"vibration", "mm/s", 0.1, 10},
		{"current", "A", 1, 50},
		{"rpm", "rpm", 100, 3000},
	}

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		for _, device := range devices {
			if device.Status != "offline" {
				m := metrics[time.Now().Unix()%int64(len(metrics))]
				value := m.Min + float64(time.Now().UnixNano()%int64(m.Max-m.Min))

				edgeSvc.InsertSensorData(device.ID, m.Name, value, m.Unit)

				status := map[string]interface{}{
					"device_id": device.ID,
					"metric":    m.Name,
					"value":     value,
					"unit":      m.Unit,
					"timestamp": time.Now(),
				}
				data, _ := json.Marshal(status)
				redisSvc.PublishMetric("sensor_metrics", string(data))
			}
		}

		if time.Now().Second()%15 == 0 {
			dev := devices[time.Now().Unix()%int64(len(devices))]
			cpu := 30 + float64(time.Now().Unix()%40)
			mem := 40 + float64(time.Now().Unix()%35)
			edgeSvc.UpdateDeviceStatus(dev.ID, cpu, mem)

			deviceStatus := map[string]interface{}{
				"device_id":   dev.ID,
				"cpu_usage":   cpu,
				"memory_usage": mem,
				"status":      "online",
			}
			redisSvc.SetDeviceStatus(dev.ID, deviceStatus)
		}
	}
}

func syncCachePeriodically(edgeSvc *services.EdgeService) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		if err := edgeSvc.SyncOfflineCache(); err != nil {
			log.Printf("Cache sync error: %v", err)
		}
	}
}
