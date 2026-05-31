package controllers

import (
	"net/http"
	"cross-border-logistics/database"
	"cross-border-logistics/models"

	"github.com/gin-gonic/gin"
)

func GetWarehouses(c *gin.Context) {
	var warehouses []models.Warehouse
	database.DB.Find(&warehouses)
	c.JSON(http.StatusOK, warehouses)
}

func GetWarehouse(c *gin.Context) {
	id := c.Param("id")
	var warehouse models.Warehouse
	if err := database.DB.First(&warehouse, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Warehouse not found"})
		return
	}
	c.JSON(http.StatusOK, warehouse)
}

func CreateWarehouse(c *gin.Context) {
	var warehouse models.Warehouse
	if err := c.ShouldBindJSON(&warehouse); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&warehouse)
	c.JSON(http.StatusCreated, warehouse)
}

func UpdateWarehouse(c *gin.Context) {
	id := c.Param("id")
	var warehouse models.Warehouse
	if err := database.DB.First(&warehouse, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Warehouse not found"})
		return
	}
	if err := c.ShouldBindJSON(&warehouse); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Save(&warehouse)
	c.JSON(http.StatusOK, warehouse)
}

func DeleteWarehouse(c *gin.Context) {
	id := c.Param("id")
	var warehouse models.Warehouse
	if err := database.DB.First(&warehouse, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Warehouse not found"})
		return
	}
	database.DB.Delete(&warehouse)
	c.JSON(http.StatusOK, gin.H{"message": "Warehouse deleted"})
}
