package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"warehouse-system/internal/config"
	"warehouse-system/internal/handlers"
	"warehouse-system/internal/middleware"
	"warehouse-system/internal/models"
	"warehouse-system/pkg/redis"
)

func main() {
	config.Load()

	models.InitDB()
	models.SeedData()

	if err := redis.Init(); err != nil {
		log.Printf("Warning: Failed to connect to Redis: %v", err)
		log.Println("Continuing without Redis cache...")
	} else {
		log.Println("Redis connected successfully")
	}

	r := gin.Default()
	r.Use(middleware.CORS())

	setupRoutes(r)



	log.Printf("Server starting on port %s", config.AppConfig.ServerPort)
	r.Run(":" + config.AppConfig.ServerPort)
}

func setupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")

	dashboardHandler := handlers.NewDashboardHandler()
	api.GET("/dashboard/stats", dashboardHandler.GetStats)

	warehouseHandler := handlers.NewWarehouseHandler()
	warehouses := api.Group("/warehouses")
	{
		warehouses.GET("", warehouseHandler.List)
		warehouses.GET("/:id", warehouseHandler.Get)
		warehouses.POST("", warehouseHandler.Create)
		warehouses.PUT("/:id", warehouseHandler.Update)
		warehouses.DELETE("/:id", warehouseHandler.Delete)
		warehouses.GET("/:id/quota", warehouseHandler.GetQuotaUsage)
		warehouses.GET("/:id/quota/transactions", warehouseHandler.GetQuotaTransactions)
		warehouses.GET("/:id/inventory-stats", warehouseHandler.GetInventoryStats)
	}

	productHandler := handlers.NewProductHandler()
	products := api.Group("/products")
	{
		products.GET("", productHandler.List)
		products.GET("/categories", productHandler.GetCategories)
		products.GET("/search", productHandler.Search)
		products.GET("/:id", productHandler.Get)
		products.POST("", productHandler.Create)
		products.PUT("/:id", productHandler.Update)
		products.DELETE("/:id", productHandler.Delete)
	}

	inventoryHandler := handlers.NewInventoryHandler()
	inventories := api.Group("/inventories")
	{
		inventories.GET("", inventoryHandler.List)
		inventories.GET("/:id", inventoryHandler.Get)
		inventories.POST("", inventoryHandler.Create)
		inventories.PUT("/:id", inventoryHandler.Update)
		inventories.DELETE("/:id", inventoryHandler.Delete)
		inventories.POST("/sync", inventoryHandler.Sync)
		inventories.GET("/sync/logs", inventoryHandler.GetSyncLogs)
	}

	stockTake := api.Group("/stocktake")
	{
		stockTake.POST("/:id/auto", inventoryHandler.AutoStockTake)
		stockTake.GET("", inventoryHandler.GetStockTakeList)
	}

	expiryHandler := handlers.NewExpiryHandler()
	expiry := api.Group("/expiry")
	{
		expiry.POST("/check", expiryHandler.CheckAlerts)
		expiry.GET("/alerts", expiryHandler.GetActiveAlerts)
		expiry.POST("/alerts/:id/resolve", expiryHandler.ResolveAlert)
		expiry.GET("/stats", expiryHandler.GetStats)
	}

	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})
}
