package main

import (
	"fmt"
	"log"
	"nft-audit-system/config"
	"nft-audit-system/database"
	"nft-audit-system/routes"
	"nft-audit-system/services"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	if err := config.Load(); err != nil {
		log.Printf("Warning: %v", err)
	}

	if err := database.Init(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	log.Println("Database initialized successfully")

	if err := database.Seed(); err != nil {
		log.Fatalf("Failed to seed database: %v", err)
	}
	log.Println("Database seeded successfully")

	if err := services.InitRedis(); err != nil {
		log.Fatalf("Failed to initialize Redis: %v", err)
	}
	log.Println("Redis initialized successfully")

	services.InitBlockchain()
	log.Println("Blockchain service initialized")

	go services.StartTransactionMonitor()
	log.Println("Transaction monitor started")

	e := echo.New()

	e.HideBanner = true

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{config.App.CORSAllowOrigin},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders: []string{"*"},
	}))

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	routes.Register(e)

	log.Printf("Server starting on %s:%s", config.App.ServerHost, config.App.ServerPort)
	if err := e.Start(fmt.Sprintf("%s:%s", config.App.ServerHost, config.App.ServerPort)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
