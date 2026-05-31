package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"freight-dispatch/database"
	"freight-dispatch/models"

	"github.com/gin-gonic/gin"
)

func Index(c *gin.Context) {
	var vehicleCount, orderCount, routeCount, deliveringCount int64
	database.DB.Model(&models.Vehicle{}).Count(&vehicleCount)
	database.DB.Model(&models.Order{}).Count(&orderCount)
	database.DB.Model(&models.Route{}).Count(&routeCount)
	database.DB.Model(&models.Order{}).Where("status = ?", "运输中").Count(&deliveringCount)

	var recentOrders []models.Order
	database.DB.Preload("Vehicle").Preload("Route").Order("created_at DESC").Limit(5).Find(&recentOrders)

	c.HTML(http.StatusOK, "index.html", gin.H{
		"Title":           "系统概览",
		"Active":          "index",
		"VehicleCount":    vehicleCount,
		"OrderCount":      orderCount,
		"RouteCount":      routeCount,
		"DeliveringCount": deliveringCount,
		"RecentOrders":    recentOrders,
	})
}

func ListVehicles(c *gin.Context) {
	var vehicles []models.Vehicle
	database.DB.Order("id DESC").Find(&vehicles)
	c.HTML(http.StatusOK, "vehicles.html", gin.H{
		"Title":    "车辆登记",
		"Active":   "vehicles",
		"Vehicles": vehicles,
	})
}

func CreateVehicle(c *gin.Context) {
	var vehicle models.Vehicle
	vehicle.LicensePlate = c.PostForm("license_plate")
	vehicle.VehicleType = c.PostForm("vehicle_type")
	vehicle.LoadCapacity, _ = strconv.ParseFloat(c.PostForm("load_capacity"), 64)
	vehicle.DriverName = c.PostForm("driver_name")
	vehicle.DriverPhone = c.PostForm("driver_phone")
	vehicle.Status = "可用"

	if vehicle.LicensePlate == "" || vehicle.VehicleType == "" || vehicle.DriverName == "" {
		c.HTML(http.StatusOK, "vehicles.html", gin.H{
			"Title":    "车辆登记",
			"Active":   "vehicles",
			"Error":    "车牌号、车辆类型和司机姓名不能为空",
			"Vehicles": getVehicles(),
		})
		return
	}

	result := database.DB.Create(&vehicle)
	if result.Error != nil {
		c.HTML(http.StatusOK, "vehicles.html", gin.H{
			"Title":    "车辆登记",
			"Active":   "vehicles",
			"Error":    "车牌号已存在，请勿重复登记",
			"Vehicles": getVehicles(),
		})
		return
	}

	c.Redirect(http.StatusFound, "/vehicles")
}

func UpdateVehicle(c *gin.Context) {
	id := c.Param("id")
	var vehicle models.Vehicle
	if err := database.DB.First(&vehicle, id).Error; err != nil {
		c.Redirect(http.StatusFound, "/vehicles")
		return
	}

	vehicle.LicensePlate = c.PostForm("license_plate")
	vehicle.VehicleType = c.PostForm("vehicle_type")
	vehicle.LoadCapacity, _ = strconv.ParseFloat(c.PostForm("load_capacity"), 64)
	vehicle.DriverName = c.PostForm("driver_name")
	vehicle.DriverPhone = c.PostForm("driver_phone")
	vehicle.Status = c.PostForm("status")

	database.DB.Save(&vehicle)
	c.Redirect(http.StatusFound, "/vehicles")
}

func DeleteVehicle(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.Vehicle{}, id)
	c.Redirect(http.StatusFound, "/vehicles")
}

func ListOrders(c *gin.Context) {
	var orders []models.Order
	database.DB.Preload("Vehicle").Preload("Route").Order("id DESC").Find(&orders)
	c.HTML(http.StatusOK, "orders.html", gin.H{
		"Title":  "运输订单",
		"Active": "orders",
		"Orders": orders,
	})
}

func ShowCreateOrder(c *gin.Context) {
	var vehicles []models.Vehicle
	var routes []models.Route
	database.DB.Where("status = ?", "可用").Find(&vehicles)
	database.DB.Find(&routes)
	c.HTML(http.StatusOK, "order_form.html", gin.H{
		"Title":    "创建订单",
		"Active":   "orders",
		"Vehicles": vehicles,
		"Routes":   routes,
	})
}

func CreateOrder(c *gin.Context) {
	var order models.Order
	order.OrderNo = generateOrderNo()
	vid, _ := strconv.ParseUint(c.PostForm("vehicle_id"), 10, 64)
	rid, _ := strconv.ParseUint(c.PostForm("route_id"), 10, 64)
	order.VehicleID = uint(vid)
	order.RouteID = uint(rid)
	order.CargoName = c.PostForm("cargo_name")
	order.CargoWeight, _ = strconv.ParseFloat(c.PostForm("cargo_weight"), 64)
	order.ShipperName = c.PostForm("shipper_name")
	order.ShipperPhone = c.PostForm("shipper_phone")
	order.ReceiverName = c.PostForm("receiver_name")
	order.ReceiverPhone = c.PostForm("receiver_phone")

	if order.CargoName == "" || order.ShipperName == "" || order.ReceiverName == "" {
		var vehicles []models.Vehicle
		var routes []models.Route
		database.DB.Where("status = ?", "可用").Find(&vehicles)
		database.DB.Find(&routes)
		c.HTML(http.StatusOK, "order_form.html", gin.H{
			"Title":    "创建订单",
			"Active":   "orders",
			"Error":    "货物名称、发货人和收货人不能为空",
			"Vehicles": vehicles,
			"Routes":   routes,
		})
		return
	}

	if order.VehicleID == 0 || order.RouteID == 0 {
		var vehicles []models.Vehicle
		var routes []models.Route
		database.DB.Where("status = ?", "可用").Find(&vehicles)
		database.DB.Find(&routes)
		c.HTML(http.StatusOK, "order_form.html", gin.H{
			"Title":    "创建订单",
			"Active":   "orders",
			"Error":    "请选择车辆和路线",
			"Vehicles": vehicles,
			"Routes":   routes,
		})
		return
	}

	order.Status = "待调度"
	database.DB.Create(&order)

	database.DB.Model(&models.Vehicle{}).Where("id = ?", order.VehicleID).Update("status", "运输中")

	database.DB.Create(&models.DeliveryStatus{
		OrderID: order.ID,
		Status:  "已揽收",
		Remark:  "订单已创建，等待调度",
	})

	c.Redirect(http.StatusFound, "/orders")
}

func UpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")
	status := c.PostForm("status")
	var order models.Order
	if err := database.DB.First(&order, id).Error; err != nil {
		c.Redirect(http.StatusFound, "/orders")
		return
	}

	order.Status = status
	database.DB.Save(&order)

	if status == "已送达" || status == "已取消" {
		database.DB.Model(&models.Vehicle{}).Where("id = ?", order.VehicleID).Update("status", "可用")
	}

	c.Redirect(http.StatusFound, "/orders")
}

func DeleteOrder(c *gin.Context) {
	id := c.Param("id")
	var order models.Order
	if err := database.DB.First(&order, id).Error; err == nil {
		database.DB.Where("order_id = ?", order.ID).Delete(&models.DeliveryStatus{})
		if order.Status == "运输中" || order.Status == "待调度" {
			database.DB.Model(&models.Vehicle{}).Where("id = ?", order.VehicleID).Update("status", "可用")
		}
		database.DB.Delete(&order)
	}
	c.Redirect(http.StatusFound, "/orders")
}

func ListRoutes(c *gin.Context) {
	var routes []models.Route
	database.DB.Order("id DESC").Find(&routes)
	c.HTML(http.StatusOK, "routes.html", gin.H{
		"Title":  "运输路线",
		"Active": "routes",
		"Routes": routes,
	})
}

func CreateRoute(c *gin.Context) {
	var route models.Route
	route.Name = c.PostForm("name")
	route.StartPoint = c.PostForm("start_point")
	route.EndPoint = c.PostForm("end_point")
	route.Distance, _ = strconv.ParseFloat(c.PostForm("distance"), 64)
	route.EstimatedTime, _ = strconv.Atoi(c.PostForm("estimated_time"))

	if route.Name == "" || route.StartPoint == "" || route.EndPoint == "" {
		c.HTML(http.StatusOK, "routes.html", gin.H{
			"Title":  "运输路线",
			"Active": "routes",
			"Error":  "路线名称、起点和终点不能为空",
			"Routes": getRoutes(),
		})
		return
	}

	database.DB.Create(&route)
	c.Redirect(http.StatusFound, "/routes")
}

func UpdateRoute(c *gin.Context) {
	id := c.Param("id")
	var route models.Route
	if err := database.DB.First(&route, id).Error; err != nil {
		c.Redirect(http.StatusFound, "/routes")
		return
	}

	route.Name = c.PostForm("name")
	route.StartPoint = c.PostForm("start_point")
	route.EndPoint = c.PostForm("end_point")
	route.Distance, _ = strconv.ParseFloat(c.PostForm("distance"), 64)
	route.EstimatedTime, _ = strconv.Atoi(c.PostForm("estimated_time"))

	database.DB.Save(&route)
	c.Redirect(http.StatusFound, "/routes")
}

func DeleteRoute(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.Route{}, id)
	c.Redirect(http.StatusFound, "/routes")
}

func ListDeliveries(c *gin.Context) {
	var orders []models.Order
	database.DB.Preload("Vehicle").Preload("Route").Preload("DeliveryStatuses").Order("id DESC").Find(&orders)
	c.HTML(http.StatusOK, "delivery.html", gin.H{
		"Title":  "送达状态",
		"Active": "delivery",
		"Orders": orders,
	})
}

func AddDeliveryStatus(c *gin.Context) {
	orderIDUint, _ := strconv.ParseUint(c.PostForm("order_id"), 10, 64)
	orderID := uint(orderIDUint)
	status := c.PostForm("status")
	location := c.PostForm("location")
	remark := c.PostForm("remark")

	if orderID == 0 || status == "" {
		c.Redirect(http.StatusFound, "/delivery")
		return
	}

	delivery := models.DeliveryStatus{
		OrderID:  orderID,
		Status:   status,
		Location: location,
		Remark:   remark,
	}
	database.DB.Create(&delivery)

	var order models.Order
	if err := database.DB.First(&order, orderID).Error; err == nil {
		order.Status = status
		database.DB.Save(&order)

		if status == "已签收" || status == "已送达" {
			database.DB.Model(&models.Vehicle{}).Where("id = ?", order.VehicleID).Update("status", "可用")
		}
	}

	c.Redirect(http.StatusFound, "/delivery")
}

func getVehicles() []models.Vehicle {
	var vehicles []models.Vehicle
	database.DB.Order("id DESC").Find(&vehicles)
	return vehicles
}

func getRoutes() []models.Route {
	var routes []models.Route
	database.DB.Order("id DESC").Find(&routes)
	return routes
}

func generateOrderNo() string {
	return fmt.Sprintf("ORD%s", time.Now().Format("20060102150405"))
}
