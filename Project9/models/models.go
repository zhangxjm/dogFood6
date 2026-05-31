package models

import (
	"time"
)

type Classroom struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	Name          string         `json:"name" gorm:"not null;size:100"`
	Location      string         `json:"location" gorm:"size:200"`
	Capacity      int            `json:"capacity" gorm:"default:30"`
	Equipment     string         `json:"equipment" gorm:"size:500"`
	Status        string         `json:"status" gorm:"default:available"`
	Description   string         `json:"description" gorm:"size:500"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
}

type Course struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	Name          string         `json:"name" gorm:"not null;size:100"`
	Instructor    string         `json:"instructor" gorm:"size:50"`
	Description   string         `json:"description" gorm:"size:500"`
	Duration      int            `json:"duration" gorm:"default:2"`
	Color         string         `json:"color" gorm:"size:20;default:#3498db"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
}

type Booking struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	ClassroomID   uint           `json:"classroom_id" gorm:"not null"`
	Classroom     Classroom      `json:"classroom" gorm:"foreignKey:ClassroomID"`
	CourseID      uint           `json:"course_id" gorm:"not null"`
	Course        Course         `json:"course" gorm:"foreignKey:CourseID"`
	Date          string         `json:"date" gorm:"not null;size:20"`
	StartTime     string         `json:"start_time" gorm:"not null;size:10"`
	EndTime       string         `json:"end_time" gorm:"not null;size:10"`
	Status        string         `json:"status" gorm:"default:confirmed"`
	Notes         string         `json:"notes" gorm:"size:500"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
}

type UsageRecord struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	BookingID     uint           `json:"booking_id"`
	Booking       Booking        `json:"booking" gorm:"foreignKey:BookingID"`
	ClassroomID   uint           `json:"classroom_id"`
	Classroom     Classroom      `json:"classroom" gorm:"foreignKey:ClassroomID"`
	CourseID      uint           `json:"course_id"`
	Course        Course         `json:"course" gorm:"foreignKey:CourseID"`
	Date          string         `json:"date"`
	StartTime     string         `json:"start_time"`
	EndTime       string         `json:"end_time"`
	Duration      int            `json:"duration"`
	ActualUsers   int            `json:"actual_users" gorm:"default:0"`
	CreatedAt     time.Time      `json:"created_at"`
}

type APIResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}
