CREATE TABLE IF NOT EXISTS satellite_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    satellite_id VARCHAR(64) NOT NULL,
    satellite_name VARCHAR(128) NOT NULL,
    data_type VARCHAR(64) NOT NULL,
    raw_data TEXT NOT NULL,
    parsed_data TEXT,
    received_time DATETIME NOT NULL,
    processed_time DATETIME,
    data_size INTEGER NOT NULL,
    checksum VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'RECEIVED',
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_satellite_data_satellite_id ON satellite_data(satellite_id);
CREATE INDEX IF NOT EXISTS idx_satellite_data_received_time ON satellite_data(received_time);
CREATE INDEX IF NOT EXISTS idx_satellite_data_status ON satellite_data(status);
CREATE INDEX IF NOT EXISTS idx_satellite_data_type ON satellite_data(data_type);

CREATE TABLE IF NOT EXISTS data_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME NOT NULL,
    received_count INTEGER NOT NULL DEFAULT 0,
    processed_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    throughput REAL NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_statistics_timestamp ON data_statistics(timestamp);

CREATE TABLE IF NOT EXISTS satellite_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    satellite_id VARCHAR(64) NOT NULL UNIQUE,
    satellite_name VARCHAR(128) NOT NULL,
    data_format VARCHAR(32) NOT NULL DEFAULT 'JSON',
    parser_config TEXT,
    enabled BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
