package controllers

import (
	"grain-oil-inventory/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PurchaseController struct {
	db *gorm.DB
}

func NewPurchaseController(db *gorm.DB) *PurchaseController {
	return &PurchaseController{db: db}
}

func (pc *PurchaseController) GetPurchases(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := pc.db.Preload("Product").Order("created_at DESC")

	if startDate != "" {
		query = query.Where("created_at >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("created_at <= ?", endDate+" 23:59:59")
	}

	var purchases []models.Purchase
	if err := query.Find(&purchases).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, purchases)
}

func (pc *PurchaseController) CreatePurchase(c *gin.Context) {
	var purchase models.Purchase
	if err := c.ShouldBindJSON(&purchase); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	purchase.TotalAmount = purchase.Quantity * purchase.UnitPrice
	purchase.CreatedAt = time.Now()

	tx := pc.db.Begin()

	if err := tx.Create(&purchase).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Model(&models.Product{}).Where("id = ?", purchase.ProductID).
		Update("stock", gorm.Expr("stock + ?", purchase.Quantity)).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	tx.Commit()

	var result models.Purchase
	pc.db.Preload("Product").First(&result, purchase.ID)
	c.JSON(http.StatusCreated, result)
}

func (pc *PurchaseController) DeletePurchase(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var purchase models.Purchase
	if err := pc.db.First(&purchase, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Purchase not found"})
		return
	}

	tx := pc.db.Begin()

	if err := tx.Model(&models.Product{}).Where("id = ?", purchase.ProductID).
		Update("stock", gorm.Expr("stock - ?", purchase.Quantity)).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Delete(&purchase).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Purchase deleted"})
}
