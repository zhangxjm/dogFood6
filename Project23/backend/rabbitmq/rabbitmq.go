package rabbitmq

import (
	"encoding/json"
	"log"
	"math"
	"cross-border-logistics/config"
	"cross-border-logistics/database"
	"cross-border-logistics/models"
	"time"

	"github.com/streadway/amqp"
)

var (
	conn    *amqp.Connection
	channel *amqp.Channel
)

type ParcelMessage struct {
	ParcelID      uint   `json:"parcel_id"`
	TrackingNumber string `json:"tracking_number"`
	Action        string `json:"action"`
}

func InitRabbitMQ() {
	var err error
	conn, err = amqp.Dial(config.AppConfig.RabbitMQURL)
	if err != nil {
		log.Printf("Warning: Failed to connect to RabbitMQ: %v", err)
		log.Println("RabbitMQ is not available, will use local processing instead")
		return
	}

	channel, err = conn.Channel()
	if err != nil {
		log.Printf("Warning: Failed to open channel: %v", err)
		return
	}

	_, err = channel.QueueDeclare(
		config.AppConfig.QueueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Printf("Warning: Failed to declare queue: %v", err)
		return
	}

	log.Println("RabbitMQ initialized successfully")
}

func PublishMessage(msg ParcelMessage) error {
	if channel == nil {
		log.Println("RabbitMQ not available, processing locally")
		go processMessage(msg)
		return nil
	}

	body, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	err = channel.Publish(
		"",
		config.AppConfig.QueueName,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
	return err
}

func ConsumeMessages() {
	if channel == nil {
		log.Println("RabbitMQ not available, skipping consumer")
		return
	}

	msgs, err := channel.Consume(
		config.AppConfig.QueueName,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Printf("Failed to register consumer: %v", err)
		return
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			var msg ParcelMessage
			err := json.Unmarshal(d.Body, &msg)
			if err != nil {
				log.Printf("Error parsing message: %v", err)
				continue
			}
			processMessage(msg)
		}
	}()

	log.Println("RabbitMQ consumer started")
	<-forever
}

func processMessage(msg ParcelMessage) {
	log.Printf("Processing message: %+v", msg)

	switch msg.Action {
	case "sort":
		processSorting(msg.ParcelID)
	case "route":
		processRouting(msg.ParcelID)
	case "update_status":
		processStatusUpdate(msg.ParcelID)
	}
}

func processSorting(parcelID uint) {
	var parcel models.Parcel
	if err := database.DB.First(&parcel, parcelID).Error; err != nil {
		log.Printf("Parcel not found: %v", err)
		return
	}

	var warehouses []models.Warehouse
	database.DB.Find(&warehouses)

	if len(warehouses) == 0 {
		log.Println("No warehouses available")
		return
	}

	bestWarehouse := warehouses[0]
	minDistance := calculateDistance(parcel.ReceiverLat, parcel.ReceiverLng, bestWarehouse.Latitude, bestWarehouse.Longitude)

	for _, w := range warehouses[1:] {
		distance := calculateDistance(parcel.ReceiverLat, parcel.ReceiverLng, w.Latitude, w.Longitude)
		if distance < minDistance {
			minDistance = distance
			bestWarehouse = w
		}
	}

	parcel.TargetWarehouseID = &bestWarehouse.ID
	parcel.Status = "sorted"
	parcel.UpdatedAt = time.Now()
	database.DB.Save(&parcel)

	var sourceWarehouseID uint
	if parcel.CurrentWarehouseID != nil {
		sourceWarehouseID = *parcel.CurrentWarehouseID
	}
	task := models.SortingTask{
		ParcelID:          parcel.ID,
		SourceWarehouseID: sourceWarehouseID,
		TargetWarehouseID: bestWarehouse.ID,
		Status:            "completed",
		ProcessedAt:       &[]time.Time{time.Now()}[0],
	}
	database.DB.Create(&task)

	trackingLog := models.TrackingLog{
		ParcelID:  parcel.ID,
		Status:    "sorted",
		Location:  bestWarehouse.Name,
		Latitude:  bestWarehouse.Latitude,
		Longitude: bestWarehouse.Longitude,
		Remark:    "包裹已完成分拣，分配至目标仓库",
		CreatedAt: time.Now(),
	}
	database.DB.Create(&trackingLog)

	log.Printf("Parcel %s sorted to warehouse %s", parcel.TrackingNumber, bestWarehouse.Name)
}

