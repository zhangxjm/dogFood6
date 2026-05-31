package main

import (
	"html/template"
	"log"

	"freight-dispatch/database"
	"freight-dispatch/handlers"

	"github.com/gin-gonic/gin"
)

func orderStatusClass(status string) string {
	switch status {
	case "待调度":
		return "yellow"
	case "运输中":
		return "blue"
	case "已送达":
		return "green"
	case "已取消":
		return "gray"
	default:
		return "gray"
	}
}

func vehicleStatusClass(status string) string {
	switch status {
	case "可用":
		return "green"
	case "运输中":
		return "blue"
	case "维修中":
		return "orange"
	default:
		return "gray"
	}
}

func deliveryDotClass(status string) string {
	switch status {
	case "已签收", "已送达":
		return "dot-green"
	case "运输中", "派送中":
		return "dot-blue"
	case "已揽收":
		return "dot-orange"
	default:
		return "dot-gray"
	}
}

func main() {
	err := database.Init("freight.db")
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	funcMap := template.FuncMap{
		"orderStatusClass":   orderStatusClass,
		"vehicleStatusClass": vehicleStatusClass,
		"deliveryDotClass":   deliveryDotClass,
	}

	tmpl := template.Must(template.New("").Funcs(funcMap).ParseGlob("templates/*"))
	r.SetHTMLTemplate(tmpl)

	r.Static("/static", "./static")

	r.GET("/", handlers.Index)

	r.GET("/vehicles", handlers.ListVehicles)
	r.POST("/vehicles", handlers.CreateVehicle)
	r.POST("/vehicles/:id/update", handlers.UpdateVehicle)
	r.POST("/vehicles/:id/delete", handlers.DeleteVehicle)

	r.GET("/orders", handlers.ListOrders)
	r.GET("/orders/create", handlers.ShowCreateOrder)
	r.POST("/orders", handlers.CreateOrder)
	r.POST("/orders/:id/status", handlers.UpdateOrderStatus)
	r.POST("/orders/:id/delete", handlers.DeleteOrder)

	r.GET("/routes", handlers.ListRoutes)
	r.POST("/routes", handlers.CreateRoute)
	r.POST("/routes/:id/update", handlers.UpdateRoute)
	r.POST("/routes/:id/delete", handlers.DeleteRoute)

	r.GET("/delivery", handlers.ListDeliveries)
	r.POST("/delivery", handlers.AddDeliveryStatus)

	log.Println("Freight dispatch system starting on http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
