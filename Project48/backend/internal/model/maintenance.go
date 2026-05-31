package model

import (
	"time"
)

type MaintenancePlan struct {
	ID             uint              `gorm:"primaryKey;autoIncrement" json:"id"`
	DeviceID       uint              `gorm:"not null" json:"deviceId"`
	DeviceName     string            `gorm:"-" json:"deviceName"`
	AssigneeID     *uint             `json:"assigneeId"`
	AssigneeName   string            `gorm:"-" json:"assignee"`
	Title          string            `gorm:"size:200;not null" json:"title"`
	Type           string            `gorm:"size:20;not null" json:"type"`
	Status         string            `gorm:"size:20;not null;default:'pending';index" json:"status"`
	Priority       string            `gorm:"size:20;not null;default:'medium'" json:"priority"`
	ScheduledDate  time.Time         `gorm:"not null;index" json:"scheduledDate"`
	EstimatedHours *float64          `json:"estimatedHours"`
	ActualHours    *float64          `json:"actualHours"`
	Description    string            `gorm:"type:text" json:"description"`
	CreatedAt      time.Time         `gorm:"autoCreateTime" json:"createdAt"`
	Parts          []MaintenancePart `gorm:"foreignKey:PlanID" json:"parts,omitempty"`
}

type MaintenancePart struct {
	ID       uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	PlanID   uint   `gorm:"not null" json:"planId"`
	PartID   uint   `gorm:"not null" json:"partId"`
	PartName string `gorm:"-" json:"partName"`
	Quantity int    `gorm:"not null" json:"quantity"`
}

type MaintenanceRecord struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	DeviceID    uint      `gorm:"not null" json:"deviceId"`
	PlanID      *uint     `json:"planId"`
	Result      string    `gorm:"size:20;not null" json:"result"`
	Cost        *float64  `json:"cost"`
	Notes       string    `gorm:"type:text" json:"notes"`
	CompletedAt time.Time `gorm:"autoCreateTime" json:"completedAt"`
}

type ExecutePlanRequest struct {
	ActualHours float64           `json:"actualHours" binding:"required"`
	Notes       string            `json:"notes"`
	PartsUsed   []MaintenancePart `json:"partsUsed"`
}

type MaintenanceStats struct {
	Pending    int64 `json:"pending"`
	Approved   int64 `json:"approved"`
	InProgress int64 `json:"inProgress"`
	Completed  int64 `json:"completed"`
	Overdue    int64 `json:"overdue"`
	Today      int64 `json:"today"`
	ThisWeek   int64 `json:"thisWeek"`
}
