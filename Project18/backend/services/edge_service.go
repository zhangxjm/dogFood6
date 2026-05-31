package services

import (
	"database/sql"
	"encoding/json"
	"log"
	"sync"
	"time"

	"edge-computing-platform/db"
	"edge-computing-platform/models"

	"github.com/google/uuid"
)

type EdgeService struct {
	redisService *RedisService
	mu           sync.RWMutex
}

func NewEdgeService(redisService *RedisService) *EdgeService {
	return &EdgeService{
		redisService: redisService,
	}
}

func (s *EdgeService) GetAllProductLines() ([]models.ProductLine, error) {
	rows, err := db.DB.Query(`
		SELECT pl.id, pl.name, pl.description, pl.status, pl.created_at,
			(SELECT COUNT(*) FROM devices d WHERE d.product_line = pl.id) as device_count
		FROM product_lines pl ORDER BY pl.created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lines []models.ProductLine
	for rows.Next() {
		var pl models.ProductLine
		err := rows.Scan(&pl.ID, &pl.Name, &pl.Description, &pl.Status, &pl.CreatedAt, &pl.DeviceCount)
		if err != nil {
			return nil, err
		}
		lines = append(lines, pl)
	}
	return lines, nil
}

func (s *EdgeService) CreateProductLine(name, description string) (*models.ProductLine, error) {
	id := uuid.New().String()
	_, err := db.DB.Exec(
		"INSERT INTO product_lines (id, name, description) VALUES (?, ?, ?)",
		id, name, description,
	)
	if err != nil {
		return nil, err
	}

	return &models.ProductLine{
		ID:          id,
		Name:        name,
		Description: description,
		Status:      "active",
		DeviceCount: 0,
		CreatedAt:   time.Now(),
	}, nil
}

func (s *EdgeService) UpdateProductLine(id, name, description, status string) error {
	_, err := db.DB.Exec(
		"UPDATE product_lines SET name = ?, description = ?, status = ? WHERE id = ?",
		name, description, status, id,
	)
	return err
}

func (s *EdgeService) DeleteProductLine(id string) error {
	_, err := db.DB.Exec("DELETE FROM product_lines WHERE id = ?", id)
	return err
}

func (s *EdgeService) GetAllDevices() ([]models.Device, error) {
	rows, err := db.DB.Query(`
		SELECT id, name, ip_address, status, cpu_usage, memory_usage, 
		       product_line, last_seen, created_at 
		FROM devices ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []models.Device
	for rows.Next() {
		var d models.Device
		var lastSeen sql.NullTime
		var productLine sql.NullString
		err := rows.Scan(&d.ID, &d.Name, &d.IPAddress, &d.Status, &d.CPUUsage,
			&d.MemoryUsage, &productLine, &lastSeen, &d.CreatedAt)
		if err != nil {
			return nil, err
		}
		if lastSeen.Valid {
			d.LastSeen = lastSeen.Time
		}
		if productLine.Valid {
			d.ProductLine = productLine.String
		}
		devices = append(devices, d)
	}
	return devices, nil
}

func (s *EdgeService) GetDevice(id string) (*models.Device, error) {
	var d models.Device
	var lastSeen sql.NullTime
	var productLine sql.NullString
	err := db.DB.QueryRow(`
		SELECT id, name, ip_address, status, cpu_usage, memory_usage,
		       product_line, last_seen, created_at
		FROM devices WHERE id = ?
	`, id).Scan(&d.ID, &d.Name, &d.IPAddress, &d.Status, &d.CPUUsage,
		&d.MemoryUsage, &productLine, &lastSeen, &d.CreatedAt)
	if err != nil {
		return nil, err
	}
	if lastSeen.Valid {
		d.LastSeen = lastSeen.Time
	}
	if productLine.Valid {
		d.ProductLine = productLine.String
	}
	return &d, nil
}

func (s *EdgeService) CreateDevice(name, ipAddress, productLine string) (*models.Device, error) {
	id := uuid.New().String()
	var plValue interface{}
	if productLine != "" {
		plValue = productLine
	} else {
		plValue = nil
	}
	_, err := db.DB.Exec(
		"INSERT INTO devices (id, name, ip_address, product_line) VALUES (?, ?, ?, ?)",
		id, name, ipAddress, plValue,
	)
	if err != nil {
		return nil, err
	}

	if productLine != "" {
		db.DB.Exec("UPDATE product_lines SET device_count = device_count + 1 WHERE id = ?", productLine)
	}

	return &models.Device{
		ID:          id,
		Name:        name,
		IPAddress:   ipAddress,
		ProductLine: productLine,
		Status:      "offline",
		CreatedAt:   time.Now(),
	}, nil
}

func (s *EdgeService) UpdateDevice(id, name, ipAddress, productLine, status string) error {
	var oldProductLine sql.NullString
	db.DB.QueryRow("SELECT product_line FROM devices WHERE id = ?", id).Scan(&oldProductLine)

	var plValue interface{}
	if productLine != "" {
		plValue = productLine
	} else {
		plValue = nil
	}

	_, err := db.DB.Exec(`
		UPDATE devices SET name = ?, ip_address = ?, product_line = ?, status = ? 
		WHERE id = ?
	`, name, ipAddress, plValue, status, id)

	if err == nil {
		oldStr := ""
		if oldProductLine.Valid {
			oldStr = oldProductLine.String
		}
		if oldStr != productLine {
			if oldStr != "" {
				db.DB.Exec("UPDATE product_lines SET device_count = device_count - 1 WHERE id = ?", oldStr)
			}
			if productLine != "" {
				db.DB.Exec("UPDATE product_lines SET device_count = device_count + 1 WHERE id = ?", productLine)
			}
		}
	}

	return err
}

func (s *EdgeService) DeleteDevice(id string) error {
	var productLine sql.NullString
	db.DB.QueryRow("SELECT product_line FROM devices WHERE id = ?", id).Scan(&productLine)

	_, err := db.DB.Exec("DELETE FROM devices WHERE id = ?", id)
	if err == nil && productLine.Valid {
		db.DB.Exec("UPDATE product_lines SET device_count = device_count - 1 WHERE id = ?", productLine.String)
	}
	return err
}

func (s *EdgeService) UpdateDeviceStatus(id string, cpuUsage, memoryUsage float64) error {
	_, err := db.DB.Exec(`
		UPDATE devices SET cpu_usage = ?, memory_usage = ?, status = 'online', last_seen = ? 
		WHERE id = ?
	`, cpuUsage, memoryUsage, time.Now(), id)
	return err
}

func (s *EdgeService) GetAllTasks() ([]models.EdgeTask, error) {
	rows, err := db.DB.Query(`
		SELECT id, name, type, device_id, status, priority, payload, result,
		       created_at, completed_at
		FROM edge_tasks ORDER BY created_at DESC LIMIT 200
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []models.EdgeTask
	for rows.Next() {
		var t models.EdgeTask
		var completedAt sql.NullTime
		var deviceID sql.NullString
		var result sql.NullString
		var payload sql.NullString
		var taskType sql.NullString
		err := rows.Scan(&t.ID, &t.Name, &taskType, &deviceID, &t.Status,
			&t.Priority, &payload, &result, &t.CreatedAt, &completedAt)
		if err != nil {
			return nil, err
		}
		if completedAt.Valid {
			t.CompletedAt = completedAt.Time
		}
		if deviceID.Valid {
			t.DeviceID = deviceID.String
		}
		if result.Valid {
			t.Result = result.String
		}
		if payload.Valid {
			t.Payload = payload.String
		}
		if taskType.Valid {
			t.Type = taskType.String
		}
		tasks = append(tasks, t)
	}
	return tasks, nil
}

func (s *EdgeService) CreateTask(name, taskType, deviceID string, priority int, payload string) (*models.EdgeTask, error) {
	id := uuid.New().String()
	var deviceIDValue interface{}
	if deviceID != "" {
		deviceIDValue = deviceID
	} else {
		deviceIDValue = nil
	}
	var taskTypeValue interface{}
	if taskType != "" {
		taskTypeValue = taskType
	} else {
		taskTypeValue = nil
	}
	var payloadValue interface{}
	if payload != "" {
		payloadValue = payload
	} else {
		payloadValue = nil
	}
	_, err := db.DB.Exec(`
		INSERT INTO edge_tasks (id, name, type, device_id, priority, payload)
		VALUES (?, ?, ?, ?, ?, ?)
	`, id, name, taskTypeValue, deviceIDValue, priority, payloadValue)
	if err != nil {
		return nil, err
	}

	task := map[string]interface{}{
		"id":        id,
		"name":      name,
		"type":      taskType,
		"device_id": deviceID,
		"priority":  priority,
		"payload":   payload,
	}
	s.redisService.PushTask("task_queue", task)

	return &models.EdgeTask{
		ID:        id,
		Name:      name,
		Type:      taskType,
		DeviceID:  deviceID,
		Status:    "pending",
		Priority:  priority,
		Payload:   payload,
		CreatedAt: time.Now(),
	}, nil
}

func (s *EdgeService) UpdateTaskStatus(id, status, result string) error {
	_, err := db.DB.Exec(`
		UPDATE edge_tasks SET status = ?, result = ?, completed_at = ? 
		WHERE id = ?
	`, status, result, time.Now(), id)
	return err
}

func (s *EdgeService) DeleteTask(id string) error {
	_, err := db.DB.Exec("DELETE FROM edge_tasks WHERE id = ?", id)
	return err
}

func (s *EdgeService) GetSensorData(deviceID string, limit int) ([]models.SensorData, error) {
	var rows *sql.Rows
	var err error

	if deviceID != "" {
		rows, err = db.DB.Query(`
			SELECT id, device_id, metric, value, unit, timestamp, processed
			FROM sensor_data WHERE device_id = ? ORDER BY timestamp DESC LIMIT ?
		`, deviceID, limit)
	} else {
		rows, err = db.DB.Query(`
			SELECT id, device_id, metric, value, unit, timestamp, processed
			FROM sensor_data ORDER BY timestamp DESC LIMIT ?
		`, limit)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var data []models.SensorData
	for rows.Next() {
		var sd models.SensorData
		err := rows.Scan(&sd.ID, &sd.DeviceID, &sd.Metric, &sd.Value,
			&sd.Unit, &sd.Timestamp, &sd.Processed)
		if err != nil {
			return nil, err
		}
		data = append(data, sd)
	}
	return data, nil
}

func (s *EdgeService) InsertSensorData(deviceID, metric string, value float64, unit string) error {
	id := uuid.New().String()
	_, err := db.DB.Exec(`
		INSERT INTO sensor_data (id, device_id, metric, value, unit)
		VALUES (?, ?, ?, ?, ?)
	`, id, deviceID, metric, value, unit)
	return err
}

func (s *EdgeService) GetLogs(deviceID string, limit int) ([]models.LogEntry, error) {
	var rows *sql.Rows
	var err error

	if deviceID != "" {
		rows, err = db.DB.Query(`
			SELECT id, device_id, level, message, timestamp
			FROM log_entries WHERE device_id = ? ORDER BY timestamp DESC LIMIT ?
		`, deviceID, limit)
	} else {
		rows, err = db.DB.Query(`
			SELECT id, device_id, level, message, timestamp
			FROM log_entries ORDER BY timestamp DESC LIMIT ?
		`, limit)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []models.LogEntry
	for rows.Next() {
		var l models.LogEntry
		err := rows.Scan(&l.ID, &l.DeviceID, &l.Level, &l.Message, &l.Timestamp)
		if err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}
	return logs, nil
}

func (s *EdgeService) InsertLog(deviceID, level, message string) error {
	id := uuid.New().String()
	_, err := db.DB.Exec(`
		INSERT INTO log_entries (id, device_id, level, message)
		VALUES (?, ?, ?, ?)
	`, id, deviceID, level, message)
	return err
}

func (s *EdgeService) GetOfflineCache(deviceID string) ([]models.OfflineCache, error) {
	var rows *sql.Rows
	var err error

	if deviceID != "" {
		rows, err = db.DB.Query(`
			SELECT id, device_id, data_type, data, status, created_at
			FROM offline_cache WHERE device_id = ? AND status = 'pending'
			ORDER BY created_at ASC
		`, deviceID)
	} else {
		rows, err = db.DB.Query(`
			SELECT id, device_id, data_type, data, status, created_at
			FROM offline_cache WHERE status = 'pending'
			ORDER BY created_at ASC LIMIT 100
		`)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cache []models.OfflineCache
	for rows.Next() {
		var c models.OfflineCache
		err := rows.Scan(&c.ID, &c.DeviceID, &c.DataType, &c.Data,
			&c.Status, &c.CreatedAt)
		if err != nil {
			return nil, err
		}
		cache = append(cache, c)
	}
	return cache, nil
}

func (s *EdgeService) AddOfflineCache(deviceID, dataType, data string) error {
	id := uuid.New().String()
	_, err := db.DB.Exec(`
		INSERT INTO offline_cache (id, device_id, data_type, data)
		VALUES (?, ?, ?, ?)
	`, id, deviceID, dataType, data)
	return err
}

func (s *EdgeService) SyncOfflineCache() error {
	rows, err := db.DB.Query(`
		SELECT id, device_id, data_type, data FROM offline_cache 
		WHERE status = 'pending' ORDER BY created_at ASC LIMIT 50
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var c models.OfflineCache
		err := rows.Scan(&c.ID, &c.DeviceID, &c.DataType, &c.Data)
		if err != nil {
			continue
		}

		var data map[string]interface{}
		if err := json.Unmarshal([]byte(c.Data), &data); err == nil {
			if c.DataType == "sensor_data" {
				if metric, ok := data["metric"].(string); ok {
					if value, ok := data["value"].(float64); ok {
						unit, _ := data["unit"].(string)
						s.InsertSensorData(c.DeviceID, metric, value, unit)
					}
				}
			}
		}

		db.DB.Exec("UPDATE offline_cache SET status = 'synced' WHERE id = ?", c.ID)
		log.Printf("Synced offline cache: %s", c.ID)
	}

	return nil
}

func (s *EdgeService) GetSystemStats() (*models.SystemStats, error) {
	var stats models.SystemStats

	db.DB.QueryRow("SELECT COUNT(*) FROM devices").Scan(&stats.TotalDevices)
	db.DB.QueryRow("SELECT COUNT(*) FROM devices WHERE status = 'online'").Scan(&stats.OnlineDevices)
	stats.OfflineDevices = stats.TotalDevices - stats.OnlineDevices

	db.DB.QueryRow("SELECT COUNT(*) FROM edge_tasks WHERE status = 'running'").Scan(&stats.ActiveTasks)
	db.DB.QueryRow("SELECT COUNT(*) FROM edge_tasks WHERE status = 'pending'").Scan(&stats.PendingTasks)
	db.DB.QueryRow("SELECT COUNT(*) FROM edge_tasks WHERE status = 'completed'").Scan(&stats.CompletedTasks)

	db.DB.QueryRow("SELECT COUNT(*) FROM offline_cache WHERE status = 'pending'").Scan(&stats.CacheCount)

	db.DB.QueryRow("SELECT COUNT(*) FROM sensor_data").Scan(&stats.DataProcessed)

	db.DB.QueryRow("SELECT AVG(cpu_usage) FROM devices WHERE status = 'online'").Scan(&stats.CPUUsageAvg)
	db.DB.QueryRow("SELECT AVG(memory_usage) FROM devices WHERE status = 'online'").Scan(&stats.MemoryUsageAvg)

	return &stats, nil
}

func (s *EdgeService) SeedData() error {
	var count int
	db.DB.QueryRow("SELECT COUNT(*) FROM product_lines").Scan(&count)
	if count > 0 {
		return nil
	}

	lines := []struct{ Name, Desc string }{
		{"汽车装配产线A", "汽车整车装配流水线A线"},
		{"汽车装配产线B", "汽车整车装配流水线B线"},
		{"电池生产线", "新能源汽车电池生产线"},
		{"涂装车间", "汽车涂装生产线"},
	}

	var lineIDs []string
	for _, l := range lines {
		pl, err := s.CreateProductLine(l.Name, l.Desc)
		if err != nil {
			return err
		}
		lineIDs = append(lineIDs, pl.ID)
	}

	devices := []struct{ Name, IP string }{
		{"PLC控制器-A01", "192.168.1.101"},
		{"PLC控制器-A02", "192.168.1.102"},
		{"机械臂-A01", "192.168.1.103"},
		{"传感器网关-A01", "192.168.1.104"},
		{"PLC控制器-B01", "192.168.1.201"},
		{"机械臂-B01", "192.168.1.202"},
		{"AGV小车-001", "192.168.1.301"},
		{"AGV小车-002", "192.168.1.302"},
		{"喷涂机器人-01", "192.168.1.401"},
		{"质检摄像头-01", "192.168.1.402"},
	}

	lineIndex := []int{0, 0, 0, 0, 1, 1, 2, 2, 3, 3}
	for i, d := range devices {
		s.CreateDevice(d.Name, d.IP, lineIDs[lineIndex[i]])
	}

	tasks := []struct{ Name, Type string }{
		{"数据采集任务", "data_collection"},
		{"设备诊断任务", "diagnostic"},
		{"异常检测任务", "anomaly_detection"},
		{"能耗分析任务", "energy_analysis"},
	}

	for _, t := range tasks {
		s.CreateTask(t.Name, t.Type, "", 5, "{}")
	}

	logs := []struct{ Level, Msg string }{
		{"info", "系统初始化完成"},
		{"info", "边缘网关连接成功"},
		{"warning", "设备AGV-001电量低于30%"},
		{"error", "传感器数据异常，已触发缓存"},
		{"info", "任务调度引擎启动"},
	}

	allDevices, _ := s.GetAllDevices()
	for i, l := range logs {
		if i < len(allDevices) {
			s.InsertLog(allDevices[i].ID, l.Level, l.Msg)
		}
	}

	return nil
}
