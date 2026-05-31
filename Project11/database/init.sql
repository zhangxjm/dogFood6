CREATE TABLE IF NOT EXISTS ttc_command (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command_code VARCHAR(64) NOT NULL,
    command_name VARCHAR(128) NOT NULL,
    command_type VARCHAR(32),
    target_device VARCHAR(64),
    command_content TEXT,
    priority INTEGER DEFAULT 1,
    status INTEGER DEFAULT 0,
    execute_result TEXT,
    scheduled_time TIMESTAMP,
    send_time TIMESTAMP,
    execute_time TIMESTAMP,
    finish_time TIMESTAMP,
    operator VARCHAR(64),
    remark TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_command_code ON ttc_command(command_code);
CREATE INDEX IF NOT EXISTS idx_command_status ON ttc_command(status);
CREATE INDEX IF NOT EXISTS idx_command_create_time ON ttc_command(create_time);

CREATE TABLE IF NOT EXISTS device (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_code VARCHAR(64) NOT NULL UNIQUE,
    device_name VARCHAR(128) NOT NULL,
    device_type VARCHAR(32),
    location VARCHAR(256),
    status INTEGER DEFAULT 1,
    description TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_device_code ON device(device_code);

CREATE TABLE IF NOT EXISTS payload_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_code VARCHAR(64) NOT NULL,
    device_name VARCHAR(128),
    data_type VARCHAR(32) NOT NULL,
    data_value TEXT NOT NULL,
    unit VARCHAR(16),
    threshold_min REAL,
    threshold_max REAL,
    status INTEGER DEFAULT 0,
    collect_time TIMESTAMP,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payload_device ON payload_data(device_code);
CREATE INDEX IF NOT EXISTS idx_payload_time ON payload_data(collect_time);
CREATE INDEX IF NOT EXISTS idx_payload_type ON payload_data(data_type);

CREATE TABLE IF NOT EXISTS alert (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type VARCHAR(32),
    alert_level VARCHAR(16) DEFAULT 'medium',
    alert_content TEXT,
    source VARCHAR(64),
    device_code VARCHAR(64),
    status INTEGER DEFAULT 0,
    handler VARCHAR(64),
    handle_result TEXT,
    handle_time TIMESTAMP,
    alert_time TIMESTAMP,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alert_status ON alert(status);
CREATE INDEX IF NOT EXISTS idx_alert_level ON alert(alert_level);
CREATE INDEX IF NOT EXISTS idx_alert_time ON alert(alert_time);

CREATE TABLE IF NOT EXISTS circuit_breaker (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_name VARCHAR(128) NOT NULL UNIQUE,
    resource_type VARCHAR(32),
    status INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    threshold INTEGER DEFAULT 5,
    timeout INTEGER DEFAULT 30,
    open_time TIMESTAMP,
    half_open_time TIMESTAMP,
    close_time TIMESTAMP,
    remark TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_circuit_resource ON circuit_breaker(resource_name);

INSERT INTO device (device_code, device_name, device_type, location, status, description) VALUES 
('DEV001', '发射控制系统', 'control', '发射塔架A', 1, '火箭发射主控制系统'),
('DEV002', '遥测数据采集器', 'telemetry', '测控中心', 1, '负责火箭飞行数据采集'),
('DEV003', '姿态控制器', 'control', '发射塔架B', 1, '火箭姿态稳定控制'),
('DEV004', '温度传感器阵列', 'sensor', '箭体', 1, '监测箭体各部位温度'),
('DEV005', '压力监测系统', 'monitor', '测控中心', 1, '实时监测系统压力状态');

INSERT INTO ttc_command (command_code, command_name, command_type, target_device, command_content, priority, status, operator, remark) VALUES 
('CMD2024001', '系统自检', 'check', 'DEV001', '执行发射前系统全面自检', 1, 3, 'system', 'system'),
('CMD2024002', '点火前准备', 'prepare', 'DEV002', '遥测系统校准准备', 2, 3, 'system', 'init'),
('CMD2024003', '姿态校正', 'control', 'DEV003', '执行火箭初始姿态校正', 1, 0, 'operator_a', 'pending'),
('CMD2024004', '压力检测', 'check', 'DEV005', '检查各系统压力状态', 2, 3, 'operator_b', 'completed');

INSERT INTO alert (alert_type, alert_level, alert_content, source, device_code, status, alert_time) VALUES 
('system', 'low', '系统正常启动', 'system', 'DEV001', 1, datetime('now', '-2 hours')),
('payload', 'medium', '温度传感器#3温度偏高', 'payload', 'DEV004', 0, datetime('now', '-30 minutes')),
('command', 'high', '指令执行超时警告', 'command', 'DEV003', 0, datetime('now', '-5 minutes'));
