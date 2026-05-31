package models

import "time"

type Device struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	IPAddress   string    `json:"ip_address"`
	Status      string    `json:"status"`
	CPUUsage    float64   `json:"cpu_usage"`
	MemoryUsage float64   `json:"memory_usage"`
	ProductLine string    `json:"product_line"`
	LastSeen    time.Time `json:"last_seen"`
	CreatedAt   time.Time `json:"created_at"`
}

type ProductLine struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	DeviceCount int       `json:"device_count"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

type EdgeTask struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Type        string    `json:"type"`
	DeviceID    string    `json:"device_id"`
	Status      string    `json:"status"`
	Priority    int       `json:"priority"`
	Payload     string    `json:"payload"`
	Result      string    `json:"result"`
	CreatedAt   time.Time `json:"created_at"`
	CompletedAt time.Time `json:"completed_at"`
}

type SensorData struct {
	ID          string    `json:"id"`
	DeviceID    string    `json:"device_id"`
	Metric      string    `json:"metric"`
	Value       float64   `json:"value"`
	Unit        string    `json:"unit"`
	Timestamp   time.Time `json:"timestamp"`
	Processed   bool      `json:"processed"`
}

type LogEntry struct {
	ID        string    `json:"id"`
	DeviceID  string    `json:"device_id"`
	Level     string    `json:"level"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

type OfflineCache struct {
	ID        string    `json:"id"`
	DeviceID  string    `json:"device_id"`
	DataType  string    `json:"data_type"`
	Data      string    `json:"data"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type SystemStats struct {
	TotalDevices    int     `json:"total_devices"`
	OnlineDevices   int     `json:"online_devices"`
	OfflineDevices  int     `json:"offline_devices"`
	ActiveTasks     int     `json:"active_tasks"`
	PendingTasks    int     `json:"pending_tasks"`
	CompletedTasks  int     `json:"completed_tasks"`
	CacheCount      int     `json:"cache_count"`
	DataProcessed   int64   `json:"data_processed"`
	CPUUsageAvg     float64 `json:"cpu_usage_avg"`
	MemoryUsageAvg  float64 `json:"memory_usage_avg"`
}
