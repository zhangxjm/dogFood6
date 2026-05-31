package model

import (
	"time"
)

type Prediction struct {
	ID            uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	DeviceID      uint      `gorm:"not null;index" json:"deviceId"`
	DeviceName    string    `gorm:"-" json:"deviceName"`
	FaultType     string    `gorm:"size:50;not null" json:"faultType"`
	Probability   float64   `gorm:"not null" json:"probability"`
	RiskLevel     string    `gorm:"size:20;not null;index" json:"riskLevel"`
	PredictedDate time.Time `gorm:"not null" json:"predictedDate"`
	ModelVersion  string    `gorm:"size:20;not null" json:"modelVersion"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

type ModelInfoResponse struct {
	Name            string                 `json:"name"`
	Version         string                 `json:"version"`
	Accuracy        float64                `json:"accuracy"`
	TrainingSamples int                    `json:"trainingSamples"`
	LastTraining    string                 `json:"lastTraining"`
	Parameters      map[string]interface{} `json:"parameters"`
}

type PredictionRequest struct {
	DeviceID uint `json:"deviceId" binding:"required"`
}

type PredictionStats struct {
	Low      int64 `json:"low"`
	Medium   int64 `json:"medium"`
	High     int64 `json:"high"`
	Critical int64 `json:"critical"`
}
