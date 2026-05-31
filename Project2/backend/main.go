package main

import (
	"grain-oil-inventory/config"
	"grain-oil-inventory/models"
	"grain-oil-inventory/routes"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()

	var db *gorm.DB
	var err error

	maxRetries := 10
	for i := 0; i < maxRetries; i++ {
		db, err = gorm.Open(mysql.Open(cfg.GetDSN()), &gorm.Config{})
		if err == nil {
			break
		}
		log.Printf("Failed to connect to database (attempt %d/%d): %v", i+1, maxRetries, err)
		time.Sleep(3 * time.Second)
	}

	if err != nil {
		log.Fatalf("Failed to connect to database after %d attempts: %v", maxRetries, err)
	}

	log.Println("Database connected successfully")

	err = models.AutoMigrate(db)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migration completed")

	err = models.SeedData(db)
	if err != nil {
		log.Fatalf("Failed to seed data: %v", err)
	}
	log.Println("Data initialization completed")

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.Static("/static", "../frontend")
	r.LoadHTMLGlob("../frontend/*.html")

	routes.SetupRoutes(r, db)

	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", nil)
	})

	log.Printf("Server starting on port %s...", cfg.ServerPort)
	log.Printf("Open http://localhost:%s to access the system", cfg.ServerPort)
	err = r.Run(":" + cfg.ServerPort)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
