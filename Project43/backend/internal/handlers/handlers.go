package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"math"
	"net/http"
	"strconv"
	"time"

	gorillaWs "github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"

	"bci-rehab/internal/models"
	ws "bci-rehab/internal/websocket"
	"bci-rehab/pkg/database"
	"bci-rehab/pkg/security"
)

var upgrader = gorillaWs.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

func Login(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "请求参数错误"})
	}

	req.Username = security.SanitizeInput(req.Username)
	req.Password = security.SanitizeInput(req.Password)

	var user models.User
	err := database.DB.QueryRow(`
		SELECT id, username, password_hash, name, role, age, gender, diagnosis, created_at, updated_at
		FROM users WHERE username = ?
	`, req.Username).Scan(
		&user.ID, &user.Username, &user.PasswordHash, &user.Name, &user.Role,
		&user.Age, &user.Gender, &user.Diagnosis, &user.CreatedAt, &user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "用户名或密码错误"})
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "服务器错误"})
	}

	if !security.CheckPasswordHash(req.Password, user.PasswordHash) {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "用户名或密码错误"})
	}

	token, err := security.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "生成令牌失败"})
	}

	return c.JSON(http.StatusOK, LoginResponse{
		Token: token,
		User:  user,
	})
}

func GetCurrentUser(c echo.Context) error {
	userID := c.Get("userID").(int64)

	var user models.User
	err := database.DB.QueryRow(`
		SELECT id, username, name, role, age, gender, diagnosis, created_at, updated_at
		FROM users WHERE id = ?
	`, userID).Scan(
		&user.ID, &user.Username, &user.Name, &user.Role,
		&user.Age, &user.Gender, &user.Diagnosis, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "获取用户信息失败"})
	}

	return c.JSON(http.StatusOK, user)
}

func GetPatients(c echo.Context) error {
	rows, err := database.DB.Query(`
		SELECT id, username, name, role, age, gender, diagnosis, created_at
		FROM users WHERE role = 'patient' ORDER BY name
	`)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "获取患者列表失败"})
	}
	defer rows.Close()

	var patients []models.User
	for rows.Next() {
		var u models.User
		err := rows.Scan(&u.ID, &u.Username, &u.Name, &u.Role, &u.Age, &u.Gender, &u.Diagnosis, &u.CreatedAt)
		if err != nil {
			continue
		}
		patients = append(patients, u)
	}

	return c.JSON(http.StatusOK, patients)
}

func GetCommands(c echo.Context) error {
	category := c.QueryParam("category")
	difficulty := c.QueryParam("difficulty")

	query := "SELECT id, code, name, description, category, difficulty FROM training_commands WHERE 1=1"
	var args []interface{}

	if category != "" {
		query += " AND category = ?"
		args = append(args, category)
	}
	if difficulty != "" {
		query += " AND difficulty = ?"
		args = append(args, difficulty)
	}
	query += " ORDER BY difficulty, name"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "获取指令列表失败"})
	}
	defer rows.Close()

	var commands []models.TrainingCommand
	for rows.Next() {
		var cmd models.TrainingCommand
		err := rows.Scan(&cmd.ID, &cmd.Code, &cmd.Name, &cmd.Description, &cmd.Category, &cmd.Difficulty)
		if err != nil {
			continue
		}
		commands = append(commands, cmd)
	}

	return c.JSON(http.StatusOK, commands)
}

