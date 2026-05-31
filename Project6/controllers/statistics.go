package controllers

import (
	"time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

type StatisticsController struct {
	beego.Controller
}

type DailyStats struct {
	Date        string  `json:"date"`
	OrderCount  int64   `json:"order_count"`
	TotalAmount float64 `json:"total_amount"`
}

type DishStats struct {
	DishName    string `json:"dish_name"`
	TotalCount  int64  `json:"total_count"`
	TotalAmount float64 `json:"total_amount"`
}

func (c *StatisticsController) Get() {
	startDate := c.GetString("start_date")
	endDate := c.GetString("end_date")

	o := orm.NewOrm()

	var dailyStats []DailyStats
	var dishStats []DishStats
	var totalOrders int64
	var totalRevenue float64

	baseWhere := "status = '已结账'"
	params := []interface{}{}

	if startDate != "" {
		baseWhere += " AND create_at >= ?"
		params = append(params, startDate)
	}
	if endDate != "" {
		baseWhere += " AND create_at < ?"
		params = append(params, endDate+" 23:59:59")
	}

	o.QueryTable("order_info").Filter("status", "已结账").Count(&totalOrders)

	revenueSQL := "SELECT COALESCE(SUM(total_amount), 0) as total_amount FROM order_info WHERE " + baseWhere
	o.Raw(revenueSQL, params...).QueryRow(&totalRevenue)

	dailySQL := `SELECT DATE_FORMAT(create_at, '%Y-%m-%d') as date, 
		COUNT(*) as order_count, 
		COALESCE(SUM(total_amount), 0) as total_amount 
		FROM order_info 
		WHERE ` + baseWhere + ` 
		GROUP BY DATE_FORMAT(create_at, '%Y-%m-%d') 
		ORDER BY date DESC`
	o.Raw(dailySQL, params...).QueryRows(&dailyStats)

	dishSQL := `SELECT oi.dish_name, 
		COUNT(*) as total_count, 
		COALESCE(SUM(oi.subtotal), 0) as total_amount 
		FROM order_item oi 
		INNER JOIN order_info o ON oi.order_id = o.id 
		WHERE ` + baseWhere + ` 
		GROUP BY oi.dish_name 
		ORDER BY total_count DESC 
		LIMIT 10`
	o.Raw(dishSQL, params...).QueryRows(&dishStats)

	c.Data["json"] = map[string]interface{}{
		"total_orders":  totalOrders,
		"total_revenue": totalRevenue,
		"daily_stats":   dailyStats,
		"dish_stats":    dishStats,
	}
	c.ServeJSON()
}

func (c *StatisticsController) GetToday() {
	today := time.Now().Format("2006-01-02")
	c.Data["start_date"] = today
	c.Data["end_date"] = today

	o := orm.NewOrm()

	var dailyStats []DailyStats
	var dishStats []DishStats
	var totalOrders int64
	var totalRevenue float64

	o.QueryTable("order_info").Filter("status", "已结账").Filter("create_at__startswith", today).Count(&totalOrders)

	revenueSQL := "SELECT COALESCE(SUM(total_amount), 0) as total_amount FROM order_info WHERE status = '已结账' AND create_at >= ? AND create_at < ?"
	o.Raw(revenueSQL, today, today+" 23:59:59").QueryRow(&totalRevenue)

	dailySQL := `SELECT DATE_FORMAT(create_at, '%Y-%m-%d') as date, 
		COUNT(*) as order_count, 
		COALESCE(SUM(total_amount), 0) as total_amount 
		FROM order_info 
		WHERE status = '已结账' AND create_at >= ? AND create_at < ? 
		GROUP BY DATE_FORMAT(create_at, '%Y-%m-%d') 
		ORDER BY date DESC`
	o.Raw(dailySQL, today, today+" 23:59:59").QueryRows(&dailyStats)

	dishSQL := `SELECT oi.dish_name, 
		COUNT(*) as total_count, 
		COALESCE(SUM(oi.subtotal), 0) as total_amount 
		FROM order_item oi 
		INNER JOIN order_info o ON oi.order_id = o.id 
		WHERE o.status = '已结账' AND o.create_at >= ? AND o.create_at < ? 
		GROUP BY oi.dish_name 
		ORDER BY total_count DESC 
		LIMIT 10`
	o.Raw(dishSQL, today, today+" 23:59:59").QueryRows(&dishStats)

	c.Data["json"] = map[string]interface{}{
		"total_orders":  totalOrders,
		"total_revenue": totalRevenue,
		"daily_stats":   dailyStats,
		"dish_stats":    dishStats,
	}
	c.ServeJSON()
}
