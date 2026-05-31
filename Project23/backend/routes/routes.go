package routes

import (
	"cross-border-logistics/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		warehouses := api.Group("/warehouses")
		{
			warehouses.GET("", controllers.GetWarehouses)
			warehouses.GET("/:id", controllers.GetWarehouse)
			warehouses.POST("", controllers.CreateWarehouse)
			warehouses.PUT("/:id", controllers.UpdateWarehouse)
			warehouses.DELETE("/:id", controllers.DeleteWarehouse)
		}

		parcels := api.Group("/parcels")
		{
			parcels.GET("", controllers.GetParcels)
			parcels.GET("/:id", controllers.GetParcel)
			parcels.POST("", controllers.CreateParcel)
			parcels.PUT("/:id", controllers.UpdateParcel)
			parcels.DELETE("/:id", controllers.DeleteParcel)
			parcels.GET("/:id/tracking", controllers.GetParcelTracking)
			parcels.POST("/:id/status", controllers.UpdateParcelStatus)
			parcels.POST("/:id/sort", controllers.ProcessSorting)
			parcels.POST("/:id/route", controllers.ProcessRouting)
		}

		stats := api.Group("/statistics")
		{
			stats.GET("", controllers.GetStatistics)
			stats.GET("/activity", controllers.GetRecentActivity)
		}
	}
}
