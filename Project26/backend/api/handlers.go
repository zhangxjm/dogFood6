package api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"quantum-key-distribution/database"
	"quantum-key-distribution/quantum"
)

type GenerateKeyRequest struct {
	Length int `json:"length"`
}

type TransmitKeyRequest struct {
	KeyID        string  `json:"key_id"`
	Sender       string  `json:"sender"`
	Receiver     string  `json:"receiver"`
	EavesdropProb float64 `json:"eavesdrop_prob"`
}

type CheckKeyRequest struct {
	Key string `json:"key"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func RegisterRoutes(e *echo.Echo) {
	e.GET("/api/health", healthCheck)
	e.POST("/api/keys/generate", generateKey)
	e.POST("/api/keys/transmit", transmitKey)
	e.POST("/api/keys/check", checkKey)
	e.GET("/api/keys", listKeys)
	e.GET("/api/keys/:id", getKey)
	e.GET("/api/keys/:id/checks", listKeyChecks)
	e.GET("/api/stats", getStats)
}

func healthCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data: map[string]string{
			"status":  "ok",
			"service": "quantum-key-distribution",
		},
	})
}

func generateKey(c echo.Context) error {
	var req GenerateKeyRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   "Invalid request body",
		})
	}

	if req.Length <= 0 {
		req.Length = 256
	}

	result, err := quantum.GenerateBB84Key(req.Length)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{
			Success: false,
			Error:   err.Error(),
		})
	}

	record := &database.KeyRecord{
		ID:        result.ID,
		Key:       result.Key,
		Length:    result.Length,
		Sender:    "system",
		Receiver:  "system",
		Status:    "generated",
		ErrorRate: result.ErrorRate,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	if err := database.InsertKeyRecord(record); err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{
			Success: false,
			Error:   "Failed to save key record",
		})
	}

	return c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    result,
	})
}

func transmitKey(c echo.Context) error {
	var req TransmitKeyRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   "Invalid request body",
		})
	}

	if req.KeyID == "" {
		return c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   "Key ID is required",
		})
	}

	if req.Sender == "" || req.Receiver == "" {
		req.Sender = "Alice"
		req.Receiver = "Bob"
	}

	result, err := quantum.SimulateTransmission(req.KeyID, req.Sender, req.Receiver, req.EavesdropProb)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{
			Success: false,
			Error:   err.Error(),
		})
	}

	status := "transmitted"
	if result.Eavesdropped {
		status = "compromised"
	} else if !result.Success {
		status = "failed"
	}

	if err := database.UpdateKeyRecordStatus(req.KeyID, status); err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{
			Success: false,
			Error:   "Failed to update key status",
		})
	}

	return c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    result,
	})
}

func checkKey(c echo.Context) error {
	var req CheckKeyRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   "Invalid request body",
		})
	}

	if req.Key == "" {
		return c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   "Key is required",
		})
	}

	results := quantum.PerformSecurityChecks(req.Key)

	totalScore := 0
	for _, r := range results {
		totalScore += r.Score
	}

	return c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"checks":      results,
			"total_score": totalScore,
			"max_score":   100,
		},
	})
}

func listKeys(c echo.Context) error {
	limitStr := c.QueryParam("limit")
	limit := 50
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	records, err := database.GetKeyRecords(limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{
			Success: false,
			Error:   "Failed to retrieve keys",
		})
	}

	return c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    records,
	})
}

func getKey(c echo.Context) error {
	id := c.Param("id")
	record, err := database.GetKeyRecordByID(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, APIResponse{
			Success: false,
			Error:   "Key not found",
		})
	}

	return c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    record,
	})
}

func listKeyChecks(c echo.Context) error {
	keyID := c.Param("id")
	checks, err := database.GetSecurityChecksByKeyID(keyID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{
			Success: false,
			Error:   "Failed to retrieve security checks",
		})
	}

	return c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data:    checks,
	})
}

func getStats(c echo.Context) error {
	records, err := database.GetKeyRecords(1000)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, APIResponse{
			Success: false,
			Error:   "Failed to retrieve statistics",
		})
	}

	totalKeys := len(records)
	successCount := 0
	compromisedCount := 0
	failedCount := 0
	totalLength := 0

	for _, r := range records {
		totalLength += r.Length
		switch r.Status {
		case "generated", "transmitted":
			successCount++
		case "compromised":
			compromisedCount++
		case "failed":
			failedCount++
		}
	}

	avgLength := 0
	if totalKeys > 0 {
		avgLength = totalLength / totalKeys
	}

	return c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"total_keys":        totalKeys,
			"successful_keys":   successCount,
			"compromised_keys":  compromisedCount,
			"failed_keys":       failedCount,
			"average_key_length": avgLength,
		},
	})
}
