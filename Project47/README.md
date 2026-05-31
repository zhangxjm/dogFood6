# 跨境电商知识产权维权系统

## 项目简介

本系统是基于 Java SpringCloud 与 Vue3 开发的跨境电商知识产权维权全栈系统，实现侵权商品监测、证据固定、维权流程追踪等功能。

## 技术栈

### 后端
- Java 17
- Spring Boot 3.2
- Spring Cloud 2023.0.0
- Spring Data JPA
- SQLite 数据库
- RabbitMQ 消息队列

### 前端
- Vue 3
- Vite
- Element Plus
- ECharts
- Axios

## 系统功能

### 1. 数据概览 (Dashboard)
- 商品监测数据统计
- 证据收集情况展示
- 维权案件状态统计
- 可视化图表展示

### 2. 侵权商品监测
- 商品信息管理
- 侵权状态监测
- 侵权风险评分
- 多平台支持

### 3. 证据管理
- 证据自动收集
- 证据验证与公证
- 文件哈希校验
- 证据链追踪

### 4. 维权案件追踪
- 案件全流程管理
- 状态实时更新
- 案件详情查看
- 法律流程闭环

### 5. 版权作品管理
- 版权作品登记
- 权利人信息管理
- 关键词匹配

## 项目结构

```
Project47/
├── backend/                 # 后端项目
│   ├── src/main/java/com/ipr/
│   │   ├── entity/         # 实体类
│   │   ├── repository/     # 数据访问层
│   │   ├── service/        # 业务逻辑层
│   │   ├── controller/     # 控制层
│   │   ├── config/         # 配置类
│   │   └── dto/            # 数据传输对象
│   └── pom.xml
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   ├── router/         # 路由配置
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml      # Docker 配置
├── start.bat              # Windows 启动脚本
├── start.sh               # Linux/Mac 启动脚本
└── stop.bat               # 停止脚本
```

## 快速开始

### 环境要求
- Docker Desktop
- JDK 17+
- Maven 3.6+
- Node.js 16+

### 启动步骤 (Windows)

1. 确保 Docker Desktop 已启动
2. 双击运行 `start.bat`
3. 等待所有服务启动完成

### 手动启动

1. 启动 RabbitMQ:
```bash
docker-compose up -d rabbitmq
```

2. 启动后端:
```bash
cd backend
mvn spring-boot:run
```

3. 启动前端:
```bash
cd frontend
npm install
npm run dev
```

## 访问地址

- 前端界面: http://localhost:3008
- 后端API: http://localhost:8080
- RabbitMQ管理: http://localhost:15672 (admin/admin123)

## 数据库说明

系统使用 SQLite 数据库，数据库文件为 `backend/ipr_database.db`，系统首次启动时会自动创建并初始化演示数据。

## 消息队列

系统使用 RabbitMQ 实现异步消息处理，包含三个队列：
- `ipr.monitoring.queue` - 商品监测队列
- `ipr.evidence.queue` - 证据收集队列
- `ipr.legal.queue` - 法律流程队列

## 初始化数据

系统启动时会自动初始化以下演示数据：
- 3 个版权作品
- 8 个监测商品
- 10 条证据记录
- 4 个维权案件
