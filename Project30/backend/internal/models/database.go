package models

import (
	"database/sql"
	"log"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"warehouse-system/internal/config"

	_ "modernc.org/sqlite"
)

var DB *gorm.DB

func InitDB() {
	var err error

	sqlDB, err := sql.Open("sqlite", config.AppConfig.DatabasePath)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	DB, err = gorm.Open(sqlite.Dialector{
		Conn: sqlDB,
	}, &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	err = DB.AutoMigrate(
		&Warehouse{},
		&Product{},
		&Inventory{},
		&RFIDReader{},
		&StockTake{},
		&ExpiryAlert{},
		&QuotaTransaction{},
		&SyncLog{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migration completed successfully")
}

func SeedData() {
	var count int64
	DB.Model(&Warehouse{}).Count(&count)
	if count > 0 {
		log.Println("Data already seeded, skipping...")
		return
	}

	warehouses := []Warehouse{
		{Name: "上海保税仓", Location: "上海浦东新区", BondedQuota: 1000000.00, UsedQuota: 0, Status: "active"},
		{Name: "深圳保税仓", Location: "深圳前海自贸区", BondedQuota: 800000.00, UsedQuota: 0, Status: "active"},
		{Name: "广州保税仓", Location: "广州南沙保税区", BondedQuota: 600000.00, UsedQuota: 0, Status: "active"},
	}
	for i := range warehouses {
		DB.Create(&warehouses[i])
	}

	products := []Product{
		{SKU: "SKU001", Name: "进口奶粉", Category: "食品", Price: 298.00, BondedDuty: 29.80, Unit: "罐", ExpiryDays: 730},
		{SKU: "SKU002", Name: "红酒", Category: "酒类", Price: 588.00, BondedDuty: 88.20, Unit: "瓶", ExpiryDays: 3650},
		{SKU: "SKU003", Name: "护肤品套装", Category: "美妆", Price: 1280.00, BondedDuty: 192.00, Unit: "套", ExpiryDays: 1095},
		{SKU: "SKU004", Name: "保健品", Category: "保健", Price: 399.00, BondedDuty: 39.90, Unit: "盒", ExpiryDays: 730},
		{SKU: "SKU005", Name: "进口零食大礼包", Category: "食品", Price: 168.00, BondedDuty: 16.80, Unit: "包", ExpiryDays: 180},
		{SKU: "SKU006", Name: "香水", Category: "美妆", Price: 680.00, BondedDuty: 102.00, Unit: "瓶", ExpiryDays: 1825},
	}
	for i := range products {
		DB.Create(&products[i])
	}

	now := time.Now()
	expiry1 := now.AddDate(0, 2, 0)
	expiry2 := now.AddDate(0, 6, 0)
	expiry3 := now.AddDate(1, 0, 0)

	inventories := []Inventory{
		{WarehouseID: 1, ProductID: 1, RFIDTag: "RFID-001-001", Quantity: 500, BatchNumber: "B20240101", ExpiryDate: &expiry1, Status: "in_stock"},
		{WarehouseID: 1, ProductID: 2, RFIDTag: "RFID-001-002", Quantity: 200, BatchNumber: "B20240102", ExpiryDate: &expiry2, Status: "in_stock"},
		{WarehouseID: 1, ProductID: 3, RFIDTag: "RFID-001-003", Quantity: 150, BatchNumber: "B20240103", ExpiryDate: &expiry3, Status: "in_stock"},
		{WarehouseID: 2, ProductID: 1, RFIDTag: "RFID-002-001", Quantity: 300, BatchNumber: "B20240104", ExpiryDate: &expiry1, Status: "in_stock"},
		{WarehouseID: 2, ProductID: 4, RFIDTag: "RFID-002-002", Quantity: 400, BatchNumber: "B20240105", ExpiryDate: &expiry2, Status: "in_stock"},
		{WarehouseID: 2, ProductID: 5, RFIDTag: "RFID-002-003", Quantity: 600, BatchNumber: "B20240106", ExpiryDate: &expiry1, Status: "in_stock"},
		{WarehouseID: 3, ProductID: 2, RFIDTag: "RFID-003-001", Quantity: 180, BatchNumber: "B20240107", ExpiryDate: &expiry3, Status: "in_stock"},
		{WarehouseID: 3, ProductID: 3, RFIDTag: "RFID-003-002", Quantity: 120, BatchNumber: "B20240108", ExpiryDate: &expiry2, Status: "in_stock"},
		{WarehouseID: 3, ProductID: 6, RFIDTag: "RFID-003-003", Quantity: 250, BatchNumber: "B20240109", ExpiryDate: &expiry3, Status: "in_stock"},
	}
	for i := range inventories {
		DB.Create(&inventories[i])
	}

	readers := []RFIDReader{
		{ReaderID: "READER-001", WarehouseID: 1, Name: "入口阅读器", Location: "A区入口", Status: "active"},
		{ReaderID: "READER-002", WarehouseID: 1, Name: "货架A阅读器", Location: "A区货架", Status: "active"},
		{ReaderID: "READER-003", WarehouseID: 2, Name: "入口阅读器", Location: "B区入口", Status: "active"},
		{ReaderID: "READER-004", WarehouseID: 3, Name: "入口阅读器", Location: "C区入口", Status: "active"},
	}
	for i := range readers {
		DB.Create(&readers[i])
	}

	log.Println("Seed data inserted successfully")
}
