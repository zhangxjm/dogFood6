package controllers

import (
	"grain-oil-inventory/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type StatsController struct {
	db *gorm.DB
}

func NewStatsController(db *gorm.DB) *StatsController {
	return &StatsController{db: db}
}

func (sc *StatsController) GetMonthlyStats(c *gin.Context) {
	year := c.Query("year")
	if year == "" {
		year = "YEAR(CURDATE())"
	} else {
		year = "'" + year + "'"
	}

	type Result struct {
		Month       string
		TotalSales  float64
		TotalCost   float64
		SaleCount   int64
		PurchaseCount int64
	}

	var results []Result

	sql := `
	SELECT 
		DATE_FORMAT(s.created_at, '%Y-%m') as month,
		COALESCE(SUM(s.total_amount), 0) as total_sales,
		COALESCE(SUM(s.quantity * p.purchase_price), 0) as total_cost,
		COUNT(DISTINCT s.id) as sale_count,
		0 as purchase_count
	FROM sales s
	LEFT JOIN products p ON s.product_id = p.id
	WHERE YEAR(s.created_at) = ` + year + `
	GROUP BY DATE_FORMAT(s.created_at, '%Y-%m')
	`

	sc.db.Raw(sql).Scan(&results)

	var purchaseResults []Result
	purchaseSql := `
	SELECT 
		DATE_FORMAT(created_at, '%Y-%m') as month,
		0 as total_sales,
		0 as total_cost,
		0 as sale_count,
		COUNT(*) as purchase_count
	FROM purchases
	WHERE YEAR(created_at) = ` + year + `
	GROUP BY DATE_FORMAT(created_at, '%Y-%m')
	`
	sc.db.Raw(purchaseSql).Scan(&purchaseResults)

	purchaseMap := make(map[string]int64)
	for _, pr := range purchaseResults {
		purchaseMap[pr.Month] = pr.PurchaseCount
	}

	var stats []models.MonthlyStats
	for _, r := range results {
		stat := models.MonthlyStats{
			Month:         r.Month,
			TotalSales:    r.TotalSales,
			TotalCost:     r.TotalCost,
			TotalProfit:   r.TotalSales - r.TotalCost,
			SaleCount:     r.SaleCount,
			PurchaseCount: purchaseMap[r.Month],
		}
		stats = append(stats, stat)
	}

	c.JSON(http.StatusOK, stats)
}

func (sc *StatsController) GetOverview(c *gin.Context) {
	var totalProducts int64
	sc.db.Model(&models.Product{}).Count(&totalProducts)

	var lowStockCount int64
	sc.db.Model(&models.Product{}).Where("stock <= warning_stock").Count(&lowStockCount)

	var totalSales float64
	sc.db.Model(&models.Sale{}).Select("COALESCE(SUM(total_amount), 0)").Scan(&totalSales)

	var totalPurchases float64
	sc.db.Model(&models.Purchase{}).Select("COALESCE(SUM(total_amount), 0)").Scan(&totalPurchases)

	var totalSaleCount int64
	sc.db.Model(&models.Sale{}).Count(&totalSaleCount)

	c.JSON(http.StatusOK, gin.H{
		"total_products":   totalProducts,
		"low_stock_count":  lowStockCount,
		"total_sales":      totalSales,
		"total_purchases":  totalPurchases,
		"total_sale_count": totalSaleCount,
	})
}
