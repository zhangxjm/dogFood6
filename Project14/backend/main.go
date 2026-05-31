package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/gin-gonic/gin"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"github.com/rs/cors"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Device struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	DeviceID    string    `gorm:"uniqueIndex" json:"device_id"`
	DeviceName  string    `json:"device_name"`
	DeviceType  string    `json:"device_type"`
	Location    string    `json:"location"`
	Status      string    `json:"status"`
	Temperature float64   `json:"temperature"`
	Humidity    float64   `json:"humidity"`
	LastOnline  time.Time `json:"last_online"`
	CreatedAt   time.Time `json:"created_at"`
}

type Shipment struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	TrackingNumber  string    `gorm:"uniqueIndex" json:"tracking_number"`
	ProductName     string    `json:"product_name"`
	ProductType     string    `json:"product_type"`
	Origin          string    `json:"origin"`
	Destination     string    `json:"destination"`
	DeviceID        string    `json:"device_id"`
	Status          string    `json:"status"`
	MinTemp         float64   `json:"min_temp"`
	MaxTemp         float64   `json:"max_temp"`
	CustomsVerified bool      `json:"customs_verified"`
	CustomsTime     time.Time `json:"customs_time"`
	DepartureTime   time.Time `json:"departure_time"`
	ArrivalTime     time.Time `json:"arrival_time"`
	CreatedAt       time.Time `json:"created_at"`
}

type Alert struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	AlertType      string    `json:"alert_type"`
	DeviceID       string    `json:"device_id"`
	TrackingNumber string    `json:"tracking_number"`
	Message        string    `json:"message"`
	Level          string    `json:"level"`
	Resolved       bool      `json:"resolved"`
	ResolvedTime   time.Time `json:"resolved_time"`
	CreatedAt      time.Time `json:"created_at"`
}

type CustomsRecord struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	TrackingNumber string    `json:"tracking_number"`
	CustomsCode    string    `json:"customs_code"`
	Inspector      string    `json:"inspector"`
	Status         string    `json:"status"`
	Remark         string    `json:"remark"`
	VerifiedAt     time.Time `json:"verified_at"`
	CreatedAt      time.Time `json:"created_at"`
}

type SensorData struct {
	DeviceID    string    `json:"device_id"`
	Temperature float64   `json:"temperature"`
	Humidity    float64   `json:"humidity"`
	Timestamp   time.Time `json:"timestamp"`
}

var (
	db          *gorm.DB
	influxClient influxdb2.Client
	writeAPI    api.WriteAPI
	queryAPI    api.QueryAPI
	mqttClient  mqtt.Client
)

func main() {
	initDatabase()
	initInfluxDB()
	initMQTT()
	go simulateSensorData()
	startServer()
}

func initDatabase() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./data/coldchain.db"
	}

	var err error
	db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	db.AutoMigrate(&Device{}, &Shipment{}, &Alert{}, &CustomsRecord{})

	initSampleData()
}

