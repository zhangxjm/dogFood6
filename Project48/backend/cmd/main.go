package main

import (
	"fmt"
	"iiot-predictive-maintenance/internal/api"
	"iiot-predictive-maintenance/internal/config"
	"iiot-predictive-maintenance/internal/pkg/database"
	"iiot-predictive-maintenance/internal/pkg/influxdb"
	"iiot-predictive-maintenance/internal/service"
	"log"
)

func main() {
	if err := config.Load(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := database.Init(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	log.Println("Database initialized successfully")

	if err := influxdb.Init(); err != nil {
		log.Fatalf("Failed to initialize InfluxDB: %v", err)
	}

	if err := seedInitialData(); err != nil {
		log.Fatalf("Failed to seed initial data: %v", err)
	}
	log.Println("Initial data seeded successfully")

	if err := initializeBusinessData(); err != nil {
		log.Printf("Warning: Failed to initialize business data: %v", err)
	}
	log.Println("Business data initialized successfully")

	r := api.SetupRouter()

	addr := fmt.Sprintf("%s:%s", config.AppConfig.Server.Host, config.AppConfig.Server.Port)
	log.Printf("Server starting on %s", addr)
	log.Printf("API Documentation: http://%s/api", addr)
	log.Printf("Default admin account: admin / admin123")

	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func seedInitialData() error {
	authService := service.NewAuthService()
	users, _ := authService.ListUsers()
	if len(users) > 0 {
		return nil
	}

	deviceService := service.NewDeviceService()
	devices, _ := deviceService.GetAll()
	if len(devices) > 0 {
		return nil
	}

	initScript := &InitDataSeeder{}
	return initScript.Seed()
}

func initializeBusinessData() error {
	predictionService := service.NewPredictionService()
	if err := predictionService.InitializePredictions(); err != nil {
		return err
	}

	maintenanceService := service.NewMaintenanceService()
	if err := maintenanceService.InitializePlans(); err != nil {
		return err
	}

	return nil
}
