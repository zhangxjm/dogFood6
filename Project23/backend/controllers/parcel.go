package controllers

import (
	"net/http"
	"cross-border-logistics/database"
	"cross-border-logistics/models"
	"cross-border-logistics/rabbitmq"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

func GetParcels(c *gin.Context) {
	status := c.Query("status")
	var parcels []models.Parcel
	query := database.DB.Preload("CurrentWarehouse").Preload("TargetWarehouse")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Order("created_at desc").Find(&parcels)
	c.JSON(http.StatusOK, parcels)
}

func GetParcel(c *gin.Context) {
	id := c.Param("id")
	var parcel models.Parcel
	if err := database.DB.Preload("CurrentWarehouse").Preload("TargetWarehouse").First(&parcel, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Parcel not found"})
		return
	}
	c.JSON(http.StatusOK, parcel)
}

func CreateParcel(c *gin.Context) {
	var parcel models.Parcel
	if err := c.ShouldBindJSON(&parcel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	parcel.Status = "pending"
	parcel.TrackingNumber = generateTrackingNumber()
	database.DB.Create(&parcel)

	trackingLog := models.TrackingLog{
		ParcelID:  parcel.ID,
		Status:    "created",
		Location:  "系统创建",
		Latitude:  0,
		Longitude: 0,
		Remark:    "包裹信息已录入系统",
		CreatedAt: time.Now(),
	}
	database.DB.Create(&trackingLog)

	msg := rabbitmq.ParcelMessage{
		ParcelID:      parcel.ID,
		TrackingNumber: parcel.TrackingNumber,
		Action:        "sort",
	}
	rabbitmq.PublishMessage(msg)

	c.JSON(http.StatusCreated, parcel)
}

func UpdateParcel(c *gin.Context) {
	id := c.Param("id")
	var parcel models.Parcel
	if err := database.DB.First(&parcel, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Parcel not found"})
		return
	}
	if err := c.ShouldBindJSON(&parcel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Save(&parcel)
	c.JSON(http.StatusOK, parcel)
}

func DeleteParcel(c *gin.Context) {
	id := c.Param("id")
	var parcel models.Parcel
	if err := database.DB.First(&parcel, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Parcel not found"})
		return
	}
	database.DB.Delete(&parcel)
	c.JSON(http.StatusOK, gin.H{"message": "Parcel deleted"})
}

func GetParcelTracking(c *gin.Context) {
	id := c.Param("id")
	var logs []models.TrackingLog
	database.DB.Where("parcel_id = ?", id).Order("created_at desc").Find(&logs)
	c.JSON(http.StatusOK, logs)
}

func UpdateParcelStatus(c *gin.Context) {
	id := c.Param("id")
	var parcel models.Parcel
	if err := database.DB.First(&parcel, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Parcel not found"})
		return
	}

	var data struct {
		Status   string `json:"status"`
		Location string `json:"location"`
		Latitude float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
		Remark   string `json:"remark"`
	}
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	parcel.Status = data.Status
	parcel.UpdatedAt = time.Now()
	database.DB.Save(&parcel)

	trackingLog := models.TrackingLog{
		ParcelID:  parcel.ID,
		Status:    data.Status,
		Location:  data.Location,
		Latitude:  data.Latitude,
		Longitude: data.Longitude,
		Remark:    data.Remark,
		CreatedAt: time.Now(),
	}
	database.DB.Create(&trackingLog)

	c.JSON(http.StatusOK, parcel)
}

func ProcessSorting(c *gin.Context) {
	id := c.Param("id")
	var parcel models.Parcel
	if err := database.DB.First(&parcel, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Parcel not found"})
		return
	}

	msg := rabbitmq.ParcelMessage{
		ParcelID:      parcel.ID,
		TrackingNumber: parcel.TrackingNumber,
		Action:        "sort",
	}
	rabbitmq.PublishMessage(msg)

	c.JSON(http.StatusOK, gin.H{"message": "Sorting task queued"})
}

func ProcessRouting(c *gin.Context) {
	id := c.Param("id")
	var parcel models.Parcel
	if err := database.DB.First(&parcel, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Parcel not found"})
		return
	}

	msg := rabbitmq.ParcelMessage{
		ParcelID:      parcel.ID,
		TrackingNumber: parcel.TrackingNumber,
		Action:        "route",
	}
	rabbitmq.PublishMessage(msg)

	c.JSON(http.StatusOK, gin.H{"message": "Routing task queued"})
}

func generateTrackingNumber() string {
	now := time.Now()
	return fmt.Sprintf("CN%s%06d", now.Format("20060102"), time.Now().UnixNano()%1000000)
}