func initSampleData() {
	var count int64
	db.Model(&Device{}).Count(&count)
	if count > 0 {
		return
	}

	devices := []Device{
		{DeviceID: "SENSOR001", DeviceName: "冷链集装箱A01", DeviceType: "温湿度传感器", Location: "上海港", Status: "online", Temperature: 2.5, Humidity: 65.0, LastOnline: time.Now()},
		{DeviceID: "SENSOR002", DeviceName: "冷链集装箱A02", DeviceType: "温湿度传感器", Location: "深圳港", Status: "online", Temperature: 3.2, Humidity: 62.0, LastOnline: time.Now()},
		{DeviceID: "SENSOR003", DeviceName: "冷链集装箱B01", DeviceType: "温湿度传感器", Location: "洛杉矶港", Status: "online", Temperature: 4.1, Humidity: 58.0, LastOnline: time.Now()},
		{DeviceID: "SENSOR004", DeviceName: "冷链集装箱B02", DeviceType: "温湿度传感器", Location: "新加坡港", Status: "offline", Temperature: 0, Humidity: 0, LastOnline: time.Now().Add(-24 * time.Hour)},
	}
	db.Create(&devices)

	shipments := []Shipment{
		{TrackingNumber: "CC202405010001", ProductName: "进口三文鱼", ProductType: "海鲜", Origin: "挪威", Destination: "中国上海", DeviceID: "SENSOR001", Status: "运输中", MinTemp: -2, MaxTemp: 5, CustomsVerified: true, CustomsTime: time.Now().Add(-48 * time.Hour), DepartureTime: time.Now().Add(-72 * time.Hour), CreatedAt: time.Now().Add(-72 * time.Hour)},
		{TrackingNumber: "CC202405010002", ProductName: "进口牛肉", ProductType: "肉类", Origin: "澳大利亚", Destination: "中国深圳", DeviceID: "SENSOR002", Status: "清关中", MinTemp: -18, MaxTemp: -10, CustomsVerified: false, DepartureTime: time.Now().Add(-120 * time.Hour), CreatedAt: time.Now().Add(-120 * time.Hour)},
		{TrackingNumber: "CC202405010003", ProductName: "进口蓝莓", ProductType: "水果", Origin: "智利", Destination: "中国广州", DeviceID: "SENSOR003", Status: "已送达", MinTemp: 0, MaxTemp: 8, CustomsVerified: true, CustomsTime: time.Now().Add(-24 * time.Hour), DepartureTime: time.Now().Add(-168 * time.Hour), ArrivalTime: time.Now().Add(-12 * time.Hour), CreatedAt: time.Now().Add(-168 * time.Hour)},
	}
	db.Create(&shipments)

	alerts := []Alert{
		{AlertType: "温度异常", DeviceID: "SENSOR001", TrackingNumber: "CC202405010001", Message: "温度超过上限阈值5°C", Level: "warning", Resolved: true, ResolvedTime: time.Now().Add(-36 * time.Hour), CreatedAt: time.Now().Add(-37 * time.Hour)},
		{AlertType: "设备离线", DeviceID: "SENSOR004", TrackingNumber: "", Message: "设备离线超过24小时", Level: "critical", Resolved: false, CreatedAt: time.Now().Add(-24 * time.Hour)},
	}
	db.Create(&alerts)

	customsRecords := []CustomsRecord{
		{TrackingNumber: "CC202405010001", CustomsCode: "CUS-SH-20240501", Inspector: "张海关", Status: "通过", Remark: "温控数据完整，符合进口标准", VerifiedAt: time.Now().Add(-48 * time.Hour), CreatedAt: time.Now().Add(-48 * time.Hour)},
		{TrackingNumber: "CC202405010003", CustomsCode: "CUS-GZ-20240501", Inspector: "李海关", Status: "通过", Remark: "冷链运输全程合规", VerifiedAt: time.Now().Add(-24 * time.Hour), CreatedAt: time.Now().Add(-24 * time.Hour)},
	}
	db.Create(&customsRecords)

	log.Println("Sample data initialized")
}

func initInfluxDB() {
	influxURL := os.Getenv("INFLUXDB_URL")
	if influxURL == "" {
		influxURL = "http://localhost:8086"
	}
	token := os.Getenv("INFLUXDB_TOKEN")
	if token == "" {
		token = "secret-token-coldchain-2024"
	}
	org := os.Getenv("INFLUXDB_ORG")
	if org == "" {
		org = "coldchain"
	}
	bucket := os.Getenv("INFLUXDB_BUCKET")
	if bucket == "" {
		bucket = "sensor_data"
	}

	influxClient = influxdb2.NewClient(influxURL, token)
	writeAPI = influxClient.WriteAPI(org, bucket)
	queryAPI = influxClient.QueryAPI(org)

	log.Println("InfluxDB connected")
}

func initMQTT() {
	mqttBroker := os.Getenv("MQTT_BROKER")
	if mqttBroker == "" {
		mqttBroker = "localhost"
	}
	mqttPort := os.Getenv("MQTT_PORT")
	if mqttPort == "" {
		mqttPort = "1883"
	}

	opts := mqtt.NewClientOptions()
	opts.AddBroker(fmt.Sprintf("tcp://%s:%s", mqttBroker, mqttPort))
	opts.SetClientID("coldchain-backend")
	opts.SetAutoReconnect(true)

	mqttClient = mqtt.NewClient(opts)
	if token := mqttClient.Connect(); token.Wait() && token.Error() != nil {
		log.Printf("MQTT connect failed: %v, will retry later", token.Error())
	}

	topic := "coldchain/sensors/#"
	if token := mqttClient.Subscribe(topic, 0, handleMQTTMessage); token.Wait() && token.Error() != nil {
		log.Printf("MQTT subscribe failed: %v", token.Error())
	} else {
		log.Printf("MQTT subscribed to %s", topic)
	}
}

