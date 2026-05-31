package model

import (
	"time"
)

type InventoryPart struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	SKU         string    `gorm:"size:50;unique;not null" json:"sku"`
	Category    string    `gorm:"size:50" json:"category"`
	Quantity    int       `gorm:"not null;default:0;index" json:"quantity"`
	SafeStock   int       `gorm:"not null;default:10" json:"safeStock"`
	Unit        string    `gorm:"size:20;not null" json:"unit"`
	Location    string    `gorm:"size:100" json:"location"`
	Supplier    string    `gorm:"size:100" json:"supplier"`
	LastUpdated time.Time `gorm:"autoUpdateTime" json:"lastUpdated"`
}

type InventoryAlert struct {
	ID              uint   `json:"id"`
	PartID          uint   `json:"partId"`
	PartName        string `json:"partName"`
	CurrentQuantity int    `json:"currentQuantity"`
	SafeStock       int    `json:"safeStock"`
	Shortage        int    `json:"shortage"`
	Level           string `json:"level"`
}

type InventoryTransaction struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	PartID    uint      `gorm:"not null" json:"partId"`
	Type      string    `gorm:"size:20;not null" json:"type"`
	Quantity  int       `gorm:"not null" json:"quantity"`
	Notes     string    `gorm:"type:text" json:"notes"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

type InventoryStats struct {
	TotalItems      int64 `json:"totalItems"`
	LowStockItems   int64 `json:"lowStockItems"`
	OutStockItems   int64 `json:"outStockItems"`
	TotalValue      float64 `json:"totalValue"`
}
