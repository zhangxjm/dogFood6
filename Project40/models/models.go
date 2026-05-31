package models

import "time"

type Vehicle struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	LicensePlate string    `gorm:"uniqueIndex;size:20;not null" json:"license_plate"`
	VehicleType  string    `gorm:"size:50;not null" json:"vehicle_type"`
	LoadCapacity float64   `gorm:"not null" json:"load_capacity"`
	DriverName   string    `gorm:"size:50;not null" json:"driver_name"`
	DriverPhone  string    `gorm:"size:20;not null" json:"driver_phone"`
	Status       string    `gorm:"size:20;default:可用" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Route struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Name          string    `gorm:"size:100;not null" json:"name"`
	StartPoint    string    `gorm:"size:100;not null" json:"start_point"`
	EndPoint      string    `gorm:"size:100;not null" json:"end_point"`
	Distance      float64   `gorm:"not null" json:"distance"`
	EstimatedTime int       `gorm:"not null" json:"estimated_time"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Order struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	OrderNo       string    `gorm:"uniqueIndex;size:30;not null" json:"order_no"`
	VehicleID     uint      `gorm:"not null" json:"vehicle_id"`
	RouteID       uint      `gorm:"not null" json:"route_id"`
	CargoName     string    `gorm:"size:100;not null" json:"cargo_name"`
	CargoWeight   float64   `gorm:"not null" json:"cargo_weight"`
	ShipperName   string    `gorm:"size:50;not null" json:"shipper_name"`
	ShipperPhone  string    `gorm:"size:20;not null" json:"shipper_phone"`
	ReceiverName  string    `gorm:"size:50;not null" json:"receiver_name"`
	ReceiverPhone string    `gorm:"size:20;not null" json:"receiver_phone"`
	Status        string    `gorm:"size:20;default:待调度" json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	Vehicle       Vehicle   `gorm:"foreignKey:VehicleID" json:"vehicle"`
	Route         Route     `gorm:"foreignKey:RouteID" json:"route"`
	DeliveryStatuses []DeliveryStatus `gorm:"foreignKey:OrderID" json:"delivery_statuses"`
}

type DeliveryStatus struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	OrderID   uint      `gorm:"not null;index" json:"order_id"`
	Status    string    `gorm:"size:20;not null" json:"status"`
	Location  string    `gorm:"size:200" json:"location"`
	Remark    string    `gorm:"size:500" json:"remark"`
	CreatedAt time.Time `json:"created_at"`
	Order     Order     `gorm:"foreignKey:OrderID" json:"order"`
}
