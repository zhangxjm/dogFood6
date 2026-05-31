package main

import (
	"log"
	"cross-border-logistics/config"
	"cross-border-logistics/database"
	"cross-border-logistics/rabbitmq"
	"cross-border-logistics/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()

	database.InitDB()
	database.InitSampleData()

	rabbitmq.InitRabbitMQ()
	defer rabbitmq.Close()

	go rabbitmq.ConsumeMessages()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.SetupRoutes(r)

	log.Printf("Server starting on port %s...", config.AppConfig.ServerPort)
	log.Printf("API Documentation:")
	log.Printf("  GET    /api/warehouses          - List all warehouses")
	log.Printf("  POST   /api/parcels             - Create a new parcel")
	log.Printf("  GET    /api/parcels             - List all parcels")
	log.Printf("  GET    /api/parcels/:id         - Get parcel details")
	log.Printf("  GET    /api/parcels/:id/tracking - Get parcel tracking logs")
	log.Printf("  POST   /api/parcels/:id/sort    - Trigger parcel sorting")
	log.Printf("  POST   /api/parcels/:id/route   - Trigger route planning")
	log.Printf("  GET    /api/statistics          - Get system statistics")

	if err := r.Run(":" + config.AppConfig.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