func CreateSession(c echo.Context) error {
	userID := c.Get("userID").(int64)
	role := c.Get("role").(string)

	var req struct {
		UserID  int64  `json:"user_id"`
		Type    string `json:"type"`
		Command string `json:"command"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	targetUserID := userID
	if role != "patient" && req.UserID > 0 {
		targetUserID = req.UserID
	}

	var userName string
	err := database.DB.QueryRow("SELECT name FROM users WHERE id = ?", targetUserID).Scan(&userName)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "用户不存在"})
	}

	startTime := time.Now()
	res, err := database.DB.Exec(`
		INSERT INTO training_sessions
		(user_id, user_name, type, command, start_time, status)
		VALUES (?, ?, ?, ?, ?, 'active')
	`, targetUserID, userName, req.Type, req.Command, startTime)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "创建训练会话失败"})
	}

	sessionID, _ := res.LastInsertId()

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"id":         sessionID,
		"user_id":    targetUserID,
		"user_name":  userName,
		"type":       req.Type,
		"command":    req.Command,
		"start_time": startTime,
		"status":     "active",
	})
}

func EndSession(c echo.Context) error {
	sessionID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var session models.TrainingSession
	err := database.DB.QueryRow(`
		SELECT id, user_id, start_time, status, command FROM training_sessions WHERE id = ?
	`, sessionID).Scan(&session.ID, &session.UserID, &session.StartTime, &session.Status, &session.Command)

	if err == sql.ErrNoRows {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "会话不存在"})
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "查询失败"})
	}

	if session.Status != "active" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "会话已结束"})
	}

	endTime := time.Now()
	duration := int(endTime.Sub(session.StartTime).Seconds())

	var avgAccuracy, avgQuality float64
	var totalSamples int
	rows, err := database.DB.Query(`
		SELECT AVG(signal_quality), COUNT(*) 
		FROM eeg_signals WHERE session_id = ?
	`, sessionID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			rows.Scan(&avgQuality, &totalSamples)
		}
	}

	if totalSamples > 0 {
		avgAccuracy = avgQuality * 0.85
	}

	successRate := 0.0
	if avgAccuracy > 0 {
		successRate = math.Round(avgAccuracy)
	}

	var notes string
	if avgAccuracy >= 80 {
		notes = "表现优秀，训练效果良好"
	} else if avgAccuracy >= 65 {
		notes = "表现良好，继续保持"
	} else if avgAccuracy >= 50 {
		notes = "有进步，需要更多练习"
	} else {
		notes = "需要加强训练"
	}

	notesJSON, _ := json.Marshal(map[string]interface{}{
		"total_samples": totalSamples,
		"avg_quality":   math.Round(avgQuality*10) / 10,
		"feedback":      notes,
	})

	_, err = database.DB.Exec(`
		UPDATE training_sessions
		SET end_time = ?, duration = ?, success_rate = ?, avg_accuracy = ?, status = 'completed', notes = ?
		WHERE id = ?
	`, endTime, duration, successRate, avgAccuracy, string(notesJSON), sessionID)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "结束会话失败"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"id":            sessionID,
		"duration":      duration,
		"success_rate":  successRate,
		"avg_accuracy":  math.Round(avgAccuracy*10) / 10,
		"total_samples": totalSamples,
		"status":        "completed",
	})
}

func GetSessions(c echo.Context) error {
	userID := c.Get("userID").(int64)
	role := c.Get("role").(string)

	queryUserID, _ := strconv.ParseInt(c.QueryParam("user_id"), 10, 64)
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit == 0 {
		limit = 50
	}

	targetUserID := userID
	if role != "patient" && queryUserID > 0 {
		targetUserID = queryUserID
	}

	rows, err := database.DB.Query(`
		SELECT id, user_id, user_name, type, command, start_time, end_time, 
		       duration, success_rate, avg_accuracy, status, created_at
		FROM training_sessions 
		WHERE user_id = ? 
		ORDER BY start_time DESC 
		LIMIT ?
	`, targetUserID, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "获取训练记录失败"})
	}
	defer rows.Close()

	var sessions []models.TrainingSession
	for rows.Next() {
		var s models.TrainingSession
		var endTime sql.NullTime
		err := rows.Scan(
			&s.ID, &s.UserID, &s.UserName, &s.Type, &s.Command,
			&s.StartTime, &endTime, &s.Duration, &s.SuccessRate, &s.AvgAccuracy,
			&s.Status, &s.CreatedAt,
		)
		if err == nil {
			if endTime.Valid {
				s.EndTime = endTime.Time
			}
			sessions = append(sessions, s)
		}
	}

	return c.JSON(http.StatusOK, sessions)
}

func GetProgress(c echo.Context) error {
	userID := c.Get("userID").(int64)
	role := c.Get("role").(string)

	queryUserID, _ := strconv.ParseInt(c.QueryParam("user_id"), 10, 64)

	targetUserID := userID
	if role != "patient" && queryUserID > 0 {
		targetUserID = queryUserID
	}

	var totalSessions, totalDuration, weeklySessions int
	var avgSuccessRate, avgAccuracy float64

	rows, err := database.DB.Query(`
		SELECT COUNT(*), COALESCE(SUM(duration), 0), 
		       COALESCE(AVG(success_rate), 0), COALESCE(AVG(avg_accuracy), 0)
		FROM training_sessions 
		WHERE user_id = ? AND status = 'completed'
	`, targetUserID)
	if err == nil && rows.Next() {
		rows.Scan(&totalSessions, &totalDuration, &avgSuccessRate, &avgAccuracy)
	}
	rows.Close()

	weekAgo := time.Now().AddDate(0, 0, -7)
	rows, err = database.DB.Query(`
		SELECT COUNT(*) FROM training_sessions 
		WHERE user_id = ? AND status = 'completed' AND start_time >= ?
	`, targetUserID, weekAgo)
	if err == nil && rows.Next() {
		rows.Scan(&weeklySessions)
	}
	rows.Close()

	var earliestDate time.Time
	rows, err = database.DB.Query(`
		SELECT MIN(DATE(start_time)) FROM training_sessions 
		WHERE user_id = ? AND status = 'completed'
	`, targetUserID)
	if err == nil && rows.Next() {
		var dateStr string
		rows.Scan(&dateStr)
		if dateStr != "" {
			earliestDate, _ = time.Parse("2006-01-02", dateStr)
		}
	}
	rows.Close()

	streakDays := 0
	if !earliestDate.IsZero() {
		currentDate := time.Now()
		for {
			var count int
			dateStr := currentDate.Format("2006-01-02")
			database.DB.QueryRow(`
				SELECT COUNT(*) FROM training_sessions 
				WHERE user_id = ? AND status = 'completed' AND DATE(start_time) = ?
			`, targetUserID, dateStr).Scan(&count)

			if count > 0 {
				streakDays++
			} else if currentDate.Before(time.Now()) {
				break
			}

			currentDate = currentDate.AddDate(0, 0, -1)
			if currentDate.Before(earliestDate) {
				break
			}
		}
	}

	improvementRate := 0.0
	if totalSessions >= 3 {
		rows, err = database.DB.Query(`
			SELECT avg_accuracy FROM training_sessions 
			WHERE user_id = ? AND status = 'completed' 
			ORDER BY start_time ASC LIMIT 3
		`, targetUserID)
		if err == nil {
			var firstAvg float64
			count := 0
			for rows.Next() {
				var v float64
				rows.Scan(&v)
				firstAvg += v
				count++
			}
			rows.Close()
			if count > 0 {
				firstAvg /= float64(count)
				if firstAvg > 0 {
					improvementRate = ((avgAccuracy - firstAvg) / firstAvg) * 100
				}
			}
		}
	}

	summary := models.ProgressSummary{
		UserID:          targetUserID,
		TotalSessions:   totalSessions,
		TotalDuration:   totalDuration,
		AvgSuccessRate:  math.Round(avgSuccessRate * 10) / 10,
		AvgAccuracy:     math.Round(avgAccuracy * 10) / 10,
		WeeklySessions:  weeklySessions,
		StreakDays:      streakDays,
		ImprovementRate: math.Round(improvementRate * 10) / 10,
	}

	return c.JSON(http.StatusOK, summary)
}

func GetAnalytics(c echo.Context) error {
	userID := c.Get("userID").(int64)
	role := c.Get("role").(string)

	queryUserID, _ := strconv.ParseInt(c.QueryParam("user_id"), 10, 64)
	days, _ := strconv.Atoi(c.QueryParam("days"))
	if days == 0 {
		days = 30
	}

	targetUserID := userID
	if role != "patient" && queryUserID > 0 {
		targetUserID = queryUserID
	}

	type DailyData struct {
		Date         string  `json:"date"`
		Sessions     int     `json:"sessions"`
		Duration     int     `json:"duration"`
		AvgAccuracy  float64 `json:"avg_accuracy"`
		SuccessRate  float64 `json:"success_rate"`
	}

	dailyData := make([]DailyData, days)
	now := time.Now()

	for i := 0; i < days; i++ {
		date := now.AddDate(0, 0, -days+i+1)
		dateStr := date.Format("2006-01-02")

		var sessions, duration int
		var avgAccuracy, successRate float64

		row := database.DB.QueryRow(`
			SELECT COUNT(*), COALESCE(SUM(duration), 0), 
			       COALESCE(AVG(avg_accuracy), 0), COALESCE(AVG(success_rate), 0)
			FROM training_sessions
			WHERE user_id = ? AND status = 'completed' AND DATE(start_time) = ?
		`, targetUserID, dateStr)
		row.Scan(&sessions, &duration, &avgAccuracy, &successRate)

		dailyData[i] = DailyData{
			Date:         dateStr,
			Sessions:     sessions,
			Duration:     duration,
			AvgAccuracy:  math.Round(avgAccuracy*10) / 10,
			SuccessRate:  math.Round(successRate*10) / 10,
		}
	}

	type CommandStats struct {
		Command      string  `json:"command"`
		CommandName  string  `json:"command_name"`
		Count        int     `json:"count"`
		AvgAccuracy  float64 `json:"avg_accuracy"`
		TotalTime    int     `json:"total_time"`
	}

	cmdRows, err := database.DB.Query(`
		SELECT ts.command, tc.name, 
		       COUNT(*), COALESCE(AVG(ts.avg_accuracy), 0), COALESCE(SUM(ts.duration), 0)
		FROM training_sessions ts
		LEFT JOIN training_commands tc ON ts.command = tc.code
		WHERE ts.user_id = ? AND ts.status = 'completed'
		GROUP BY ts.command, tc.name
		ORDER BY COUNT(*) DESC
	`, targetUserID)

	commandStats := []CommandStats{}
	if err == nil {
		defer cmdRows.Close()
		for cmdRows.Next() {
			var cs CommandStats
			cmdRows.Scan(&cs.Command, &cs.CommandName, &cs.Count, &cs.AvgAccuracy, &cs.TotalTime)
			cs.AvgAccuracy = math.Round(cs.AvgAccuracy * 10) / 10
			commandStats = append(commandStats, cs)
		}
	}

	type CategoryStats struct {
		Category    string  `json:"category"`
		CategoryName string `json:"category_name"`
		Count       int     `json:"count"`
		AvgAccuracy float64 `json:"avg_accuracy"`
	}

	catRows, err := database.DB.Query(`
		SELECT tc.category, 
		       COUNT(*), COALESCE(AVG(ts.avg_accuracy), 0)
		FROM training_sessions ts
		LEFT JOIN training_commands tc ON ts.command = tc.code
		WHERE ts.user_id = ? AND ts.status = 'completed'
		GROUP BY tc.category
	`, targetUserID)

	categoryStats := []CategoryStats{}
	if err == nil {
		defer catRows.Close()
		for catRows.Next() {
			var cs CategoryStats
			catRows.Scan(&cs.Category, &cs.Count, &cs.AvgAccuracy)
			cs.AvgAccuracy = math.Round(cs.AvgAccuracy * 10) / 10

			switch cs.Category {
			case "上肢运动":
				cs.CategoryName = "上肢运动"
			case "下肢运动":
				cs.CategoryName = "下肢运动"
			case "面部运动":
				cs.CategoryName = "面部运动"
			case "基础训练":
				cs.CategoryName = "基础训练"
			case "认知训练":
				cs.CategoryName = "认知训练"
			default:
				cs.CategoryName = cs.Category
			}

			if cs.Category != "" {
				categoryStats = append(categoryStats, cs)
			}
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"daily_data":     dailyData,
		"command_stats":  commandStats,
		"category_stats": categoryStats,
	})
}

func GetEEGData(c echo.Context) error {
	sessionID, _ := strconv.ParseInt(c.Param("sessionId"), 10, 64)
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit == 0 {
		limit = 500
	}

	rows, err := database.DB.Query(`
		SELECT id, session_id, user_id, timestamp, 
		       channel_1, channel_2, channel_3, channel_4,
		       channel_5, channel_6, channel_7, channel_8,
		       signal_quality, command, processed
		FROM eeg_signals 
		WHERE session_id = ? 
		ORDER BY timestamp ASC 
		LIMIT ?
	`, sessionID, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "获取脑电数据失败"})
	}
	defer rows.Close()

	var signals []models.EEGSignal
	for rows.Next() {
		var s models.EEGSignal
		var processedInt int
		err := rows.Scan(
			&s.ID, &s.SessionID, &s.UserID, &s.Timestamp,
			&s.Channel1, &s.Channel2, &s.Channel3, &s.Channel4,
			&s.Channel5, &s.Channel6, &s.Channel7, &s.Channel8,
			&s.SignalQuality, &s.Command, &processedInt,
		)
		if err == nil {
			s.Processed = processedInt == 1
			signals = append(signals, s)
		}
	}

	return c.JSON(http.StatusOK, signals)
}

func init() {
	ws.SetOnMessageCallback(func(client *ws.Client, msgType string, data map[string]interface{}) {
		if msgType == "eeg_raw" {
			processRawEEG(client, data)
		}
	})
}

func WebSocketHandler(c echo.Context) error {
	token := c.QueryParam("token")
	sessionIDStr := c.QueryParam("session_id")
	command := c.QueryParam("command")

	userID, _, err := ws.ValidateConnection(token)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "认证失败"})
	}

	sessionID, _ := strconv.ParseInt(sessionIDStr, 10, 64)
	if sessionID == 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "缺少会话ID"})
	}

	var sessionStatus string
	database.DB.QueryRow("SELECT status FROM training_sessions WHERE id = ?", sessionID).Scan(&sessionStatus)
	if sessionStatus != "active" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "会话未激活或已结束"})
	}

	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return err
	}

	client := &ws.Client{
		ID:        time.Now().Unix(),
		Conn:      conn,
		Send:      make(chan []byte, 256),
		SessionID: sessionID,
		UserID:    userID,
		Command:   command,
		IsActive:  true,
	}

	ws.WsManager.Register <- client

	go client.WritePump()
	go client.ReadPump(ws.WsManager)
	go ws.WsManager.SimulateEEG(client)

	return nil
}

func processRawEEG(client *ws.Client, data map[string]interface{}) {
	var channels [8]float64
	for i := 0; i < 8; i++ {
		key := "ch" + strconv.Itoa(i+1)
		if val, ok := data[key].(float64); ok {
			channels[i] = val
		}
	}

	timestamp := time.Now()
	if ts, ok := data["timestamp"].(string); ok {
		if t, err := time.Parse(time.RFC3339, ts); err == nil {
			timestamp = t
		}
	}

	signalQuality := 0.0
	if sq, ok := data["signal_quality"].(float64); ok {
		signalQuality = sq
	}

	processed := 0
	if p, ok := data["processed"].(bool); ok && p {
		processed = 1
	}

	_, err := database.DB.Exec(`
		INSERT INTO eeg_signals 
		(session_id, user_id, timestamp, channel_1, channel_2, channel_3, channel_4,
		 channel_5, channel_6, channel_7, channel_8, signal_quality, command, processed)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, client.SessionID, client.UserID, timestamp,
		channels[0], channels[1], channels[2], channels[3],
		channels[4], channels[5], channels[6], channels[7],
		signalQuality, client.Command, processed)

	if err != nil {
		log.Printf("Error storing EEG: %v", err)
	}
}

