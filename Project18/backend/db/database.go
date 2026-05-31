package db

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func Init(dbPath string) error {
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	var err error
	DB, err = sql.Open("sqlite3", dbPath+"?_foreign_keys=on&_journal_mode=WAL")
	if err != nil {
		return err
	}

	DB.SetMaxOpenConns(1)
	DB.SetMaxIdleConns(1)

	if err = runMigrations(); err != nil {
		return err
	}

	log.Println("Database initialized successfully")
	return nil
}

func runMigrations() error {
	migrations := []string{
		`CREATE TABLE IF NOT EXISTS product_lines (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			description TEXT,
			device_count INTEGER DEFAULT 0,
			status TEXT DEFAULT 'active',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS devices (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			ip_address TEXT,
			status TEXT DEFAULT 'offline',
			cpu_usage REAL DEFAULT 0,
			memory_usage REAL DEFAULT 0,
			product_line TEXT,
			last_seen DATETIME,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (product_line) REFERENCES product_lines(id) ON DELETE SET NULL
		)`,
		`CREATE TABLE IF NOT EXISTS edge_tasks (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			type TEXT,
			device_id TEXT,
			status TEXT DEFAULT 'pending',
			priority INTEGER DEFAULT 0,
			payload TEXT,
			result TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			completed_at DATETIME,
			FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS sensor_data (
			id TEXT PRIMARY KEY,
			device_id TEXT,
			metric TEXT,
			value REAL,
			unit TEXT,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			processed INTEGER DEFAULT 0,
			FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS log_entries (
			id TEXT PRIMARY KEY,
			device_id TEXT,
			level TEXT,
			message TEXT,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS offline_cache (
			id TEXT PRIMARY KEY,
			device_id TEXT,
			data_type TEXT,
			data TEXT,
			status TEXT DEFAULT 'pending',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
		)`,
		`CREATE INDEX IF NOT EXISTS idx_sensor_data_device ON sensor_data(device_id)`,
		`CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp)`,
		`CREATE INDEX IF NOT EXISTS idx_log_entries_device ON log_entries(device_id)`,
		`CREATE INDEX IF NOT EXISTS idx_offline_cache_device ON offline_cache(device_id)`,
		`CREATE INDEX IF NOT EXISTS idx_edge_tasks_device ON edge_tasks(device_id)`,
	}

	for _, migration := range migrations {
		if _, err := DB.Exec(migration); err != nil {
			log.Printf("Migration error: %v\nQuery: %s", err, migration)
			return err
		}
	}

	return nil
}

func Close() {
	if DB != nil {
		DB.Close()
	}
}
