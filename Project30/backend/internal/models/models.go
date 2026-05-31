package models

import (
	"time"

	"gorm.io/gorm"
)

type Warehouse struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"size:100;not null" json:"name"`
	Location    string         `gorm:"size:255" json:"location"`
	BondedQuota float64        `gorm:"default:0" json:"bonded_quota"`
	UsedQuota   float64        `gorm:"default:0" json:"used_quota"`
	Status      string         `gorm:"size:20;default:active" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

type Product struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	SKU           string         `gorm:"size:50;uniqueIndex" json:"sku"`
	Name          string         `gorm:"size:200;not null" json:"name"`
	Category      string         `gorm:"size:100" json:"category"`
	Price         float64        `gorm:"default:0" json:"price"`
	BondedDuty    float64        `gorm:"default:0" json:"bonded_duty"`
	Unit          string         `gorm:"size:20" json:"unit"`
	ExpiryDays    int            `gorm:"default:0" json:"expiry_days"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

type Inventory struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	WarehouseID uint           `gorm:"not null;index" json:"warehouse_id"`
	ProductID   uint           `gorm:"not null;index" json:"product_id"`
	RFIDTag     string         `gorm:"size:100;uniqueIndex" json:"rfid_tag"`
	Quantity    int            `gorm:"default:0" json:"quantity"`
	BatchNumber string         `gorm:"size:100" json:"batch_number"`
	ExpiryDate  *time.Time     `json:"expiry_date"`
	Status      string         `gorm:"size:20;default:in_stock" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	Warehouse   Warehouse      `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	Product     Product        `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

type RFIDReader struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	ReaderID    string         `gorm:"size:50;uniqueIndex" json:"reader_id"`
	WarehouseID uint           `gorm:"not null;index" json:"warehouse_id"`
	Name        string         `gorm:"size:100" json:"name"`
	Location    string         `gorm:"size:255" json:"location"`
	Status      string         `gorm:"size:20;default:active" json:"status"`
	LastScan    *time.Time     `json:"last_scan"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

type StockTake struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	WarehouseID uint           `gorm:"not null;index" json:"warehouse_id"`
	ProductID   uint           `gorm:"not null;index" json:"product_id"`
	ExpectedQty int            `gorm:"default:0" json:"expected_qty"`
	ActualQty   int            `gorm:"default:0" json:"actual_qty"`
	DiffQty     int            `gorm:"default:0" json:"diff_qty"`
	Status      string         `gorm:"size:20;default:pending" json:"status"`
	TakenBy     string         `gorm:"size:100" json:"taken_by"`
	TakenAt     time.Time      `json:"taken_at"`
	CreatedAt   time.Time      `json:"created_at"`
}

type ExpiryAlert struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	WarehouseID uint           `gorm:"not null;index" json:"warehouse_id"`
	ProductID   uint           `gorm:"not null;index" json:"product_id"`
	InventoryID uint           `gorm:"not null;index" json:"inventory_id"`
	DaysLeft    int            `gorm:"default:0" json:"days_left"`
	Quantity    int            `gorm:"default:0" json:"quantity"`
	Level       string         `gorm:"size:20;default:warning" json:"level"`
	Status      string         `gorm:"size:20;default:active" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	Product     Product        `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Inventory   Inventory      `gorm:"foreignKey:InventoryID" json:"inventory,omitempty"`
}

type QuotaTransaction struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	WarehouseID uint           `gorm:"not null;index" json:"warehouse_id"`
	ProductID   uint           `gorm:"not null;index" json:"product_id"`
	Amount      float64        `gorm:"default:0" json:"amount"`
	Type        string         `gorm:"size:20" json:"type"`
	ReferenceNo string         `gorm:"size:100" json:"reference_no"`
	Remark      string         `gorm:"size:255" json:"remark"`
	CreatedAt   time.Time      `json:"created_at"`
}

type SyncLog struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	SourceWarehouseID uint      `gorm:"not null;index" json:"source_warehouse_id"`
	TargetWarehouseID uint      `gorm:"not null;index" json:"target_warehouse_id"`
	ProductID     uint           `gorm:"not null;index" json:"product_id"`
	Quantity      int            `gorm:"default:0" json:"quantity"`
	Status        string         `gorm:"size:20;default:pending" json:"status"`
	SyncID        string         `gorm:"size:100;uniqueIndex" json:"sync_id"`
	ErrorMsg      string         `gorm:"size:500" json:"error_msg"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
}
