package database

import (
	"database/sql"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"quantum-key-distribution/config"
)

var db *sql.DB

type KeyRecord struct {
	ID        string    `json:"id"`
	Key       string    `json:"key"`
	Length    int       `json:"length"`
	Sender    string    `json:"sender"`
	Receiver  string    `json:"receiver"`
	Status    string    `json:"status"`
	ErrorRate float64   `json:"error_rate"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

type SecurityCheck struct {
	ID         string    `json:"id"`
	KeyID      string    `json:"key_id"`
	CheckType  string    `json:"check_type"`
	Result     string    `json:"result"`
	Details    string    `json:"details"`
	CheckedAt  time.Time `json:"checked_at"`
}

func InitDB() error {
	var err error
	db, err = sql.Open("sqlite3", config.GetDatabasePath())
	if err != nil {
		return err
	}

	if err = db.Ping(); err != nil {
		return err
	}

	if err = createTables(); err != nil {
		return err
	}

	return nil
}

func createTables() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS key_records (
			id TEXT PRIMARY KEY,
			key TEXT NOT NULL,
			length INTEGER NOT NULL,
			sender TEXT NOT NULL,
			receiver TEXT NOT NULL,
			status TEXT NOT NULL,
			error_rate REAL DEFAULT 0,
			created_at DATETIME NOT NULL,
			expires_at DATETIME NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS security_checks (
			id TEXT PRIMARY KEY,
			key_id TEXT NOT NULL,
			check_type TEXT NOT NULL,
			result TEXT NOT NULL,
			details TEXT,
			checked_at DATETIME NOT NULL,
			FOREIGN KEY (key_id) REFERENCES key_records(id)
		)`,
		`CREATE INDEX IF NOT EXISTS idx_key_records_created ON key_records(created_at)`,
		`CREATE INDEX IF NOT EXISTS idx_security_checks_key ON security_checks(key_id)`,
	}

	for _, query := range queries {
		if _, err := db.Exec(query); err != nil {
			return err
		}
	}

	return nil
}

func SeedData() error {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM key_records").Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	return nil
}

func CloseDB() {
	if db != nil {
		db.Close()
	}
}

func GetDB() *sql.DB {
	return db
}

func InsertKeyRecord(record *KeyRecord) error {
	query := `INSERT INTO key_records (id, key, length, sender, receiver, status, error_rate, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := db.Exec(query, record.ID, record.Key, record.Length, record.Sender, record.Receiver, record.Status, record.ErrorRate, record.CreatedAt, record.ExpiresAt)
	return err
}

func GetKeyRecords(limit int) ([]KeyRecord, error) {
	query := `SELECT id, key, length, sender, receiver, status, error_rate, created_at, expires_at FROM key_records ORDER BY created_at DESC LIMIT ?`
	rows, err := db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []KeyRecord
	for rows.Next() {
		var r KeyRecord
		err := rows.Scan(&r.ID, &r.Key, &r.Length, &r.Sender, &r.Receiver, &r.Status, &r.ErrorRate, &r.CreatedAt, &r.ExpiresAt)
		if err != nil {
			return nil, err
		}
		records = append(records, r)
	}
	return records, nil
}

func GetKeyRecordByID(id string) (*KeyRecord, error) {
	query := `SELECT id, key, length, sender, receiver, status, error_rate, created_at, expires_at FROM key_records WHERE id = ?`
	var r KeyRecord
	err := db.QueryRow(query, id).Scan(&r.ID, &r.Key, &r.Length, &r.Sender, &r.Receiver, &r.Status, &r.ErrorRate, &r.CreatedAt, &r.ExpiresAt)
	if err != nil {
		return nil, err
	}
	return &r, nil
}

func UpdateKeyRecordStatus(id, status string) error {
	query := `UPDATE key_records SET status = ? WHERE id = ?`
	_, err := db.Exec(query, status, id)
	return err
}

func InsertSecurityCheck(check *SecurityCheck) error {
	query := `INSERT INTO security_checks (id, key_id, check_type, result, details, checked_at) VALUES (?, ?, ?, ?, ?, ?)`
	_, err := db.Exec(query, check.ID, check.KeyID, check.CheckType, check.Result, check.Details, check.CheckedAt)
	return err
}

func GetSecurityChecksByKeyID(keyID string) ([]SecurityCheck, error) {
	query := `SELECT id, key_id, check_type, result, details, checked_at FROM security_checks WHERE key_id = ? ORDER BY checked_at DESC`
	rows, err := db.Query(query, keyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var checks []SecurityCheck
	for rows.Next() {
		var c SecurityCheck
		err := rows.Scan(&c.ID, &c.KeyID, &c.CheckType, &c.Result, &c.Details, &c.CheckedAt)
		if err != nil {
			return nil, err
		}
		checks = append(checks, c)
	}
	return checks, nil
}
