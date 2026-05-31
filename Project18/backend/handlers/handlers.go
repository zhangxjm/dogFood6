package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"edge-computing-platform/services"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	edgeService *services.EdgeService
}

func NewHandler(edgeService *services.EdgeService) *Handler {
	return &Handler{
		edgeService: edgeService,
	}
}

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func (h *Handler) GetProductLines(c echo.Context) error {
	lines, err := h.edgeService.GetAllProductLines()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true, Data: lines})
}

func (h *Handler) CreateProductLine(c echo.Context) error {
	var req struct {
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid request"})
	}

	line, err := h.edgeService.CreateProductLine(req.Name, req.Description)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusCreated, Response{Success: true, Data: line})
}

func (h *Handler) UpdateProductLine(c echo.Context) error {
	id := c.Param("id")
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Status      string `json:"status"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid request"})
	}

	if err := h.edgeService.UpdateProductLine(id, req.Name, req.Description, req.Status); err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true})
}

func (h *Handler) DeleteProductLine(c echo.Context) error {
	id := c.Param("id")
	if err := h.edgeService.DeleteProductLine(id); err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true})
}

func (h *Handler) GetDevices(c echo.Context) error {
	devices, err := h.edgeService.GetAllDevices()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true, Data: devices})
}

func (h *Handler) GetDevice(c echo.Context) error {
	id := c.Param("id")
	device, err := h.edgeService.GetDevice(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, Response{Success: false, Error: "Device not found"})
	}
	return c.JSON(http.StatusOK, Response{Success: true, Data: device})
}

func (h *Handler) CreateDevice(c echo.Context) error {
	var req struct {
		Name        string `json:"name" validate:"required"`
		IPAddress   string `json:"ip_address"`
		ProductLine string `json:"product_line"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid request"})
	}

	device, err := h.edgeService.CreateDevice(req.Name, req.IPAddress, req.ProductLine)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusCreated, Response{Success: true, Data: device})
}

func (h *Handler) UpdateDevice(c echo.Context) error {
	id := c.Param("id")
	var req struct {
		Name        string `json:"name"`
		IPAddress   string `json:"ip_address"`
		ProductLine string `json:"product_line"`
		Status      string `json:"status"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid request"})
	}

	if err := h.edgeService.UpdateDevice(id, req.Name, req.IPAddress, req.ProductLine, req.Status); err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true})
}

func (h *Handler) DeleteDevice(c echo.Context) error {
	id := c.Param("id")
	if err := h.edgeService.DeleteDevice(id); err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true})
}

func (h *Handler) UpdateDeviceStatus(c echo.Context) error {
	id := c.Param("id")
	var req struct {
		CPUUsage    float64 `json:"cpu_usage"`
		MemoryUsage float64 `json:"memory_usage"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid request"})
	}

	if err := h.edgeService.UpdateDeviceStatus(id, req.CPUUsage, req.MemoryUsage); err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true})
}

func (h *Handler) GetTasks(c echo.Context) error {
	tasks, err := h.edgeService.GetAllTasks()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true, Data: tasks})
}

func (h *Handler) CreateTask(c echo.Context) error {
	var req struct {
		Name      string `json:"name" validate:"required"`
		Type      string `json:"type" validate:"required"`
		DeviceID  string `json:"device_id"`
		Priority  int    `json:"priority"`
		Payload   string `json:"payload"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid request"})
	}

	task, err := h.edgeService.CreateTask(req.Name, req.Type, req.DeviceID, req.Priority, req.Payload)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusCreated, Response{Success: true, Data: task})
}

func (h *Handler) UpdateTask(c echo.Context) error {
	id := c.Param("id")
	var req struct {
		Status string `json:"status"`
		Result string `json:"result"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid request"})
	}

	if err := h.edgeService.UpdateTaskStatus(id, req.Status, req.Result); err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true})
}

func (h *Handler) DeleteTask(c echo.Context) error {
	id := c.Param("id")
	if err := h.edgeService.DeleteTask(id); err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true})
}

func (h *Handler) GetSensorData(c echo.Context) error {
	deviceID := c.QueryParam("device_id")
	limitStr := c.QueryParam("limit")
	limit := 100

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	data, err := h.edgeService.GetSensorData(deviceID, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true, Data: data})
}

func (h *Handler) IngestSensorData(c echo.Context) error {
	var req struct {
		DeviceID string  `json:"device_id" validate:"required"`
		Metric   string  `json:"metric" validate:"required"`
		Value    float64 `json:"value" validate:"required"`
		Unit     string  `json:"unit"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid request"})
	}

	if err := h.edgeService.InsertSensorData(req.DeviceID, req.Metric, req.Value, req.Unit); err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true})
}

func (h *Handler) GetLogs(c echo.Context) error {
	deviceID := c.QueryParam("device_id")
	limitStr := c.QueryParam("limit")
	limit := 100

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	logs, err := h.edgeService.GetLogs(deviceID, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true, Data: logs})
}

func (h *Handler) GetOfflineCache(c echo.Context) error {
	deviceID := c.QueryParam("device_id")
	cache, err := h.edgeService.GetOfflineCache(deviceID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true, Data: cache})
}

func (h *Handler) SyncCache(c echo.Context) error {
	if err := h.edgeService.SyncOfflineCache(); err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true, Data: map[string]string{"message": "Cache synced successfully"}})
}

func (h *Handler) GetSystemStats(c echo.Context) error {
	stats, err := h.edgeService.GetSystemStats()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, Response{Success: false, Error: err.Error()})
	}
	return c.JSON(http.StatusOK, Response{Success: true, Data: stats})
}

func (h *Handler) HealthCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, Response{
		Success: true,
		Data: map[string]string{
			"status":  "healthy",
			"service": "edge-computing-platform",
		},
	})
}

func (h *Handler) GatewayIngest(c echo.Context) error {
	var req struct {
		DeviceID string      `json:"device_id" validate:"required"`
		DataType string      `json:"data_type" validate:"required"`
		Data     interface{} `json:"data" validate:"required"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, Response{Success: false, Error: "Invalid request"})
	}

	if strings.EqualFold(req.DataType, "sensor_data") {
		if dataMap, ok := req.Data.(map[string]interface{}); ok {
			metric, _ := dataMap["metric"].(string)
			value, _ := dataMap["value"].(float64)
			unit, _ := dataMap["unit"].(string)

			if metric != "" {
				if err := h.edgeService.InsertSensorData(req.DeviceID, metric, value, unit); err != nil {
					h.edgeService.AddOfflineCache(req.DeviceID, req.DataType, "")
				}
			}
		}
	} else if strings.EqualFold(req.DataType, "heartbeat") {
		if dataMap, ok := req.Data.(map[string]interface{}); ok {
			cpu, _ := dataMap["cpu"].(float64)
			mem, _ := dataMap["memory"].(float64)
			h.edgeService.UpdateDeviceStatus(req.DeviceID, cpu, mem)
		}
	}

	return c.JSON(http.StatusOK, Response{Success: true})
}