func GetDashboardStats(c echo.Context) error {
	role := c.Get("role").(string)

	var totalPatients, totalSessions, activeSessions, totalUsers int

	database.DB.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'patient'").Scan(&totalPatients)
	database.DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&totalUsers)
	database.DB.QueryRow("SELECT COUNT(*) FROM training_sessions WHERE status = 'completed'").Scan(&totalSessions)
	database.DB.QueryRow("SELECT COUNT(*) FROM training_sessions WHERE status = 'active'").Scan(&activeSessions)

	var avgAccuracy, avgSuccessRate float64
	database.DB.QueryRow(`
		SELECT COALESCE(AVG(avg_accuracy), 0), COALESCE(AVG(success_rate), 0)
		FROM training_sessions WHERE status = 'completed'
	`).Scan(&avgAccuracy, &avgSuccessRate)

	var recentSessions []map[string]interface{}
	rows, err := database.DB.Query(`
		SELECT id, user_name, type, command, start_time, duration, avg_accuracy, status
		FROM training_sessions ORDER BY start_time DESC LIMIT 10
	`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var s models.TrainingSession
			var duration sql.NullInt64
			var avgAccuracy sql.NullFloat64
			err := rows.Scan(&s.ID, &s.UserName, &s.Type, &s.Command, &s.StartTime, &duration, &avgAccuracy, &s.Status)
			if err == nil {
				sess := map[string]interface{}{
					"id":          s.ID,
					"user_name":   s.UserName,
					"type":        s.Type,
					"command":     s.Command,
					"start_time":  s.StartTime,
					"status":      s.Status,
					"duration":    duration.Int64,
					"avg_accuracy": 0,
				}
				if avgAccuracy.Valid {
					sess["avg_accuracy"] = math.Round(avgAccuracy.Float64*10) / 10
				}
				recentSessions = append(recentSessions, sess)
			}
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"total_patients":    totalPatients,
		"total_users":       totalUsers,
		"total_sessions":    totalSessions,
		"active_sessions":   activeSessions,
		"avg_accuracy":      math.Round(avgAccuracy * 10) / 10,
		"avg_success_rate":  math.Round(avgSuccessRate * 10) / 10,
		"recent_sessions":   recentSessions,
		"role":              role,
	})
}

