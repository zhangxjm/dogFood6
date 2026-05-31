package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"warehouse-system/internal/models"
	"warehouse-system/internal/services"
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func sendSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

func sendError(c *gin.Context, code int, message string) {
	c.JSON(code, Response{
		Code:    code,
		Message: message,
	})
}

func getPageParams(c *gin.Context) (int, int) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	return page, pageSize
}

type DashboardHandler struct {
	warehouseService *services.WarehouseService
	expiryService    *services.ExpiryService
}

func NewDashboardHandler() *DashboardHandler {
	return &DashboardHandler{
		warehouseService: services.NewWarehouseService(),
		expiryService:    services.NewExpiryService(),
	}
}

func (h *DashboardHandler) GetStats(c *gin.Context) {
	stats, err := h.warehouseService.GetDashboardStats()
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	alertStats, _ := h.expiryService.GetAlertStats()
	stats["alert_stats"] = alertStats

	sendSuccess(c, stats)
}

type WarehouseHandler struct {
	service *services.WarehouseService
}

func NewWarehouseHandler() *WarehouseHandler {
	return &WarehouseHandler{
		service: services.NewWarehouseService(),
	}
}

func (h *WarehouseHandler) List(c *gin.Context) {
	page, pageSize := getPageParams(c)
	
	warehouses, total, err := h.service.GetAllWarehouseList(page, pageSize)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"list":  warehouses,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func (h *WarehouseHandler) Get(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	warehouse, err := h.service.GetWarehouseByID(uint(id))
	if err != nil {
		sendError(c, http.StatusNotFound, "Warehouse not found")
		return
	}
	sendSuccess(c, warehouse)
}

func (h *WarehouseHandler) Create(c *gin.Context) {
	var warehouse models.Warehouse
	if err := c.ShouldBindJSON(&warehouse); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.service.CreateWarehouse(&warehouse); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, warehouse)
}

func (h *WarehouseHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	warehouse, err := h.service.GetWarehouseByID(uint(id))
	if err != nil {
		sendError(c, http.StatusNotFound, "Warehouse not found")
		return
	}

	var updateData models.Warehouse
	if err := c.ShouldBindJSON(&updateData); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	if updateData.Name != "" {
		warehouse.Name = updateData.Name
	}
	if updateData.Location != "" {
		warehouse.Location = updateData.Location
	}
	if updateData.BondedQuota > 0 {
		warehouse.BondedQuota = updateData.BondedQuota
	}
	if updateData.Status != "" {
		warehouse.Status = updateData.Status
	}

	if err := h.service.UpdateWarehouse(warehouse); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, warehouse)
}

func (h *WarehouseHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.service.DeleteWarehouse(uint(id)); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, nil)
}

func (h *WarehouseHandler) GetQuotaUsage(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	usage, err := h.service.GetQuotaUsage(uint(id))
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, usage)
}

func (h *WarehouseHandler) GetQuotaTransactions(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	page, pageSize := getPageParams(c)
	
	transactions, total, err := h.service.GetQuotaTransactions(uint(id), page, pageSize)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"list":  transactions,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func (h *WarehouseHandler) GetInventoryStats(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	stats, err := h.service.GetWarehouseInventoryStats(uint(id))
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, stats)
}
