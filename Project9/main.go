package main

import (
	"fmt"
	"log"

	"classroom-booking-system/database"
	"classroom-booking-system/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	database.Init()

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

	routes.SetupRoutes(r)

	fmt.Println("========================================")
	fmt.Println("  Classroom Booking System Starting...")
	fmt.Println("  Server running at: http://localhost:8080")
	fmt.Println("========================================")

	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
