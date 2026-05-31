# 跨境保税仓智能库存管理系统

基于 Go Gin + Next.js 的跨境保税仓智能库存管理系统，整合 RFID 与 Redis，实现库存自动盘点、临期商品预警、保税额度管控。

## 功能特性

- **库存自动盘点**：基于 RFID 技术实现自动化库存盘点
- **临期商品预警**：智能检测临期商品，分级预警（紧急/警告）
- **保税额度管控**：实时监控各仓库保税额度使用情况
- **多仓数据同步**：支持跨仓库库存调拨与数据一致性保障
- **实时数据缓存**：基于 Redis 实现高性能数据缓存与实时通知

## 技术栈

### 后端
- Go 1.21
- Gin Web Framework
- GORM ORM
- SQLite 数据库
- Redis 缓存

### 前端
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Recharts 图表库

## 快速开始

### 环境要求
- Go 1.21+
- Node.js 18+
- Docker & Docker Compose

### Windows 系统启动
```bash
start.bat
```

### Linux/Mac 系统启动
```bash
chmod +x start.sh
./start.sh
```

### 手动启动

1. 启动 Redis
```bash
docker-compose up -d redis
```

2. 启动后端服务
```bash
cd backend
go mod download
go run cmd/main.go
```

3. 启动前端服务
```bash
cd frontend
npm install
npm run dev
```

## 访问地址

- 前端 UI: http://localhost:3002
- 后端 API: http://localhost:8082
- API 健康检查: http://localhost:8082/api/v1/health

## 项目结构

```
.
├── backend/                    # Go 后端
│   ├── cmd/                    # 入口文件
│   ├── internal/
│   │   ├── models/             # 数据模型
│   │   ├── handlers/           # API 处理器
│   │   ├── services/           # 业务逻辑
│   │   ├── config/             # 配置
│   │   └── middleware/         # 中间件
│   └── pkg/
│       ├── redis/              # Redis 客户端
│       └── rfid/               # RFID 服务
├── frontend/                   # Next.js 前端
│   ├── app/                    # 页面路由
│   ├── components/             # 组件
│   └── lib/                    # 工具库
├── docker-compose.yml          # Docker Compose 配置
├── start.bat                   # Windows 启动脚本
└── start.sh                    # Linux/Mac 启动脚本
```

## 主要功能模块

### 1. 仪表盘
- 仓库数量、商品种类、库存总数统计
- 保税额度总体使用情况图表
- 临期预警数量统计

### 2. 仓库管理
- 仓库增删改查
- 保税额度配置
- 额度使用率监控

### 3. 商品管理
- 商品信息管理
- 分类管理
- 保税税额配置

### 4. 库存管理
- 库存记录管理
- RFID 自动盘点
- 批次与有效期管理

### 5. 临期预警
- 自动检测临期商品
- 分级预警（30天/7天）
- 预警处理标记

### 6. 库存同步
- 跨仓库库存调拨
- 同步任务记录
- 分布式锁保证数据一致性

## API 接口

### 仪表盘
- `GET /api/v1/dashboard/stats` - 获取统计数据

### 仓库管理
- `GET /api/v1/warehouses` - 仓库列表
- `POST /api/v1/warehouses` - 创建仓库
- `PUT /api/v1/warehouses/:id` - 更新仓库
- `DELETE /api/v1/warehouses/:id` - 删除仓库
- `GET /api/v1/warehouses/:id/quota` - 获取额度使用情况

### 商品管理
- `GET /api/v1/products` - 商品列表
- `GET /api/v1/products/categories` - 获取分类
- `GET /api/v1/products/search` - 搜索商品
- `POST /api/v1/products` - 创建商品
- `PUT /api/v1/products/:id` - 更新商品
- `DELETE /api/v1/products/:id` - 删除商品

### 库存管理
- `GET /api/v1/inventories` - 库存列表
- `POST /api/v1/inventories` - 创建库存
- `PUT /api/v1/inventories/:id` - 更新库存
- `DELETE /api/v1/inventories/:id` - 删除库存
- `POST /api/v1/inventories/sync` - 库存同步
- `POST /api/v1/stocktake/:id/auto` - 自动盘点

### 临期预警
- `POST /api/v1/expiry/check` - 检查临期商品
- `GET /api/v1/expiry/alerts` - 获取预警列表
- `POST /api/v1/expiry/alerts/:id/resolve` - 标记已处理
- `GET /api/v1/expiry/stats` - 获取预警统计

## 初始化数据

系统首次启动时会自动初始化以下测试数据：
- 3 个保税仓库（上海、深圳、广州）
- 6 种商品（奶粉、红酒、护肤品等）
- 9 条库存记录
- 4 个 RFID 阅读器

## 许可证

MIT License
