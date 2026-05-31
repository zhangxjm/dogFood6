package api

import (
	"iiot-predictive-maintenance/internal/model"
	"iiot-predictive-maintenance/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PredictionHandler struct {
	predictionService *service.PredictionService
}

func NewPredictionHandler() *PredictionHandler {
	return &PredictionHandler{
		predictionService: service.NewPredictionService(),
	}
}

func (h *PredictionHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	riskLevel := c.Query("riskLevel")
	deviceID, _ := strconv.ParseUint(c.Query("deviceId"), 10, 32)

	total, predictions, err := h.predictionService.List(page, pageSize, riskLevel, uint(deviceID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":    total,
		"items":    predictions,
		"page":     page,
		"pageSize": pageSize,
	})
}

func (h *PredictionHandler) Predict(c *gin.Context) {
	var req model.PredictionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	prediction, err := h.predictionService.Predict(req.DeviceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, prediction)
}

func (h *PredictionHandler) PredictAll(c *gin.Context) {
	if err := h.predictionService.PredictAll(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "预测完成"})
}

func (h *PredictionHandler) GetModelInfo(c *gin.Context) {
	info, err := h.predictionService.GetModelInfo()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, info)
}

func (h *PredictionHandler) GetHighRisk(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	predictions, err := h.predictionService.GetHighRiskPredictions(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": predictions})
}

func (h *PredictionHandler) GetStats(c *gin.Context) {
	stats, err := h.predictionService.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

func (h *PredictionHandler) GetPredictionSeries(c *gin.Context) {
	deviceID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的设备ID"})
		return
	}

	days, _ := strconv.Atoi(c.DefaultQuery("days", "7"))

	data, err := h.predictionService.GetPredictionSeries(uint(deviceID), days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}
