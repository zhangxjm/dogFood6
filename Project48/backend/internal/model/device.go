package model

import (
	"time"
)

type Device struct {
	ID              uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name            string    `gorm:"size:100;not null" json:"name"`
	Code            string    `gorm:"size:50;unique;not null" json:"code"`
	Type            string    `gorm:"size:50;not null" json:"type"`
	Location        string    `gorm:"size:100;not null" json:"location"`
	Status          string    `gorm:"size:20;not null;default:'online'" json:"status"`
	HealthScore     int       `gorm:"not null;default:100" json:"healthScore"`
	LastMaintenance *time.Time `json:"lastMaintenance"`
	InstallDate     time.Time `gorm:"not null" json:"installDate"`
	Description     string    `gorm:"type:text" json:"description"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"createdAt"`
	Sensors         []Sensor  `gorm:"foreignKey:DeviceID" json:"sensors,omitempty"`
}

type Sensor struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	DeviceID    uint      `gorm:"not null" json:"deviceId"`
	Name        string    `gorm:"size:50;not null" json:"name"`
	Type        string    `gorm:"size:50;not null" json:"type"`
	Unit        string    `gorm:"size:20;not null" json:"unit"`
	MinValue    float64   `gorm:"not null" json:"minValue"`
	MaxValue    float64   `gorm:"not null" json:"maxValue"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
	CurrentValue float64  `gorm:"-" json:"currentValue,omitempty"`
}

type RealtimeDataResponse struct {
	Timestamp string             `json:"timestamp"`
	Data      map[string]float64 `json:"data"`
}

type HistoryDataResponse struct {
	Timestamps []string           `json:"timestamps"`
	Data       map[string][]float64 `json:"data"`
}

type DeviceStats struct {
	Total      int64 `json:"total"`
	Online     int64 `json:"online"`
	Warning    int64 `json:"warning"`
	Error      int64 `json:"error"`
	AvgHealth  float64 `json:"avgHealth"`
}
