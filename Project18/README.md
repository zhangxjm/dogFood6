# Industrial Edge Computing Platform

工业边缘计算实时监控中台

## 系统架构

- **后端**: Go Echo v4
- **前端**: SolidJS + Vite
- **数据库**: SQLite
- **缓存/消息队列**: Redis
- **容器化**: Docker + Docker Compose

## 功能特性

1. **产线设备边缘算力调度** - 任务分发与执行管理
2. **本地数据预处理** - 传感器数据采集与处理
3. **异常离线缓存** - 断网数据本地存储，恢复后自动同步
4. **实时监控仪表盘** - 设备状态、系统资源实时展示
5. **设备管理** - 边缘设备注册、状态监控
6. **任务调度** - 边缘计算任务分发与执行追踪

## 快速开始

### 方式一：Docker 部署 (推荐)

```bash
# 启动所有服务
docker compose up -d --build

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

### 方式二：本地开发运行

**前置要求:**
- Go 1.21+
- Node.js 18+
- Redis 7+

**Windows:**
```batch
start-local.bat
```

**Linux/Mac:**
```bash
chmod +x start-local.sh
./start-local.sh
```

或者手动运行：

```bash
# 1. 启动 Redis
docker run -d --name edge-redis -p 6379:6379 redis:7-alpine

# 2. 启动后端
cd backend
go mod tidy
go build -o edge-backend .
./edge-backend

# 3. 启动前端 (新终端)
cd frontend
npm install
npm run dev
```

## 访问地址

- 前端监控面板: http://localhost:3000
- 后端API文档: http://localhost:8080/api/health
- Redis: localhost:6379

## API 接口

### 产线管理
- `GET /api/product-lines` - 获取产线列表
- `POST /api/product-lines` - 创建产线
- `PUT /api/product-lines/:id` - 更新产线
- `DELETE /api/product-lines/:id` - 删除产线

### 设备管理
- `GET /api/devices` - 获取设备列表
- `GET /api/devices/:id` - 获取设备详情
- `POST /api/devices` - 创建设备
- `PUT /api/devices/:id` - 更新设备
- `DELETE /api/devices/:id` - 删除设备
- `PUT /api/devices/:id/status` - 更新设备状态

### 任务调度
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务状态
- `DELETE /api/tasks/:id` - 删除任务

### 传感器数据
- `GET /api/sensor-data` - 获取传感器数据
- `POST /api/sensor-data/ingest` - 上传传感器数据

### 系统日志
- `GET /api/logs` - 获取系统日志

### 离线缓存
- `GET /api/offline-cache` - 获取待同步缓存
- `POST /api/offline-cache/sync` - 手动同步缓存

### 系统状态
- `GET /api/system-stats` - 获取系统统计数据
- `GET /api/health` - 健康检查

### 边缘网关
- `POST /api/gateway/ingest` - 网关数据接入接口

## 项目结构

```
Project18/
├── backend/
│   ├── config/          # 配置管理
│   ├── db/              # 数据库初始化与迁移
│   ├── handlers/        # HTTP 请求处理
│   ├── middleware/      # 中间件 (CORS, Logger)
│   ├── models/          # 数据模型
│   ├── services/        # 业务逻辑
│   ├── Dockerfile
│   ├── go.mod
│   └── main.go
├── frontend/
│   ├── src/
│   │   ├── components/  # SolidJS 组件
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── styles.css
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── start.bat            # Windows Docker 启动
├── start.sh             # Linux/Mac Docker 启动
├── start-local.bat      # Windows 本地启动
├── start-local.sh       # Linux/Mac 本地启动
├── stop.bat             # Windows 停止
└── stop.sh              # Linux/Mac 停止
```

## 默认初始化数据

系统首次启动时会自动创建：

- 4条产线: 汽车装配产线A, 汽车装配产线B, 电池生产线, 涂装车间
- 10台设备: PLC控制器、机械臂、AGV小车、喷涂机器人等
- 4个示例任务
- 5条系统日志

## 技术亮点

1. **低延迟数据处理** - 本地预处理减少云端依赖
2. **断网续传** - SQLite本地缓存，网络恢复自动同步
3. **实时监控** - WebSocket实时推送设备状态
4. **任务调度** - 基于Redis的任务队列分发
5. **设备管理** - 统一的设备生命周期管理
