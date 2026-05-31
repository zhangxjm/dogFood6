package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"warehouse-system/internal/models"
	"warehouse-system/internal/services"
)

type InventoryHandler struct {
	service *services.InventoryService
}

func NewInventoryHandler() *InventoryHandler {
	return &InventoryHandler{
		service: services.NewInventoryService(),
	}
}

func (h *InventoryHandler) List(c *gin.Context) {
	page, pageSize := getPageParams(c)
	warehouseID, _ := strconv.Atoi(c.DefaultQuery("warehouse_id", "0"))
	
	inventories, total, err := h.service.GetInventoryList(uint(warehouseID), page, pageSize)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"list":  inventories,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func (h *InventoryHandler) Get(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	inventory, err := h.service.GetInventoryByID(uint(id))
	if err != nil {
		sendError(c, http.StatusNotFound, "Inventory not found")
		return
	}
	sendSuccess(c, inventory)
}

func (h *InventoryHandler) Create(c *gin.Context) {
	var inventory models.Inventory
	if err := c.ShouldBindJSON(&inventory); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.service.CreateInventory(&inventory); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, inventory)
}

func (h *InventoryHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	inventory, err := h.service.GetInventoryByID(uint(id))
	if err != nil {
		sendError(c, http.StatusNotFound, "Inventory not found")
		return
	}

	var updateData models.Inventory
	if err := c.ShouldBindJSON(&updateData); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	if updateData.WarehouseID > 0 {
		inventory.WarehouseID = updateData.WarehouseID
	}
	if updateData.ProductID > 0 {
		inventory.ProductID = updateData.ProductID
	}
	if updateData.RFIDTag != "" {
		inventory.RFIDTag = updateData.RFIDTag
	}
	if updateData.Quantity > 0 {
		inventory.Quantity = updateData.Quantity
	}
	if updateData.BatchNumber != "" {
		inventory.BatchNumber = updateData.BatchNumber
	}
	if updateData.ExpiryDate != nil {
		inventory.ExpiryDate = updateData.ExpiryDate
	}
	if updateData.Status != "" {
		inventory.Status = updateData.Status
	}

	if err := h.service.UpdateInventory(inventory); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, inventory)
}

func (h *InventoryHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.service.DeleteInventory(uint(id)); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, nil)
}

func (h *InventoryHandler) AutoStockTake(c *gin.Context) {
	warehouseID, _ := strconv.Atoi(c.Param("id"))
	stockTake, err := h.service.AutoStockTake(uint(warehouseID))
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, stockTake)
}

func (h *InventoryHandler) GetStockTakeList(c *gin.Context) {
	page, pageSize := getPageParams(c)
	warehouseID, _ := strconv.Atoi(c.DefaultQuery("warehouse_id", "0"))
	
	stockTakes, total, err := h.service.GetStockTakeList(uint(warehouseID), page, pageSize)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"list":  stockTakes,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func (h *InventoryHandler) Sync(c *gin.Context) {
	var req struct {
		SourceWarehouseID uint `json:"source_warehouse_id"`
		TargetWarehouseID uint `json:"target_warehouse_id"`
		ProductID         uint `json:"product_id"`
		Quantity          uint `json:"quantity"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.service.SyncInventory(req.SourceWarehouseID, req.TargetWarehouseID, req.ProductID, req.Quantity); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, nil)
}

func (h *InventoryHandler) GetSyncLogs(c *gin.Context) {
	page, pageSize := getPageParams(c)
	
	logs, total, err := h.service.GetSyncLogs(page, pageSize)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"list":  logs,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

type ProductHandler struct {
	service *services.ProductService
}

func NewProductHandler() *ProductHandler {
	return &ProductHandler{
		service: services.NewProductService(),
	}
}

func (h *ProductHandler) List(c *gin.Context) {
	page, pageSize := getPageParams(c)
	category := c.DefaultQuery("category", "")
	
	products, total, err := h.service.GetProductList(page, pageSize, category)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"list":  products,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func (h *ProductHandler) Get(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	product, err := h.service.GetProductByID(uint(id))
	if err != nil {
		sendError(c, http.StatusNotFound, "Product not found")
		return
	}
	sendSuccess(c, product)
}

func (h *ProductHandler) Create(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.service.CreateProduct(&product); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, product)
}

func (h *ProductHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	product, err := h.service.GetProductByID(uint(id))
	if err != nil {
		sendError(c, http.StatusNotFound, "Product not found")
		return
	}

	var updateData models.Product
	if err := c.ShouldBindJSON(&updateData); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	if updateData.SKU != "" {
		product.SKU = updateData.SKU
	}
	if updateData.Name != "" {
		product.Name = updateData.Name
	}
	if updateData.Category != "" {
		product.Category = updateData.Category
	}
	if updateData.Price > 0 {
		product.Price = updateData.Price
	}
	if updateData.BondedDuty > 0 {
		product.BondedDuty = updateData.BondedDuty
	}
	if updateData.Unit != "" {
		product.Unit = updateData.Unit
	}
	if updateData.ExpiryDays > 0 {
		product.ExpiryDays = updateData.ExpiryDays
	}

	if err := h.service.UpdateProduct(product); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, product)
}

func (h *ProductHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.service.DeleteProduct(uint(id)); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, nil)
}

func (h *ProductHandler) GetCategories(c *gin.Context) {
	categories, err := h.service.GetCategories()
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, categories)
}

func (h *ProductHandler) Search(c *gin.Context) {
	keyword := c.Query("keyword")
	products, err := h.service.SearchProducts(keyword)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, products)
}

type ExpiryHandler struct {
	service *services.ExpiryService
}

func NewExpiryHandler() *ExpiryHandler {
	return &ExpiryHandler{
		service: services.NewExpiryService(),
	}
}

func (h *ExpiryHandler) CheckAlerts(c *gin.Context) {
	if err := h.service.CheckAndGenerateAlerts(); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, nil)
}

func (h *ExpiryHandler) GetActiveAlerts(c *gin.Context) {
	page, pageSize := getPageParams(c)
	warehouseID, _ := strconv.Atoi(c.DefaultQuery("warehouse_id", "0"))
	level := c.DefaultQuery("level", "")
	
	alerts, total, err := h.service.GetActiveAlerts(uint(warehouseID), level, page, pageSize)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	sendSuccess(c, gin.H{
		"list":  alerts,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func (h *ExpiryHandler) ResolveAlert(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.service.ResolveAlert(uint(id)); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, nil)
}

func (h *ExpiryHandler) GetStats(c *gin.Context) {
	stats, err := h.service.GetAlertStats()
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	sendSuccess(c, stats)
}
