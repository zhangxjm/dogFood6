package api

import (
	"iiot-predictive-maintenance/internal/model"
	"iiot-predictive-maintenance/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type MaintenanceHandler struct {
	maintenanceService *service.MaintenanceService
}

func NewMaintenanceHandler() *MaintenanceHandler {
	return &MaintenanceHandler{
		maintenanceService: service.NewMaintenanceService(),
	}
}

func (h *MaintenanceHandler) ListPlans(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	status := c.Query("status")
	deviceID, _ := strconv.ParseUint(c.Query("deviceId"), 10, 32)

	total, plans, err := h.maintenanceService.ListPlans(page, pageSize, status, uint(deviceID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":    total,
		"items":    plans,
		"page":     page,
		"pageSize": pageSize,
	})
}

func (h *MaintenanceHandler) GetPlanByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的计划ID"})
		return
	}

	plan, err := h.maintenanceService.GetPlanByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "维护计划不存在"})
		return
	}

	c.JSON(http.StatusOK, plan)
}

func (h *MaintenanceHandler) CreatePlan(c *gin.Context) {
	var plan model.MaintenancePlan
	if err := c.ShouldBindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	if err := h.maintenanceService.CreatePlan(&plan); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, plan)
}

func (h *MaintenanceHandler) UpdatePlan(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的计划ID"})
		return
	}

	var plan model.MaintenancePlan
	if err := c.ShouldBindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	plan.ID = uint(id)
	if err := h.maintenanceService.UpdatePlan(&plan); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, plan)
}

func (h *MaintenanceHandler) UpdatePlanStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的计划ID"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	if err := h.maintenanceService.UpdatePlanStatus(uint(id), req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "状态更新成功"})
}

func (h *MaintenanceHandler) DeletePlan(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的计划ID"})
		return
	}

	if err := h.maintenanceService.DeletePlan(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func (h *MaintenanceHandler) ExecutePlan(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的计划ID"})
		return
	}

	var req model.ExecutePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	if err := h.maintenanceService.ExecutePlan(uint(id), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "维护执行完成"})
}

func (h *MaintenanceHandler) GetStats(c *gin.Context) {
	stats, err := h.maintenanceService.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

func (h *MaintenanceHandler) GeneratePlans(c *gin.Context) {
	if err := h.maintenanceService.GeneratePlans(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "维护计划生成完成"})
}

func (h *MaintenanceHandler) GetCalendarData(c *gin.Context) {
	months, _ := strconv.Atoi(c.DefaultQuery("months", "2"))

	data, err := h.maintenanceService.GetCalendarData(months)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": data})
}

func (h *MaintenanceHandler) GetRecords(c *gin.Context) {
	deviceID, _ := strconv.ParseUint(c.Query("deviceId"), 10, 32)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	records, err := h.maintenanceService.GetRecords(uint(deviceID), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": records})
}