func handleMQTTMessage(client mqtt.Client, msg mqtt.Message) {
	var data SensorData
	if err := json.Unmarshal(msg.Payload(), &data); err != nil {
		log.Printf("MQTT message parse error: %v", err)
		return
	}

	saveSensorData(data)
}

func saveSensorData(data SensorData) {
	p := influxdb2.NewPointWithMeasurement("sensor_data").
		AddTag("device_id", data.DeviceID).
		AddField("temperature", data.Temperature).
		AddField("humidity", data.Humidity).
		SetTime(data.Timestamp)
	writeAPI.WritePoint(p)

	db.Model(&Device{}).Where("device_id = ?", data.DeviceID).Updates(map[string]interface{}{
		"temperature": data.Temperature,
		"humidity":    data.Humidity,
		"last_online": data.Timestamp,
		"status":      "online",
	})

	checkAlert(data)
}

func checkAlert(data SensorData) {
	var shipment Shipment
	db.Where("device_id = ? AND status = ?", data.DeviceID, "运输中").First(&shipment)
	if shipment.ID == 0 {
		return
	}

	if data.Temperature > shipment.MaxTemp {
		alert := Alert{
			AlertType:      "温度异常",
			DeviceID:       data.DeviceID,
			TrackingNumber: shipment.TrackingNumber,
			Message:        fmt.Sprintf("温度 %.2f°C 超过上限 %.2f°C", data.Temperature, shipment.MaxTemp),
			Level:          "warning",
			Resolved:       false,
			CreatedAt:      time.Now(),
		}
		db.Create(&alert)
	} else if data.Temperature < shipment.MinTemp {
		alert := Alert{
			AlertType:      "温度异常",
			DeviceID:       data.DeviceID,
			TrackingNumber: shipment.TrackingNumber,
			Message:        fmt.Sprintf("温度 %.2f°C 低于下限 %.2f°C", data.Temperature, shipment.MinTemp),
			Level:          "warning",
			Resolved:       false,
			CreatedAt:      time.Now(),
		}
		db.Create(&alert)
	}
}

func simulateSensorData() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		var devices []Device
		db.Where("status = ?", "online").Find(&devices)

		for _, device := range devices {
			temp := device.Temperature + (rand.Float64()-0.5)*1.5
			humidity := device.Humidity + (rand.Float64()-0.5)*5

			data := SensorData{
				DeviceID:    device.DeviceID,
				Temperature: temp,
				Humidity:    humidity,
				Timestamp:   time.Now(),
			}
			saveSensorData(data)
		}
	}
}

func startServer() {
	r := gin.Default()

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})
	r.Use(func(ctx *gin.Context) {
		c.HandlerFunc(ctx.Writer, ctx.Request)
		if ctx.Request.Method == "OPTIONS" {
			ctx.AbortWithStatus(204)
			return
		}
		ctx.Next()
	})

	api := r.Group("/api")
	{
		api.GET("/dashboard", getDashboard)
		api.GET("/devices", getDevices)
		api.GET("/devices/:id", getDevice)
		api.GET("/devices/:id/data", getDeviceData)
		
		api.GET("/shipments", getShipments)
		api.GET("/shipments/:id", getShipment)
		api.GET("/shipments/:id/trace", getShipmentTrace)
		api.POST("/shipments", createShipment)
		api.PUT("/shipments/:id/verify", verifyCustoms)

		api.GET("/alerts", getAlerts)
		api.PUT("/alerts/:id/resolve", resolveAlert)

		api.GET("/customs", getCustomsRecords)
	}

	log.Println("Server starting on :8080")
	r.Run(":8080")
}

func getDashboard(c *gin.Context) {
	var deviceCount int64
	db.Model(&Device{}).Count(&deviceCount)

	var onlineCount int64
	db.Model(&Device{}).Where("status = ?", "online").Count(&onlineCount)

	var shipmentCount int64
	db.Model(&Shipment{}).Count(&shipmentCount)

	var alertCount int64
	db.Model(&Alert{}).Where("resolved = ?", false).Count(&alertCount)

	c.JSON(200, gin.H{
		"device_count":    deviceCount,
		"online_count":    onlineCount,
		"shipment_count":  shipmentCount,
		"alert_count":     alertCount,
	})
}

func getDevices(c *gin.Context) {
	var devices []Device
	db.Find(&devices)
	c.JSON(200, devices)
}

