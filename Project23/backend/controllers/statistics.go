package controllers

import (
	"net/http"
	"cross-border-logistics/database"
	"cross-border-logistics/models"
	"time"

	"github.com/gin-gonic/gin"
)

func GetStatistics(c *gin.Context) {
	var stats models.Statistics

	database.DB.Model(&models.Parcel{}).Count(&stats.TotalParcels)
	database.DB.Model(&models.Parcel{}).Where("status = ?", "pending").Count(&stats.PendingParcels)
	database.DB.Model(&models.Parcel{}).Where("status IN ?", []string{"shipped", "in_transit", "out_for_delivery"}).Count(&stats.ShippedParcels)
	database.DB.Model(&models.Parcel{}).Where("status = ?", "delivered").Count(&stats.DeliveredParcels)
	database.DB.Model(&models.Warehouse{}).Count(&stats.TotalWarehouses)

	today := time.Now().Format("2006-01-02")
	database.DB.Model(&models.Parcel{}).Where("DATE(created_at) = ?", today).Count(&stats.TodayParcels)

	c.JSON(http.StatusOK, stats)
}

func GetRecentActivity(c *gin.Context) {
	var logs []models.TrackingLog
	database.DB.Preload("Parcel").Order("created_at desc").Limit(20).Find(&logs)
	c.JSON(http.StatusOK, logs)
}
