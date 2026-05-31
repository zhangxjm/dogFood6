# 工业设备能耗优化管控系统

基于 Java SpringBoot 与 Svelte 的工业设备能耗优化管控系统。

## 功能特性

- **能耗实时统计** - 实时监控设备能耗，展示今日/本周/本月能耗数据
- **设备管理** - 管理工业设备信息与运行状态
- **能耗数据分析** - 查看历史能耗数据，支持多维度分析
- **智能节能方案** - 基于AI算法自动生成节能优化方案
- **损耗分析** - 智能识别设备能耗损耗并提供优化建议

## 技术栈

### 后端
- Java 17
- Spring Boot 3.2
- Spring Data JPA
- Spring Data Elasticsearch
- SQLite 数据库
- Lombok

### 前端
- Svelte 4
- Vite 5
- Chart.js 数据可视化
- Axios HTTP 客户端

### 中间件
- Elasticsearch 8.11
- Kibana 8.11

## 环境要求

- JDK 17+
- Node.js 18+
- Docker Desktop (运行 Elasticsearch)
- Maven 3.9+

## 快速启动

### Windows 系统

```bash
# 直接运行启动脚本
start.bat
```

### 手动启动

1. **启动 Docker 容器**
```bash
docker-compose up -d
```

2. **启动后端服务**
```bash
cd backend
mvn spring-boot:run
```

3. **启动前端服务** (新开终端)
```bash
cd frontend
npm install
npm run dev
```

## 访问地址

- 前端应用: http://localhost:5173
- 后端API: http://localhost:8080/api
- Elasticsearch: http://localhost:9200
- Kibana: http://localhost:5601

## 项目结构

```
Project53/
├── backend/                    # SpringBoot 后端
│   ├── src/main/java/com/energy/
│   │   ├── entity/            # 实体类
│   │   ├── repository/        # 数据访问层
│   │   ├── service/           # 业务逻辑层
│   │   ├── controller/        # 控制层
│   │   ├── algorithm/         # 能耗算法模块
│   │   ├── elasticsearch/     # ES 集成
│   │   └── config/            # 配置类
│   └── src/main/resources/
│       └── application.yml    # 应用配置
├── frontend/                   # Svelte 前端
│   ├── src/
│   │   ├── pages/             # 页面组件
│   │   ├── components/        # 公共组件
│   │   ├── api.js             # API 封装
│   │   ├── App.svelte         # 根组件
│   │   └── main.js            # 入口文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml          # Docker 编排
├── start.bat                   # Windows 启动脚本
└── start.sh                    # Linux 启动脚本
```

## API 接口

### 设备管理
- `GET /api/equipment` - 获取设备列表
- `POST /api/equipment` - 创建设备
- `GET /api/equipment/{id}` - 获取设备详情

### 能耗数据
- `GET /api/energy-data` - 获取能耗数据列表
- `GET /api/energy-data/statistics/realtime` - 实时统计

### 节能方案
- `GET /api/saving-plans` - 获取节能方案列表
- `GET /api/algorithm/saving-plans/{equipmentId}` - 智能生成方案

### 损耗分析
- `GET /api/loss-analysis` - 获取损耗分析列表
- `GET /api/loss-analysis/statistics` - 损耗统计

## 数据初始化

应用首次启动时会自动初始化：
- 5 台测试设备
- 1000+ 条能耗历史数据
- 多个节能优化方案
- 损耗分析数据
