package api

import (
	"iiot-predictive-maintenance/internal/service"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type TimeSeriesHandler struct {
	deviceService *service.DeviceService
}

func NewTimeSeriesHandler() *TimeSeriesHandler {
	return &TimeSeriesHandler{
		deviceService: service.NewDeviceService(),
	}
}

func (h *TimeSeriesHandler) WebSocket(c *gin.Context) {
	deviceID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid device ID"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		data, err := h.deviceService.GetRealtimeData(uint(deviceID))
		if err != nil {
			continue
		}

		if err := conn.WriteJSON(data); err != nil {
			break
		}
	}
}
