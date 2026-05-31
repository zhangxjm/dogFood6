CREATE DATABASE IF NOT EXISTS farmhouse_order DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE farmhouse_order;

CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dish (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image VARCHAR(255),
    status INT DEFAULT 1,
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dining_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(20) NOT NULL UNIQUE,
    seats INT NOT NULL,
    status VARCHAR(20) DEFAULT '空闲',
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_id INT NOT NULL,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT '待上菜',
    total_amount DECIMAL(12,2) DEFAULT 0,
    remark VARCHAR(500),
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_table_id (table_id),
    INDEX idx_status (status),
    INDEX idx_create_at (create_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    dish_id INT NOT NULL,
    dish_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT '待出餐',
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO user (username, password, role) VALUES
('admin', '123456', '管理员'),
('chef', '123456', '厨师'),
('waiter', '123456', '服务员')
ON DUPLICATE KEY UPDATE username=username;

INSERT INTO dish (name, description, price, category, status) VALUES
('农家红烧肉', '选用农家散养黑猪肉，肥而不腻，入口即化', 58.00, '肉类', 1),
('土鸡汤', '散养土鸡慢炖4小时，汤鲜味美', 88.00, '汤类', 1),
('清炒时蔬', '新鲜有机蔬菜，健康美味', 28.00, '蔬菜', 1),
('农家小炒肉', '土猪五花肉配青椒，香辣可口', 48.00, '肉类', 1),
('清蒸鲈鱼', '新鲜鲈鱼，原汁原味', 68.00, '水产', 1),
('番茄鸡蛋汤', '家常口味，开胃解渴', 18.00, '汤类', 1),
('凉拌黄瓜', '清脆爽口，开胃小菜', 16.00, '凉菜', 1),
('梅菜扣肉', '传统工艺，肥而不腻', 58.00, '肉类', 1)
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO dining_table (number, seats, status) VALUES
('A1', 4, '空闲'),
('A2', 4, '空闲'),
('A3', 6, '空闲'),
('B1', 8, '空闲'),
('B2', 8, '空闲'),
('C1', 10, '空闲'),
('C2', 12, '空闲')
ON DUPLICATE KEY UPDATE number=number;
