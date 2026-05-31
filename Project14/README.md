# 跨境冷链温控溯源系统

基于 Go Gin + Vue3 构建的跨境冷链温控溯源系统，整合 MQTT 消息队列与 InfluxDB 时序数据库，实现跨境生鲜温湿度实时采集、海关溯源核验、异常自动告警功能。

## 功能特性

- 📊 **实时监控**: 温湿度数据实时采集与展示
- 📦 **货物追踪**: 跨境运输全程温度溯源
- 🏛️ **海关核验**: 海关清关数据核验与记录
- ⚠️ **异常告警**: 温度超限自动告警机制
- 📡 **设备管理**: 冷链传感器设备状态监控

## 技术栈

### 后端
- Go 1.21 + Gin Web 框架
- GORM ORM + SQLite 数据库
- Eclipse Paho MQTT 客户端
- InfluxDB 2.x 时序数据库

### 前端
- Vue 3 + Vite
- Element Plus UI 组件库
- ECharts 数据可视化
- Vue Router 路由管理

### 中间件
- Mosquitto MQTT Broker
- InfluxDB 2.x 时序数据库
- Nginx Web 服务器

## 快速启动

### 环境要求
- Docker 20.10+
- Docker Compose 2.0+

### Windows 系统
```bash
start.bat
```

### Linux/Mac 系统
```bash
chmod +x start.sh
./start.sh
```

### 手动启动
```bash
# 创建必要目录
mkdir -p docker/mosquitto/data docker/mosquitto/log
mkdir -p docker/influxdb/data docker/influxdb/config
mkdir -p backend/data

# 构建并启动服务
docker-compose up -d --build
```

## 访问地址

- **前端页面**: http://localhost
- **后端 API**: http://localhost:8080
- **InfluxDB**: http://localhost:8086 (admin/admin123456)
- **MQTT Broker**: localhost:1883

## API 接口

### 监控数据
- `GET /api/dashboard` - 获取仪表盘统计

### 设备管理
- `GET /api/devices` - 获取设备列表
- `GET /api/devices/:id` - 获取设备详情
- `GET /api/devices/:id/data` - 获取设备历史数据

### 货物追踪
- `GET /api/shipments` - 获取运输单列表
- `POST /api/shipments` - 创建运输单
- `GET /api/shipments/:id` - 获取运输单详情
- `GET /api/shipments/:id/trace` - 获取溯源数据
- `PUT /api/shipments/:id/verify` - 海关核验

### 告警管理
- `GET /api/alerts` - 获取告警列表
- `PUT /api/alerts/:id/resolve` - 处理告警

### 海关记录
- `GET /api/customs` - 获取核验记录

## 项目结构

```
Project14/
├── backend/                 # Go 后端服务
│   ├── main.go             # 主程序入口
│   ├── Dockerfile          # Docker 构建文件
│   ├── go.mod              # Go 依赖管理
│   └── data/               # SQLite 数据目录
├── frontend/               # Vue3 前端
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   ├── router/         # 路由配置
│   │   ├── App.vue         # 根组件
│   │   └── main.js         # 入口文件
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── docker/                 # Docker 数据卷
│   ├── mosquitto/          # MQTT 配置
│   └── influxdb/           # InfluxDB 数据
├── docker-compose.yml      # Docker 编排
├── start.bat              # Windows 启动脚本
├── start.sh               # Linux/Mac 启动脚本
└── README.md
```

## 默认数据

系统启动后自动初始化以下演示数据：

### 设备
- SENSOR001: 冷链集装箱A01 (上海港, 在线)
- SENSOR002: 冷链集装箱A02 (深圳港, 在线)
- SENSOR003: 冷链集装箱B01 (洛杉矶港, 在线)
- SENSOR004: 冷链集装箱B02 (新加坡港, 离线)

### 运输单
- CC202405010001: 进口三文鱼 (挪威 -> 上海, 运输中)
- CC202405010002: 进口牛肉 (澳大利亚 -> 深圳, 清关中)
- CC202405010003: 进口蓝莓 (智利 -> 广州, 已送达)

## 停止服务

```bash
docker-compose down
```

## 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```
