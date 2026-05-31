package main

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"bci-rehab/internal/config"
	"bci-rehab/internal/handlers"
	customMiddleware "bci-rehab/internal/middleware"
	ws "bci-rehab/internal/websocket"
	"bci-rehab/pkg/database"
	"bci-rehab/pkg/security"
)

func main() {
	rand.Seed(time.Now().UnixNano())

	config.Load()

	security.Init(config.AppConfig.JWTSecret, config.AppConfig.EncryptionKey)

	if err := database.Init(config.AppConfig.DBPath); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.DB.Close()

	go ws.WsManager.Run()

	e := echo.New()

	e.HideBanner = true
	e.HidePort = true

	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "${time_rfc3339} ${method} ${uri} ${status} ${latency_human}\n",
	}))
	e.Use(middleware.Recover())
	e.Use(customMiddleware.SecurityHeaders())
	e.Use(customMiddleware.CORSMiddleware(config.AppConfig.CORSOrigin))

	api := e.Group("/api")

	api.POST("/login", handlers.Login)
	api.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]interface{}{
			"status":    "ok",
			"timestamp": time.Now(),
			"version":   "1.0.0",
		})
	})

	auth := api.Group("")
	auth.Use(customMiddleware.JWTMiddleware())
	auth.Use(customMiddleware.AuditLog())

	auth.GET("/user/me", handlers.GetCurrentUser)
	auth.PUT("/user/profile", handlers.UpdateUserProfile)
	auth.POST("/user/password", handlers.ChangePassword)

	auth.GET("/patients", handlers.GetPatients, customMiddleware.RoleMiddleware("admin", "doctor"))

	auth.GET("/commands", handlers.GetCommands)

	auth.GET("/dashboard", handlers.GetDashboardStats)

	auth.POST("/sessions", handlers.CreateSession)
	auth.GET("/sessions", handlers.GetSessions)
	auth.PUT("/sessions/:id/end", handlers.EndSession)

	auth.GET("/progress", handlers.GetProgress)
	auth.GET("/analytics", handlers.GetAnalytics)

	auth.GET("/sessions/:sessionId/eeg", handlers.GetEEGData)

	auth.GET("/plans", handlers.GetTrainingPlans)
	auth.POST("/plans", handlers.CreateTrainingPlan)

	e.GET("/ws", handlers.WebSocketHandler)

	address := fmt.Sprintf(":%d", config.AppConfig.Port)
	log.Printf("BCI Rehabilitation System starting on http://localhost%s", address)
	log.Printf("Default accounts:")
	log.Printf("  Admin: admin / password123")
	log.Printf("  Doctor: doctor / password123")
	log.Printf("  Patient: patient1 / password123")

	if err := e.Start(address); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