func processRouting(parcelID uint) {
	var parcel models.Parcel
	if err := database.DB.Preload("CurrentWarehouse").Preload("TargetWarehouse").First(&parcel, parcelID).Error; err != nil {
		log.Printf("Parcel not found: %v", err)
		return
	}

	if parcel.CurrentWarehouse == nil || parcel.TargetWarehouse == nil {
		log.Println("Warehouse information incomplete")
		return
	}

	distance := calculateDistance(
		parcel.CurrentWarehouse.Latitude,
		parcel.CurrentWarehouse.Longitude,
		parcel.TargetWarehouse.Latitude,
		parcel.TargetWarehouse.Longitude,
	)

	duration := int(distance * 0.1)

	var targetWarehouseID uint
	if parcel.TargetWarehouseID != nil {
		targetWarehouseID = *parcel.TargetWarehouseID
	}
	route := models.Route{
		ParcelID:          parcel.ID,
		SourceWarehouseID: parcel.CurrentWarehouse.ID,
		TargetWarehouseID: targetWarehouseID,
		Distance:          distance,
		Duration:          duration,
		RouteData:         generateRouteData(parcel.CurrentWarehouse, parcel.TargetWarehouse),
		Optimized:         true,
	}
	database.DB.Create(&route)

	estimatedDelivery := time.Now().Add(time.Duration(duration) * time.Hour)
	parcel.EstimatedDelivery = &estimatedDelivery
	parcel.Status = "routed"
	parcel.UpdatedAt = time.Now()
	database.DB.Save(&parcel)

	log.Printf("Route planned for parcel %s: distance=%.2fkm, duration=%dh", parcel.TrackingNumber, distance, duration)
}

func processStatusUpdate(parcelID uint) {
	var parcel models.Parcel
	if err := database.DB.First(&parcel, parcelID).Error; err != nil {
		log.Printf("Parcel not found: %v", err)
		return
	}

	statuses := []string{"picked_up", "in_transit", "at_hub", "out_for_delivery", "delivered"}
	currentIndex := -1
	for i, s := range statuses {
		if s == parcel.Status {
			currentIndex = i
			break
		}
	}

	if currentIndex < len(statuses)-1 {
		nextStatus := statuses[currentIndex+1]
		parcel.Status = nextStatus
		parcel.UpdatedAt = time.Now()

		if nextStatus == "delivered" {
			now := time.Now()
			parcel.ActualDelivery = &now
		}

		database.DB.Save(&parcel)
		log.Printf("Parcel %s status updated to %s", parcel.TrackingNumber, nextStatus)
	}
}

func calculateDistance(lat1, lng1, lat2, lng2 float64) float64 {
	const R = 6371.0
	dLat := (lat2 - lat1) * math.Pi / 180.0
	dLng := (lng2 - lng1) * math.Pi / 180.0
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180.0)*math.Cos(lat2*math.Pi/180.0)*
			math.Sin(dLng/2)*math.Sin(dLng/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}

func generateRouteData(source, target *models.Warehouse) string {
	steps := []map[string]interface{}{
		{
			"step":      1,
			"action":    "出库",
			"location":  source.Name,
			"latitude":  source.Latitude,
			"longitude": source.Longitude,
		},
		{
			"step":      2,
			"action":    "运输中",
			"location":  "途中",
			"latitude":  (source.Latitude + target.Latitude) / 2,
			"longitude": (source.Longitude + target.Longitude) / 2,
		},
		{
			"step":      3,
			"action":    "入库",
			"location":  target.Name,
			"latitude":  target.Latitude,
			"longitude": target.Longitude,
		},
	}

	data, _ := json.Marshal(steps)
	return string(data)
}

func Close() {
	if channel != nil {
		channel.Close()
	}
	if conn != nil {
		conn.Close()
	}
}
