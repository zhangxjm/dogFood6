package controllers

import (
	"grain-oil-inventory/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProductController struct {
	db *gorm.DB
}

func NewProductController(db *gorm.DB) *ProductController {
	return &ProductController{db: db}
}

func (pc *ProductController) GetProducts(c *gin.Context) {
	category := c.Query("category")
	keyword := c.Query("keyword")

	query := pc.db.Model(&models.Product{})

	if category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}

	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	var products []models.Product
	if err := query.Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, products)
}

func (pc *ProductController) GetProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var product models.Product
	if err := pc.db.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}
	c.JSON(http.StatusOK, product)
}

func (pc *ProductController) CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := pc.db.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, product)
}

func (pc *ProductController) UpdateProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var product models.Product
	if err := pc.db.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := pc.db.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, product)
}

func (pc *ProductController) DeleteProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := pc.db.Delete(&models.Product{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Product deleted"})
}

func (pc *ProductController) GetCategories(c *gin.Context) {
	var categories []string
	pc.db.Model(&models.Product{}).Distinct("category").Pluck("category", &categories)
	c.JSON(http.StatusOK, categories)
}

func (pc *ProductController) GetLowStockProducts(c *gin.Context) {
	var products []models.Product
	if err := pc.db.Where("stock <= warning_stock").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, products)
}
