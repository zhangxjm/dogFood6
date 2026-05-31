package api

import (
	"iiot-predictive-maintenance/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORS())

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			authHandler := NewAuthHandler()
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.Auth(), authHandler.GetCurrentUser)
			auth.GET("/users", middleware.Auth(), middleware.AdminRequired(), authHandler.ListUsers)
		}

		devices := api.Group("/devices")
		devices.Use(middleware.Auth())
		{
			deviceHandler := NewDeviceHandler()
			devices.GET("", deviceHandler.List)
			devices.GET("/stats", deviceHandler.GetStats)
			devices.GET("/health-trend", deviceHandler.GetHealthTrend)
			devices.GET("/:id", deviceHandler.GetByID)
			devices.POST("", middleware.AdminRequired(), deviceHandler.Create)
			devices.PUT("/:id", middleware.AdminRequired(), deviceHandler.Update)
			devices.DELETE("/:id", middleware.AdminRequired(), deviceHandler.Delete)
			devices.GET("/:id/realtime", deviceHandler.GetRealtimeData)
			devices.GET("/:id/history", deviceHandler.GetHistoryData)
		}

		predictions := api.Group("/predictions")
		predictions.Use(middleware.Auth())
		{
			predictionHandler := NewPredictionHandler()
			predictions.GET("", predictionHandler.List)
			predictions.GET("/stats", predictionHandler.GetStats)
			predictions.GET("/high-risk", predictionHandler.GetHighRisk)
			predictions.GET("/model-info", predictionHandler.GetModelInfo)
			predictions.GET("/:id/series", predictionHandler.GetPredictionSeries)
			predictions.POST("/predict", predictionHandler.Predict)
			predictions.POST("/predict-all", middleware.ManagerRequired(), predictionHandler.PredictAll)
		}

		maintenance := api.Group("/maintenance")
		maintenance.Use(middleware.Auth())
		{
			maintenanceHandler := NewMaintenanceHandler()
			maintenance.GET("/plans", maintenanceHandler.ListPlans)
			maintenance.GET("/plans/stats", maintenanceHandler.GetStats)
			maintenance.GET("/plans/calendar", maintenanceHandler.GetCalendarData)
			maintenance.GET("/plans/:id", maintenanceHandler.GetPlanByID)
			maintenance.POST("/plans", middleware.ManagerRequired(), maintenanceHandler.CreatePlan)
			maintenance.PUT("/plans/:id", middleware.ManagerRequired(), maintenanceHandler.UpdatePlan)
			maintenance.DELETE("/plans/:id", middleware.ManagerRequired(), maintenanceHandler.DeletePlan)
			maintenance.PATCH("/plans/:id/status", maintenanceHandler.UpdatePlanStatus)
			maintenance.POST("/plans/:id/execute", maintenanceHandler.ExecutePlan)
			maintenance.POST("/plans/generate", middleware.ManagerRequired(), maintenanceHandler.GeneratePlans)
			maintenance.GET("/records", maintenanceHandler.GetRecords)
		}

		inventory := api.Group("/inventory")
		inventory.Use(middleware.Auth())
		{
			inventoryHandler := NewInventoryHandler()
			inventory.GET("/parts", inventoryHandler.ListParts)
			inventory.GET("/parts/stats", inventoryHandler.GetStats)
			inventory.GET("/parts/alerts", inventoryHandler.GetAlerts)
			inventory.GET("/parts/purchase-suggestions", inventoryHandler.GetPurchaseSuggestions)
			inventory.GET("/parts/:id", inventoryHandler.GetPartByID)
			inventory.POST("/parts", middleware.ManagerRequired(), inventoryHandler.CreatePart)
			inventory.PUT("/parts/:id", middleware.ManagerRequired(), inventoryHandler.UpdatePart)
			inventory.DELETE("/parts/:id", middleware.ManagerRequired(), inventoryHandler.DeletePart)
			inventory.POST("/parts/:id/add-stock", inventoryHandler.AddStock)
			inventory.POST("/parts/:id/consume", inventoryHandler.ConsumePart)
			inventory.GET("/parts/:id/usage-trend", inventoryHandler.GetUsageTrend)
			inventory.GET("/transactions", inventoryHandler.GetTransactions)
		}

		ws := api.Group("/ws")
		ws.Use(middleware.Auth())
		{
			tsHandler := NewTimeSeriesHandler()
			ws.GET("/timeseries/:id", tsHandler.WebSocket)
		}
	}

	return r
}
