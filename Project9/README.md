# 培训机构教室预约系统

基于 Go Gin + GORM + SQLite 的全栈培训机构教室预约管理系统。

## 功能特性

- **教室场地管理**: 管理培训教室的基本信息、设备、容量等
- **课程预约使用**: 为课程预约教室时间段，自动检测时间冲突
- **场地使用时间管控**: 可视化查看各教室的可用时段，避免重复预约
- **使用记录统计**: 统计教室使用频率、课程排课情况等数据

## 技术栈

- **后端**: Go 1.21, Gin Framework, GORM ORM
- **数据库**: SQLite
- **前端**: 原生 HTML/CSS/JavaScript
- **容器化**: Docker / Docker Compose

## 快速开始

### 方式一：直接运行（Windows）

```bat
start.bat
```

### 方式二：直接运行（Linux/Mac）

```bash
chmod +x start.sh
./start.sh
```

### 方式三：Docker 运行

```bash
docker-compose up -d
```

### 方式四：手动编译运行

```bash
# 安装依赖
go mod tidy

# 编译
go build -o classroom-booking-system .

# 运行
./classroom-booking-system
```

## 访问系统

启动后访问：http://localhost:8080

## 初始数据

系统首次启动会自动初始化以下数据：

### 教室
- A101 多媒体教室
- A201 多功能厅
- B101 计算机教室
- B201 语音教室
- C101 实训教室

### 课程
- Web前端开发
- Python编程
- 人工智能入门
- 英语培训
- UI设计课程
- 网络安全

### 预约示例
系统自动创建了一些示例预约记录。

## API 接口

### 教室管理
- `GET /api/classrooms` - 获取教室列表
- `GET /api/classrooms/:id` - 获取单个教室
- `POST /api/classrooms` - 创建教室
- `PUT /api/classrooms/:id` - 更新教室
- `DELETE /api/classrooms/:id` - 删除教室

### 课程管理
- `GET /api/courses` - 获取课程列表
- `POST /api/courses` - 创建课程

### 预约管理
- `GET /api/bookings` - 获取预约列表（支持 date, classroom_id 查询参数）
- `POST /api/bookings` - 创建预约
- `PUT /api/bookings/:id` - 更新预约
- `PUT /api/bookings/:id/cancel` - 取消预约
- `DELETE /api/bookings/:id` - 删除预约

### 使用记录
- `GET /api/records` - 获取使用记录（支持 start_date, end_date 查询参数）

### 统计分析
- `GET /api/statistics` - 获取统计数据

### 可用时段
- `GET /api/available-slots?classroom_id=1&date=2024-01-01` - 查询指定教室在指定日期的可用时段

## 项目结构

```
Project9/
├── main.go                 # 主入口文件
├── models/                 # 数据模型
│   └── models.go
├── handlers/               # 请求处理器
│   └── handlers.go
├── routes/                 # 路由配置
│   └── routes.go
├── database/               # 数据库初始化
│   └── database.go
├── frontend/               # 前端文件
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── Dockerfile
├── docker-compose.yml
├── start.bat              # Windows启动脚本
└── start.sh               # Linux/Mac启动脚本
```

## 注意事项

- 数据库文件 (classroom_booking.db) 会自动创建在项目根目录
- 首次启动会自动初始化示例数据
- 预约时自动检测时间冲突，相同时间段不可重复预约
- 系统支持跨域请求，可直接集成到其他前端应用