func CreateTrainingPlan(c echo.Context) error {
	userID := c.Get("userID").(int64)
	role := c.Get("role").(string)

	var req struct {
		UserID           int64     `json:"user_id"`
		Name             string    `json:"name"`
		Description      string    `json:"description"`
		Commands         []string  `json:"commands"`
		Frequency        int       `json:"frequency"`
		DurationPerSession int    `json:"duration_per_session"`
		StartDate        time.Time `json:"start_date"`
		EndDate          time.Time `json:"end_date"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	targetUserID := req.UserID
	if role == "patient" {
		targetUserID = userID
	}

	if targetUserID == 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "缺少用户ID"})
	}

	commandsJSON, _ := json.Marshal(req.Commands)

	res, err := database.DB.Exec(`
		INSERT INTO training_plans
		(user_id, name, description, commands, frequency, duration_per_session, start_date, end_date, status)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
	`, targetUserID, req.Name, req.Description, string(commandsJSON),
		req.Frequency, req.DurationPerSession, req.StartDate, req.EndDate)

	if err != nil {
		log.Printf("Create plan error: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "创建训练计划失败"})
	}

	planID, _ := res.LastInsertId()

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"id": planID,
	})
}

func GetTrainingPlans(c echo.Context) error {
	userID := c.Get("userID").(int64)
	role := c.Get("role").(string)

	queryUserID, _ := strconv.ParseInt(c.QueryParam("user_id"), 10, 64)

	targetUserID := userID
	if role != "patient" && queryUserID > 0 {
		targetUserID = queryUserID
	}

	rows, err := database.DB.Query(`
		SELECT id, user_id, name, description, commands, frequency, 
		       duration_per_session, start_date, end_date, status, created_at
		FROM training_plans 
		WHERE user_id = ? 
		ORDER BY created_at DESC
	`, targetUserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "获取训练计划失败"})
	}
	defer rows.Close()

	var plans []models.TrainingPlan
	for rows.Next() {
		var p models.TrainingPlan
		var commandsStr string
		err := rows.Scan(
			&p.ID, &p.UserID, &p.Name, &p.Description, &commandsStr,
			&p.Frequency, &p.DurationPerSession, &p.StartDate, &p.EndDate,
			&p.Status, &p.CreatedAt,
		)
		if err == nil {
			json.Unmarshal([]byte(commandsStr), &p.Commands)
			plans = append(plans, p)
		}
	}

	return c.JSON(http.StatusOK, plans)
}

func ChangePassword(c echo.Context) error {
	userID := c.Get("userID").(int64)

	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	if len(req.NewPassword) < 6 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "新密码长度不能少于6位"})
	}

	var currentHash string
	err := database.DB.QueryRow("SELECT password_hash FROM users WHERE id = ?", userID).Scan(&currentHash)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "用户不存在"})
	}

	if !security.CheckPasswordHash(req.OldPassword, currentHash) {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "原密码错误"})
	}

	newHash, err := security.HashPassword(req.NewPassword)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "密码加密失败"})
	}

	_, err = database.DB.Exec("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
		newHash, time.Now(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "密码修改失败"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "密码修改成功"})
}

func UpdateUserProfile(c echo.Context) error {
	userID := c.Get("userID").(int64)

	var req struct {
		Name      string `json:"name"`
		Age       int    `json:"age"`
		Gender    string `json:"gender"`
		Diagnosis string `json:"diagnosis"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	req.Name = security.SanitizeInput(req.Name)
	req.Diagnosis = security.SanitizeInput(req.Diagnosis)
	req.Gender = security.SanitizeInput(req.Gender)

	_, err := database.DB.Exec(`
		UPDATE users SET name = ?, age = ?, gender = ?, diagnosis = ?, updated_at = ?
		WHERE id = ?
	`, req.Name, req.Age, req.Gender, req.Diagnosis, time.Now(), userID)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "更新资料失败"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "资料更新成功"})
}
