CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(50),
    phone VARCHAR(20),
    id_card VARCHAR(20),
    age INTEGER,
    gender VARCHAR(10),
    avatar VARCHAR(255),
    role VARCHAR(20) DEFAULT 'USER',
    status INTEGER DEFAULT 1,
    emergency_contact VARCHAR(50),
    emergency_phone VARCHAR(20),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS room (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    type VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    facilities TEXT,
    images TEXT,
    floor INTEGER,
    bed_count INTEGER,
    area VARCHAR(20),
    status INTEGER DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS service_package (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER,
    services TEXT,
    suitable_for VARCHAR(255),
    image VARCHAR(255),
    status INTEGER DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS booking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    package_id INTEGER,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    days INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    remark TEXT,
    elder_name VARCHAR(50),
    elder_phone VARCHAR(20),
    elder_id_card VARCHAR(20),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (room_id) REFERENCES room(id),
    FOREIGN KEY (package_id) REFERENCES service_package(id)
);

CREATE TABLE IF NOT EXISTS health_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    systolic_pressure INTEGER,
    diastolic_pressure INTEGER,
    heart_rate INTEGER,
    blood_sugar INTEGER,
    temperature INTEGER,
    weight INTEGER,
    remark TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS payment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no VARCHAR(50) NOT NULL,
    booking_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20),
    transaction_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING',
    pay_time DATETIME,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (booking_id) REFERENCES booking(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS chat_message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text',
    is_read INTEGER DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (from_user_id) REFERENCES user(id),
    FOREIGN KEY (to_user_id) REFERENCES user(id)
);
