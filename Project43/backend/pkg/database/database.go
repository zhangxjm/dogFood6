package database

import (
	"database/sql"
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"time"

	_ "modernc.org/sqlite"
	"bci-rehab/pkg/security"
)

var DB *sql.DB

func Init(dbPath string) error {
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	var err error
	DB, err = sql.Open("sqlite", dbPath+"?_foreign_keys=on&_journal_mode=WAL")
	if err != nil {
		return err
	}

	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)
	DB.SetConnMaxLifetime(5 * time.Minute)

	if err = createTables(); err != nil {
		return err
	}

	if err = seedData(); err != nil {
		log.Printf("Warning: failed to seed data: %v", err)
	}

	log.Println("Database initialized successfully")
	return nil
}

func createTables() error {
	schemas := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			name TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'patient',
			age INTEGER,
			gender TEXT,
			diagnosis TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS training_commands (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			code TEXT UNIQUE NOT NULL,
			name TEXT NOT NULL,
			description TEXT,
			category TEXT,
			difficulty INTEGER DEFAULT 1
		)`,
		`CREATE TABLE IF NOT EXISTS training_sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			user_name TEXT NOT NULL,
			type TEXT NOT NULL,
			command TEXT,
			start_time DATETIME NOT NULL,
			end_time DATETIME,
			duration INTEGER DEFAULT 0,
			success_rate REAL DEFAULT 0,
			avg_accuracy REAL DEFAULT 0,
			status TEXT DEFAULT 'active',
			notes TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS eeg_signals (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			session_id INTEGER NOT NULL,
			user_id INTEGER NOT NULL,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			channel_1 REAL,
			channel_2 REAL,
			channel_3 REAL,
			channel_4 REAL,
			channel_5 REAL,
			channel_6 REAL,
			channel_7 REAL,
			channel_8 REAL,
			signal_quality REAL DEFAULT 0,
			command TEXT,
			processed INTEGER DEFAULT 0,
			FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS training_plans (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			description TEXT,
			commands TEXT,
			frequency INTEGER DEFAULT 5,
			duration_per_session INTEGER DEFAULT 15,
			start_date DATETIME,
			end_date DATETIME,
			status TEXT DEFAULT 'active',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)`,
		`CREATE INDEX IF NOT EXISTS idx_eeg_session ON eeg_signals(session_id)`,
		`CREATE INDEX IF NOT EXISTS idx_eeg_user ON eeg_signals(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_eeg_timestamp ON eeg_signals(timestamp)`,
		`CREATE INDEX IF NOT EXISTS idx_session_user ON training_sessions(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_session_time ON training_sessions(start_time)`,
	}

	for _, schema := range schemas {
		if _, err := DB.Exec(schema); err != nil {
			return err
		}
	}
	return nil
}

func seedData() error {
	var count int
	DB.QueryRow("SELECT COUNT(*) FROM training_commands").Scan(&count)
	if count > 0 {
		return nil
	}

	commands := []struct {
		Code        string
		Name        string
		Description string
		Category    string
		Difficulty  int
	}{
		{"LEFT_HAND", "左手运动", "想象左手握拳或张开运动", "上肢运动", 1},
		{"RIGHT_HAND", "右手运动", "想象右手握拳或张开运动", "上肢运动", 1},
		{"LEFT_FOOT", "左脚运动", "想象左脚脚踝转动运动", "下肢运动", 2},
		{"RIGHT_FOOT", "右脚运动", "想象右脚脚踝转动运动", "下肢运动", 2},
		{"TONGUE", "舌头运动", "想象舌头活动运动", "面部运动", 2},
		{"ARMS_UP", "双臂上举", "想象双臂同时向上举起", "上肢运动", 3},
		{"WALK", "行走想象", "想象向前行走的动作", "下肢运动", 3},
		{"RELAX", "放松状态", "保持放松平静的状态", "基础训练", 1},
		{"FOCUS", "注意力集中", "集中注意力在特定物体上", "认知训练", 2},
		{"BOTH_HANDS", "双手协同", "想象双手同时进行相同动作", "上肢运动", 3},
	}

	for _, cmd := range commands {
		_, err := DB.Exec(`INSERT INTO training_commands 
			(code, name, description, category, difficulty) 
			VALUES (?, ?, ?, ?, ?)`,
			cmd.Code, cmd.Name, cmd.Description, cmd.Category, cmd.Difficulty)
		if err != nil {
			return err
		}
	}

	DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if count == 0 {
		passwordHash, err := security.HashPassword("password123")
		if err != nil {
			log.Printf("Failed to hash password: %v", err)
			return err
		}
		users := []struct {
			Username string
			Name     string
			Role     string
			Age      int
			Gender   string
		}{
			{"admin", "系统管理员", "admin", 35, "男"},
			{"doctor", "张医生", "doctor", 45, "女"},
			{"patient1", "王小明", "patient", 28, "男"},
			{"patient2", "李华", "patient", 34, "女"},
			{"patient3", "张伟", "patient", 52, "男"},
		}

		for _, u := range users {
			diagnosis := ""
			if u.Role == "patient" {
				diagnosis = "脑卒中后运动功能障碍"
			}
			_, err := DB.Exec(`INSERT INTO users 
				(username, password_hash, name, role, age, gender, diagnosis) 
				VALUES (?, ?, ?, ?, ?, ?, ?)`,
				u.Username, passwordHash, u.Name, u.Role, u.Age, u.Gender, diagnosis)
			if err != nil {
				return err
			}
		}

		seedHistoricalData()
	}

	return nil
}

func seedHistoricalData() {
	type SessionSeed struct {
		UserID      int64
		UserName    string
		Type        string
		Command     string
		Duration    int
		SuccessRate float64
		AvgAccuracy float64
		Status      string
		DaysAgo     int
	}

	sessions := []SessionSeed{
		{3, "王小明", "上肢训练", "LEFT_HAND", 900, 72.5, 68.3, "completed", 14},
		{3, "王小明", "上肢训练", "RIGHT_HAND", 900, 68.2, 65.1, "completed", 13},
		{3, "王小明", "上肢训练", "LEFT_HAND", 1200, 75.8, 71.2, "completed", 12},
		{3, "王小明", "基础训练", "RELAX", 600, 85.0, 82.0, "completed", 11},
		{3, "王小明", "上肢训练", "RIGHT_HAND", 1200, 71.5, 68.9, "completed", 10},
		{3, "王小明", "上肢训练", "BOTH_HANDS", 900, 62.3, 58.7, "completed", 9},
		{3, "王小明", "认知训练", "FOCUS", 900, 78.5, 75.0, "completed", 8},
		{3, "王小明", "上肢训练", "LEFT_HAND", 1200, 78.2, 74.5, "completed", 7},
		{3, "王小明", "下肢训练", "LEFT_FOOT", 900, 65.0, 62.1, "completed", 6},
		{3, "王小明", "上肢训练", "RIGHT_HAND", 1200, 74.8, 71.3, "completed", 5},
		{3, "王小明", "上肢训练", "LEFT_HAND", 1500, 80.5, 77.2, "completed", 4},
		{3, "王小明", "下肢训练", "RIGHT_FOOT", 900, 67.3, 64.5, "completed", 3},
		{3, "王小明", "上肢训练", "ARMS_UP", 900, 70.2, 66.8, "completed", 2},
		{3, "王小明", "基础训练", "RELAX", 900, 88.5, 85.3, "completed", 1},

		{4, "李华", "上肢训练", "LEFT_HAND", 900, 65.5, 62.0, "completed", 10},
		{4, "李华", "上肢训练", "RIGHT_HAND", 900, 70.2, 67.5, "completed", 9},
		{4, "李华", "面部训练", "TONGUE", 600, 72.0, 68.8, "completed", 8},
		{4, "李华", "上肢训练", "LEFT_HAND", 1200, 68.3, 64.9, "completed", 7},
		{4, "李华", "认知训练", "FOCUS", 900, 75.0, 71.5, "completed", 6},
		{4, "李华", "上肢训练", "RIGHT_HAND", 1200, 73.5, 69.8, "completed", 5},
		{4, "李华", "基础训练", "RELAX", 600, 82.0, 78.5, "completed", 4},
		{4, "李华", "上肢训练", "BOTH_HANDS", 900, 60.5, 57.2, "completed", 3},
		{4, "李华", "上肢训练", "LEFT_HAND", 1200, 72.8, 69.3, "completed", 2},
		{4, "李华", "下肢训练", "WALK", 900, 58.3, 55.1, "completed", 1},

		{5, "张伟", "上肢训练", "LEFT_HAND", 600, 55.2, 52.0, "completed", 12},
		{5, "张伟", "基础训练", "RELAX", 600, 78.0, 75.0, "completed", 11},
		{5, "张伟", "上肢训练", "RIGHT_HAND", 600, 58.5, 54.8, "completed", 10},
		{5, "张伟", "认知训练", "FOCUS", 600, 70.0, 66.5, "completed", 9},
		{5, "张伟", "上肢训练", "LEFT_HAND", 900, 60.3, 57.2, "completed", 8},
		{5, "张伟", "上肢训练", "RIGHT_HAND", 900, 62.8, 59.5, "completed", 7},
		{5, "张伟", "基础训练", "RELAX", 900, 80.5, 77.2, "completed", 6},
		{5, "张伟", "上肢训练", "LEFT_HAND", 900, 63.5, 60.1, "completed", 5},
		{5, "张伟", "下肢训练", "LEFT_FOOT", 600, 52.0, 49.2, "completed", 4},
		{5, "张伟", "上肢训练", "RIGHT_HAND", 900, 65.2, 61.8, "completed", 3},
		{5, "张伟", "上肢训练", "LEFT_HAND", 1200, 67.0, 63.5, "completed", 2},
		{5, "张伟", "上肢训练", "ARMS_UP", 600, 58.5, 55.3, "completed", 1},
	}

	for _, s := range sessions {
		startTime := time.Now().AddDate(0, 0, -s.DaysAgo)
		endTime := startTime.Add(time.Duration(s.Duration) * time.Second)
		notes, _ := json.Marshal(map[string]interface{}{
			"difficulty": "medium",
			"feedback":   "表现稳定，继续保持",
		})

		res, err := DB.Exec(`INSERT INTO training_sessions 
			(user_id, user_name, type, command, start_time, end_time, duration, 
			 success_rate, avg_accuracy, status, notes, created_at) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			s.UserID, s.UserName, s.Type, s.Command, startTime, endTime, s.Duration,
			s.SuccessRate, s.AvgAccuracy, s.Status, string(notes), startTime)
		if err != nil {
			log.Printf("Failed to insert session: %v", err)
			continue
		}

		sessionID, _ := res.LastInsertId()
		generateEEGData(sessionID, s.UserID, s.Command, startTime, s.Duration, s.AvgAccuracy)
	}

	log.Println("Historical data seeded successfully")
}

func generateEEGData(sessionID, userID int64, command string, startTime time.Time, duration int, avgAccuracy float64) {
	samples := duration / 2
	if samples > 200 {
		samples = 200
	}

	baseQuality := 60.0 + (avgAccuracy * 0.3)
	tx, _ := DB.Begin()
	stmt, _ := tx.Prepare(`INSERT INTO eeg_signals 
		(session_id, user_id, timestamp, channel_1, channel_2, channel_3, channel_4, 
		 channel_5, channel_6, channel_7, channel_8, signal_quality, command, processed) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`)

	for i := 0; i < samples; i++ {
		t := startTime.Add(time.Duration(i*2) * time.Second)
		noise := (float64(i%10) - 5) * 0.5
		quality := baseQuality + noise
		if quality > 100 {
			quality = 100
		}
		if quality < 30 {
			quality = 30
		}

		_, err := stmt.Exec(
			sessionID, userID, t,
			20.0+float64(i%15)*0.3+noise,
			18.0+float64(i%12)*0.4+noise,
			22.0+float64(i%18)*0.25+noise,
			19.5+float64(i%14)*0.35+noise,
			21.0+float64(i%16)*0.3+noise,
			17.5+float64(i%11)*0.45+noise,
			23.0+float64(i%17)*0.28+noise,
			20.5+float64(i%13)*0.32+noise,
			quality,
			command,
		)
		if err != nil {
			log.Printf("Failed to insert EEG: %v", err)
		}
	}

	stmt.Close()
	tx.Commit()
}
