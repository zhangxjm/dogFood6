package models

import (
	"time"
)

type User struct {
	ID              int64     `json:"id" db:"id"`
	Username        string    `json:"username" db:"username"`
	PasswordHash    string    `json:"-" db:"password_hash"`
	Name            string    `json:"name" db:"name"`
	Role            string    `json:"role" db:"role"`
	Age             int       `json:"age" db:"age"`
	Gender          string    `json:"gender" db:"gender"`
	Diagnosis       string    `json:"diagnosis" db:"diagnosis"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

type TrainingSession struct {
	ID              int64     `json:"id" db:"id"`
	UserID          int64     `json:"user_id" db:"user_id"`
	UserName        string    `json:"user_name" db:"user_name"`
	Type            string    `json:"type" db:"type"`
	Command         string    `json:"command" db:"command"`
	StartTime       time.Time `json:"start_time" db:"start_time"`
	EndTime         time.Time `json:"end_time" db:"end_time"`
	Duration        int       `json:"duration" db:"duration"`
	SuccessRate     float64   `json:"success_rate" db:"success_rate"`
	AvgAccuracy     float64   `json:"avg_accuracy" db:"avg_accuracy"`
	Status          string    `json:"status" db:"status"`
	Notes           string    `json:"notes" db:"notes"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
}

type EEGSignal struct {
	ID          int64     `json:"id" db:"id"`
	SessionID   int64     `json:"session_id" db:"session_id"`
	UserID      int64     `json:"user_id" db:"user_id"`
	Timestamp   time.Time `json:"timestamp" db:"timestamp"`
	Channel1    float64   `json:"ch1" db:"channel_1"`
	Channel2    float64   `json:"ch2" db:"channel_2"`
	Channel3    float64   `json:"ch3" db:"channel_3"`
	Channel4    float64   `json:"ch4" db:"channel_4"`
	Channel5    float64   `json:"ch5" db:"channel_5"`
	Channel6    float64   `json:"ch6" db:"channel_6"`
	Channel7    float64   `json:"ch7" db:"channel_7"`
	Channel8    float64   `json:"ch8" db:"channel_8"`
	SignalQuality float64 `json:"signal_quality" db:"signal_quality"`
	Command     string    `json:"command" db:"command"`
	Processed   bool      `json:"processed" db:"processed"`
}

type TrainingCommand struct {
	ID          int64  `json:"id" db:"id"`
	Code        string `json:"code" db:"code"`
	Name        string `json:"name" db:"name"`
	Description string `json:"description" db:"description"`
	Category    string `json:"category" db:"category"`
	Difficulty  int    `json:"difficulty" db:"difficulty"`
}

type ProgressSummary struct {
	UserID          int64   `json:"user_id"`
	TotalSessions   int     `json:"total_sessions"`
	TotalDuration   int     `json:"total_duration"`
	AvgSuccessRate  float64 `json:"avg_success_rate"`
	AvgAccuracy     float64 `json:"avg_accuracy"`
	WeeklySessions  int     `json:"weekly_sessions"`
	StreakDays      int     `json:"streak_days"`
	ImprovementRate float64 `json:"improvement_rate"`
}

type TrainingPlan struct {
	ID              int64     `json:"id" db:"id"`
	UserID          int64     `json:"user_id" db:"user_id"`
	Name            string    `json:"name" db:"name"`
	Description     string    `json:"description" db:"description"`
	Commands        []string  `json:"commands" db:"-"`
	CommandsStr     string    `json:"-" db:"commands"`
	Frequency       int       `json:"frequency" db:"frequency"`
	DurationPerSession int    `json:"duration_per_session" db:"duration_per_session"`
	StartDate       time.Time `json:"start_date" db:"start_date"`
	EndDate         time.Time `json:"end_date" db:"end_date"`
	Status          string    `json:"status" db:"status"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
}
