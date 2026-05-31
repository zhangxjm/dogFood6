package models

import (
	"time"

	"gorm.io/gorm"
)

type Warehouse struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"size:100;not null" json:"name"`
	Address   string         `gorm:"size:255" json:"address"`
	City      string         `gorm:"size:100" json:"city"`
	Country   string         `gorm:"size:100" json:"country"`
	Latitude  float64        `json:"latitude"`
	Longitude float64        `json:"longitude"`
	Capacity  int            `json:"capacity"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Parcel struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	TrackingNumber  string         `gorm:"size:50;unique;not null" json:"tracking_number"`
	Weight          float64        `json:"weight"`
	Length          float64        `json:"length"`
	Width           float64        `json:"width"`
	Height          float64        `json:"height"`
	SenderName      string         `gorm:"size:100" json:"sender_name"`
	SenderAddress   string         `gorm:"size:255" json:"sender_address"`
	SenderCity      string         `gorm:"size:100" json:"sender_city"`
	SenderCountry   string         `gorm:"size:100" json:"sender_country"`
	ReceiverName    string         `gorm:"size:100" json:"receiver_name"`
	ReceiverAddress string         `gorm:"size:255" json:"receiver_address"`
	ReceiverCity    string         `gorm:"size:100" json:"receiver_city"`
	ReceiverCountry string         `gorm:"size:100" json:"receiver_country"`
	ReceiverLat     float64        `json:"receiver_lat"`
	ReceiverLng     float64        `json:"receiver_lng"`
	Status          string         `gorm:"size:50;default:'pending'" json:"status"`
	CurrentWarehouseID *uint          `json:"current_warehouse_id"`
	CurrentWarehouse *Warehouse     `gorm:"foreignKey:CurrentWarehouseID" json:"current_warehouse,omitempty"`
	TargetWarehouseID *uint          `json:"target_warehouse_id"`
	TargetWarehouse  *Warehouse     `gorm:"foreignKey:TargetWarehouseID" json:"target_warehouse,omitempty"`
	RoutePlan     string         `gorm:"type:text" json:"route_plan"`
	EstimatedDelivery *time.Time     `json:"estimated_delivery"`
	ActualDelivery  *time.Time     `json:"actual_delivery"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type TrackingLog struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	ParcelID  uint           `json:"parcel_id"`
	Parcel    *Parcel        `gorm:"foreignKey:ParcelID" json:"parcel,omitempty"`
	Status    string         `gorm:"size:50" json:"status"`
	Location  string         `gorm:"size:255" json:"location"`
	Latitude  float64        `json:"latitude"`
	Longitude float64        `json:"longitude"`
	Remark    string         `gorm:"size:255" json:"remark"`
	CreatedAt time.Time      `json:"created_at"`
}

type SortingTask struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	ParcelID    uint           `json:"parcel_id"`
	Parcel      *Parcel        `gorm:"foreignKey:ParcelID" json:"parcel,omitempty"`
	SourceWarehouseID uint      `json:"source_warehouse_id"`
	SourceWarehouse *Warehouse `gorm:"foreignKey:SourceWarehouseID" json:"source_warehouse,omitempty"`
	TargetWarehouseID uint      `json:"target_warehouse_id"`
	TargetWarehouse *Warehouse `gorm:"foreignKey:TargetWarehouseID" json:"target_warehouse,omitempty"`
	Priority    int            `gorm:"default:0" json:"priority"`
	Status      string         `gorm:"size:50;default:'pending'" json:"status"`
	ProcessedAt *time.Time     `json:"processed_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

type Route struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	ParcelID      uint           `json:"parcel_id"`
	Parcel        *Parcel        `gorm:"foreignKey:ParcelID" json:"parcel,omitempty"`
	SourceWarehouseID uint      `json:"source_warehouse_id"`
	SourceWarehouse *Warehouse `gorm:"foreignKey:SourceWarehouseID" json:"source_warehouse,omitempty"`
	TargetWarehouseID uint      `json:"target_warehouse_id"`
	TargetWarehouse *Warehouse `gorm:"foreignKey:TargetWarehouseID" json:"target_warehouse,omitempty"`
	Distance      float64        `json:"distance"`
	Duration      int            `json:"duration"`
	RouteData     string         `gorm:"type:text" json:"route_data"`
	Optimized     bool           `gorm:"default:false" json:"optimized"`
	CreatedAt     time.Time      `json:"created_at"`
}

type Statistics struct {
	TotalParcels      int64 `json:"total_parcels"`
	PendingParcels    int64 `json:"pending_parcels"`
	ShippedParcels   int64 `json:"shipped_parcels"`
	DeliveredParcels int64 `json:"delivered_parcels"`
	TotalWarehouses   int64 `json:"total_warehouses"`
	TodayParcels       int64 `json:"today_parcels"`
}
