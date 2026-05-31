package main

import (
	"log"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"quantum-key-distribution/api"
	"quantum-key-distribution/config"
	"quantum-key-distribution/database"
	"quantum-key-distribution/quantum"
)

func main() {
	if err := config.Load(); err != nil {
		log.Printf("Warning: %v", err)
	}

	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.CloseDB()

	if err := database.SeedData(); err != nil {
		log.Printf("Warning: Failed to seed data: %v", err)
	}

	quantum.InitRedis()
	defer quantum.CloseRedis()

	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders: []string{"*"},
	}))

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	api.RegisterRoutes(e)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	log.Fatal(e.Start(":" + port))
}
