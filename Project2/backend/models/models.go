package models

import (
	"time"

	"gorm.io/gorm"
)

type Product struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Name          string         `gorm:"size:100;not null" json:"name"`
	Category      string         `gorm:"size:50;not null" json:"category"`
	Unit          string         `gorm:"size:20;not null" json:"unit"`
	Stock         float64        `gorm:"default:0" json:"stock"`
	WarningStock  float64        `gorm:"default:10" json:"warning_stock"`
	RetailPrice   float64        `gorm:"not null" json:"retail_price"`
	PurchasePrice float64        `gorm:"not null" json:"purchase_price"`
	Supplier      string         `gorm:"size:100" json:"supplier"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type Purchase struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	ProductID   uint           `gorm:"not null;index" json:"product_id"`
	Product     Product        `gorm:"foreignKey:ProductID" json:"product"`
	Quantity    float64        `gorm:"not null" json:"quantity"`
	UnitPrice   float64        `gorm:"not null" json:"unit_price"`
	TotalAmount float64        `gorm:"not null" json:"total_amount"`
	Supplier    string         `gorm:"size:100" json:"supplier"`
	Operator    string         `gorm:"size:50" json:"operator"`
	Remark      string         `gorm:"size:255" json:"remark"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Sale struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	ProductID   uint           `gorm:"not null;index" json:"product_id"`
	Product     Product        `gorm:"foreignKey:ProductID" json:"product"`
	Quantity    float64        `gorm:"not null" json:"quantity"`
	UnitPrice   float64        `gorm:"not null" json:"unit_price"`
	TotalAmount float64        `gorm:"not null" json:"total_amount"`
	Customer    string         `gorm:"size:50" json:"customer"`
	Operator    string         `gorm:"size:50" json:"operator"`
	Remark      string         `gorm:"size:255" json:"remark"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type MonthlyStats struct {
	Month          string  `json:"month"`
	TotalSales     float64 `json:"total_sales"`
	TotalCost      float64 `json:"total_cost"`
	TotalProfit    float64 `json:"total_profit"`
	SaleCount      int64   `json:"sale_count"`
	PurchaseCount  int64   `json:"purchase_count"`
}
