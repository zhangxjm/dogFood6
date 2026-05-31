package database

import (
	"log"
	"cross-border-logistics/config"
	"cross-border-logistics/models"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open(config.AppConfig.DBPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	err = DB.AutoMigrate(
		&models.Warehouse{},
		&models.Parcel{},
		&models.TrackingLog{},
		&models.SortingTask{},
		&models.Route{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database initialized successfully")
}

func InitSampleData() {
	var warehouseCount int64
	DB.Model(&models.Warehouse{}).Count(&warehouseCount)
	if warehouseCount > 0 {
		log.Println("Sample data already exists, skipping initialization")
		return
	}

	warehouses := []models.Warehouse{
		{
			Name:      "深圳中央仓库",
			Address:   "深圳市南山区科技园",
			City:      "深圳",
			Country:   "中国",
			Latitude:  22.5431,
			Longitude: 114.0579,
			Capacity:  10000,
		},
		{
			Name:      "上海分拨中心",
			Address:   "上海市浦东新区",
			City:      "上海",
			Country:   "中国",
			Latitude:  31.2304,
			Longitude: 121.4737,
			Capacity:  8000,
		},
		{
			Name:      "广州仓库",
			Address:   "广州市天河区",
			City:      "广州",
			Country:   "中国",
			Latitude:  23.1291,
			Longitude: 113.2644,
			Capacity:  6000,
		},
		{
			Name:      "香港转运中心",
			Address:   "香港特别行政区",
			City:      "香港",
			Country:   "中国",
			Latitude:  22.3193,
			Longitude: 114.1694,
			Capacity:  5000,
		},
		{
			Name:      "新加坡仓库",
			Address:   "新加坡",
			City:      "新加坡",
			Country:   "新加坡",
			Latitude:  1.3521,
			Longitude: 103.8198,
			Capacity:  4000,
		},
	}

	for _, w := range warehouses {
		DB.Create(&w)
	}

	log.Println("Sample warehouses created")

	parcels := []models.Parcel{
		{
			TrackingNumber:  "CN20240100001",
			Weight:         2.5,
			Length:         30,
			Width:          20,
			Height:         15,
			SenderName:     "张三",
			SenderAddress:  "深圳市南山区",
			SenderCity:     "深圳",
			SenderCountry:  "中国",
			ReceiverName:   "John Smith",
			ReceiverAddress: "123 Main St",
			ReceiverCity:  "New York",
			ReceiverCountry: "USA",
			ReceiverLat:  40.7128,
			ReceiverLng:  -74.0060,
			Status:       "pending",
		},
		{
			TrackingNumber:  "CN20240100002",
			Weight:         1.8,
			Length:         25,
			Width:          15,
			Height:         10,
			SenderName:     "李四",
			SenderAddress:  "上海市浦东新区",
			SenderCity:     "上海",
			SenderCountry:  "中国",
			ReceiverName:   "Mary Johnson",
			ReceiverAddress: "456 Oak Ave",
			ReceiverCity:  "Los Angeles",
			ReceiverCountry: "USA",
			ReceiverLat:  34.0522,
			ReceiverLng:  -118.2437,
			Status:       "pending",
		},
		{
			TrackingNumber:  "CN20240100003",
			Weight:         5.2,
			Length:         40,
			Width:          30,
			Height:         20,
			SenderName:     "王五",
			SenderAddress:  "广州市天河区",
			SenderCity:     "广州",
			SenderCountry:  "中国",
			ReceiverName:   "Tan Wei Ling",
			ReceiverAddress: "Blk 123 Jurong East",
			ReceiverCity:  "Singapore",
			ReceiverCountry: "Singapore",
			ReceiverLat:  1.3521,
			ReceiverLng:  103.8198,
			Status:       "shipped",
		},
	}

	for i := range parcels {
		DB.Create(&parcels[i])

		if parcels[i].Status == "shipped" {
			trackingLog := models.TrackingLog{
				ParcelID: parcels[i].ID,
				Status:   "shipped",
				Location: "深圳仓库",
				Latitude:  22.5431,
				Longitude: 114.0579,
				Remark:   "包裹已出库",
				CreatedAt: time.Now(),
			}
			DB.Create(&trackingLog)
		}
	}

	log.Println("Sample parcels created")
}
