package routes

import (
	"grain-oil-inventory/controllers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	productCtrl := controllers.NewProductController(db)
	purchaseCtrl := controllers.NewPurchaseController(db)
	saleCtrl := controllers.NewSaleController(db)
	statsCtrl := controllers.NewStatsController(db)

	api := r.Group("/api")
	{
		products := api.Group("/products")
		{
			products.GET("", productCtrl.GetProducts)
			products.GET("/categories", productCtrl.GetCategories)
			products.GET("/low-stock", productCtrl.GetLowStockProducts)
			products.GET("/:id", productCtrl.GetProduct)
			products.POST("", productCtrl.CreateProduct)
			products.PUT("/:id", productCtrl.UpdateProduct)
			products.DELETE("/:id", productCtrl.DeleteProduct)
		}

		purchases := api.Group("/purchases")
		{
			purchases.GET("", purchaseCtrl.GetPurchases)
			purchases.POST("", purchaseCtrl.CreatePurchase)
			purchases.DELETE("/:id", purchaseCtrl.DeletePurchase)
		}

		sales := api.Group("/sales")
		{
			sales.GET("", saleCtrl.GetSales)
			sales.POST("", saleCtrl.CreateSale)
			sales.DELETE("/:id", saleCtrl.DeleteSale)
		}

		stats := api.Group("/stats")
		{
			stats.GET("/monthly", statsCtrl.GetMonthlyStats)
			stats.GET("/overview", statsCtrl.GetOverview)
		}
	}
}
