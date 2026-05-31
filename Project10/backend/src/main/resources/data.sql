-- Initialize sample data for pet grooming system

INSERT INTO members (name, phone, address, total_grooming_count, create_time, update_time) VALUES
('张三', '13800138001', '北京市朝阳区xxx路123号', 3, NOW(), NOW()),
('李四', '13800138002', '北京市海淀区xxx路456号', 1, NOW(), NOW()),
('王五', '13800138003', '北京市西城区xxx路789号', 5, NOW(), NOW()),
('赵六', '13800138004', '北京市东城区xxx路321号', 0, NOW(), NOW()),
('钱七', '13800138005', '北京市丰台区xxx路654号', 2, NOW(), NOW());

INSERT INTO pets (name, species, breed, age, gender, member_id, create_time, update_time) VALUES
('豆豆', '狗', '金毛', 3, '公', 1, NOW(), NOW()),
('咪咪', '猫', '英短', 2, '母', 1, NOW(), NOW()),
('旺财', '狗', '柯基', 4, '公', 2, NOW(), NOW()),
('小白', '猫', '布偶', 1, '母', 3, NOW(), NOW()),
('小黑', '狗', '拉布拉多', 5, '公', 3, NOW(), NOW()),
('毛毛', '猫', '美短', 3, '公', 5, NOW(), NOW());

INSERT INTO grooming_items (name, duration_minutes, price, description, is_active, create_time, update_time) VALUES
('基础洗护', 60, 88.00, '包含洗澡、吹干、梳理', true, NOW(), NOW()),
('精洗护', 90, 168.00, '包含基础洗护+去油+护毛素', true, NOW(), NOW()),
('SPA护理', 120, 298.00, '包含精洗护+SPA按摩+精油护理', true, NOW(), NOW()),
('剪毛造型', 90, 198.00, '根据宠物体型进行造型修剪', true, NOW(), NOW()),
('驱虫服务', 30, 68.00, '体内外驱虫服务', true, NOW(), NOW()),
('指甲修剪', 15, 30.00, '指甲修剪及打磨', true, NOW(), NOW());

INSERT INTO grooming_records (pet_id, member_id, item_id, item_name, start_time, end_time, duration_minutes, price, notes, status, create_time, update_time) VALUES
(1, 1, 1, '基础洗护', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY + INTERVAL 65 MINUTE, 65, 88.00, '宠物状态良好', '已完成', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY + INTERVAL 65 MINUTE),
(1, 1, 4, '剪毛造型', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY + INTERVAL 95 MINUTE, 95, 198.00, '造型完成，宠物很配合', '已完成', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY + INTERVAL 95 MINUTE),
(2, 1, 2, '精洗护', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY + INTERVAL 92 MINUTE, 92, 168.00, '猫咪有些紧张，洗护顺利完成', '已完成', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY + INTERVAL 92 MINUTE),
(3, 2, 1, '基础洗护', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY + INTERVAL 58 MINUTE, 58, 88.00, NULL, '已完成', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY + INTERVAL 58 MINUTE),
(4, 3, 3, 'SPA护理', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY + INTERVAL 125 MINUTE, 125, 298.00, 'SPA效果很好，毛发顺滑', '已完成', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY + INTERVAL 125 MINUTE),
(5, 3, 5, '驱虫服务', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY + INTERVAL 28 MINUTE, 28, 68.00, NULL, '已完成', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY + INTERVAL 28 MINUTE),
(4, 3, 6, '指甲修剪', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY + INTERVAL 12 MINUTE, 12, 30.00, NULL, '已完成', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY + INTERVAL 12 MINUTE),
(4, 3, 4, '剪毛造型', NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 14 DAY + INTERVAL 88 MINUTE, 88, 198.00, '夏季造型，清爽舒适', '已完成', NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 14 DAY + INTERVAL 88 MINUTE),
(5, 3, 1, '基础洗护', NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY + INTERVAL 62 MINUTE, 62, 88.00, NULL, '已完成', NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY + INTERVAL 62 MINUTE),
(6, 5, 2, '精洗护', NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY + INTERVAL 85 MINUTE, 85, 168.00, NULL, '已完成', NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY + INTERVAL 85 MINUTE),
(6, 5, 6, '指甲修剪', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY + INTERVAL 10 MINUTE, 10, 30.00, NULL, '已完成', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY + INTERVAL 10 MINUTE),
(1, 1, 3, 'SPA护理', NOW(), NULL, NULL, 298.00, NULL, '进行中', NOW(), NOW());