func getDevice(c *gin.Context) {
	id := c.Param("id")
	var device Device
	if err := db.Where("device_id = ?", id).First(&device).Error; err != nil {
		c.JSON(404, gin.H{"error": "Device not found"})
		return
	}
	c.JSON(200, device)
}

func getDeviceData(c *gin.Context) {
	id := c.Param("id")
	query := fmt.Sprintf(`
		from(bucket: "sensor_data")
		|> range(start: -24h)
		|> filter(fn: (r) => r._measurement == "sensor_data" and r.device_id == "%s")
		|> aggregateWindow(every: 5m, fn: mean)
		|> yield(name: "mean")
	`, id)

	result, err := queryAPI.Query(c, query)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	var data []map[string]interface{}
	for result.Next() {
		record := result.Record()
		data = append(data, map[string]interface{}{
			"time":  record.Time(),
			"field": record.Field(),
			"value": record.Value(),
		})
	}

	c.JSON(200, data)
}

func getShipments(c *gin.Context) {
	var shipments []Shipment
	db.Order("created_at desc").Find(&shipments)
	c.JSON(200, shipments)
}

func getShipment(c *gin.Context) {
	id := c.Param("id")
	var shipment Shipment
	if err := db.Where("tracking_number = ?", id).First(&shipment).Error; err != nil {
		c.JSON(404, gin.H{"error": "Shipment not found"})
		return
	}
	c.JSON(200, shipment)
}

func getShipmentTrace(c *gin.Context) {
	id := c.Param("id")
	var shipment Shipment
	if err := db.Where("tracking_number = ?", id).First(&shipment).Error; err != nil {
		c.JSON(404, gin.H{"error": "Shipment not found"})
		return
	}

	var customs CustomsRecord
	db.Where("tracking_number = ?", id).First(&customs)

	query := fmt.Sprintf(`
		from(bucket: "sensor_data")
		|> range(start: -168h)
		|> filter(fn: (r) => r._measurement == "sensor_data" and r.device_id == "%s")
		|> aggregateWindow(every: 1h, fn: mean)
		|> yield(name: "mean")
	`, shipment.DeviceID)

	result, err := queryAPI.Query(c, query)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	var temperatureData []map[string]interface{}
	var humidityData []map[string]interface{}
	for result.Next() {
		record := result.Record()
		item := map[string]interface{}{
			"time":  record.Time().Format(time.RFC3339),
			"value": record.Value(),
		}
		if record.Field() == "temperature" {
			temperatureData = append(temperatureData, item)
		} else if record.Field() == "humidity" {
			humidityData = append(humidityData, item)
		}
	}

	c.JSON(200, gin.H{
		"shipment":       shipment,
		"customs":        customs,
		"temperature":    temperatureData,
		"humidity":       humidityData,
		"temp_threshold": map[string]float64{"min": shipment.MinTemp, "max": shipment.MaxTemp},
	})
}

func createShipment(c *gin.Context) {
	var shipment Shipment
	if err := c.ShouldBindJSON(&shipment); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	shipment.CreatedAt = time.Now()
	if err := db.Create(&shipment).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, shipment)
}

func verifyCustoms(c *gin.Context) {
	id := c.Param("id")
	var data struct {
		CustomsCode string `json:"customs_code"`
		Inspector   string `json:"inspector"`
		Remark      string `json:"remark"`
	}
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	record := CustomsRecord{
		TrackingNumber: id,
		CustomsCode:    data.CustomsCode,
		Inspector:      data.Inspector,
		Status:         "通过",
		Remark:         data.Remark,
		VerifiedAt:     time.Now(),
		CreatedAt:      time.Now(),
	}
	db.Create(&record)

	db.Model(&Shipment{}).Where("tracking_number = ?", id).Updates(map[string]interface{}{
		"customs_verified": true,
		"customs_time":     time.Now(),
	})

	c.JSON(200, gin.H{"message": "Customs verified successfully"})
}

func getAlerts(c *gin.Context) {
	var alerts []Alert
	db.Order("created_at desc").Find(&alerts)
	c.JSON(200, alerts)
}

func resolveAlert(c *gin.Context) {
	id := c.Param("id")
	db.Model(&Alert{}).Where("id = ?", id).Updates(map[string]interface{}{
		"resolved":      true,
		"resolved_time": time.Now(),
	})
	c.JSON(200, gin.H{"message": "Alert resolved"})
}

func getCustomsRecords(c *gin.Context) {
	var records []CustomsRecord
	db.Order("created_at desc").Find(&records)
	c.JSON(200, records)
}
