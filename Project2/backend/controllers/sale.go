package controllers

import (
	"grain-oil-inventory/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SaleController struct {
	db *gorm.DB
}

func NewSaleController(db *gorm.DB) *SaleController {
	return &SaleController{db: db}
}

func (sc *SaleController) GetSales(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := sc.db.Preload("Product").Order("created_at DESC")

	if startDate != "" {
		query = query.Where("created_at >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("created_at <= ?", endDate+" 23:59:59")
	}

	var sales []models.Sale
	if err := query.Find(&sales).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, sales)
}

func (sc *SaleController) CreateSale(c *gin.Context) {
	var sale models.Sale
	if err := c.ShouldBindJSON(&sale); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var product models.Product
	if err := sc.db.First(&product, sale.ProductID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	if product.Stock < sale.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock"})
		return
	}

	sale.TotalAmount = sale.Quantity * sale.UnitPrice
	sale.CreatedAt = time.Now()

	tx := sc.db.Begin()

	if err := tx.Create(&sale).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Model(&models.Product{}).Where("id = ?", sale.ProductID).
		Update("stock", gorm.Expr("stock - ?", sale.Quantity)).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	tx.Commit()

	var result models.Sale
	sc.db.Preload("Product").First(&result, sale.ID)
	c.JSON(http.StatusCreated, result)
}

func (sc *SaleController) DeleteSale(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var sale models.Sale
	if err := sc.db.First(&sale, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sale not found"})
		return
	}

	tx := sc.db.Begin()

	if err := tx.Model(&models.Product{}).Where("id = ?", sale.ProductID).
		Update("stock", gorm.Expr("stock + ?", sale.Quantity)).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Delete(&sale).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Sale deleted"})
}
