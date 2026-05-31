package api

import (
	"iiot-predictive-maintenance/internal/model"
	"iiot-predictive-maintenance/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type InventoryHandler struct {
	inventoryService *service.InventoryService
}

func NewInventoryHandler() *InventoryHandler {
	return &InventoryHandler{
		inventoryService: service.NewInventoryService(),
	}
}

func (h *InventoryHandler) ListParts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	keyword := c.Query("keyword")
	category := c.Query("category")

	total, parts, err := h.inventoryService.ListParts(page, pageSize, keyword, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":    total,
		"items":    parts,
		"page":     page,
		"pageSize": pageSize,
	})
}

func (h *InventoryHandler) GetPartByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的备件ID"})
		return
	}

	part, err := h.inventoryService.GetPartByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "备件不存在"})
		return
	}

	c.JSON(http.StatusOK, part)
}

func (h *InventoryHandler) CreatePart(c *gin.Context) {
	var part model.InventoryPart
	if err := c.ShouldBindJSON(&part); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	if err := h.inventoryService.CreatePart(&part); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, part)
}

func (h *InventoryHandler) UpdatePart(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的备件ID"})
		return
	}

	var part model.InventoryPart
	if err := c.ShouldBindJSON(&part); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	part.ID = uint(id)
	if err := h.inventoryService.UpdatePart(&part); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, part)
}

func (h *InventoryHandler) DeletePart(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的备件ID"})
		return
	}

	if err := h.inventoryService.DeletePart(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func (h *InventoryHandler) GetAlerts(c *gin.Context) {
	alerts, err := h.inventoryService.GetAlerts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": alerts})
}

func (h *InventoryHandler) GetStats(c *gin.Context) {
	stats, err := h.inventoryService.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

func (h *InventoryHandler) AddStock(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的备件ID"})
		return
	}

	var req struct {
		Quantity int    `json:"quantity" binding:"required,min=1"`
		Notes    string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	if err := h.inventoryService.AddStock(uint(id), req.Quantity, req.Notes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "入库成功"})
}

func (h *InventoryHandler) ConsumePart(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的备件ID"})
		return
	}

	var req struct {
		Quantity int    `json:"quantity" binding:"required,min=1"`
		Notes    string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	if err := h.inventoryService.ConsumePart(uint(id), req.Quantity, req.Notes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "出库成功"})
}

func (h *InventoryHandler) GetTransactions(c *gin.Context) {
	partID, _ := strconv.ParseUint(c.Query("partId"), 10, 32)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	transactions, err := h.inventoryService.GetTransactions(uint(partID), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": transactions})
}

func (h *InventoryHandler) GetPurchaseSuggestions(c *gin.Context) {
	suggestions, err := h.inventoryService.GeneratePurchaseSuggestion()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": suggestions})
}

func (h *InventoryHandler) GetUsageTrend(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的备件ID"})
		return
	}

	days, _ := strconv.Atoi(c.DefaultQuery("days", "30"))

	data, err := h.inventoryService.GetUsageTrend(uint(id), days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, data)
}
