# 航天发射场测控指令调度系统

## 项目简介

基于 Java SpringCloud Alibaba 与 SolidJS 构建的航天发射场测控指令调度系统，集成 Redis 分布式锁与 RocketMQ，实现载荷数据实时分发、故障自动熔断、测控流程闭环。

## 技术栈

### 后端
- Spring Boot 2.7.18
- Spring Cloud 2021.0.8
- Spring Cloud Alibaba 2021.0.5.0
- Nacos (服务注册与配置中心)
- Sentinel (流量控制与熔断)
- RocketMQ (消息队列)
- Redis (分布式锁与缓存)
- MyBatis Plus (ORM)
- SQLite (数据库)

### 前端
- SolidJS 1.8.15
- Solid Router 0.13.0
- Axios
- ECharts
- Vite

## 项目结构

```
Project11/
├── backend/                    # 后端服务
│   ├── common/                # 公共模块
│   ├── gateway/               # 网关服务 (8080)
│   ├── command-service/       # 测控指令服务 (8081)
│   ├── payload-service/       # 载荷数据服务 (8082)
│   └── monitor-service/       # 监控告警服务 (8083)
├── frontend/                  # 前端项目 (3000)
├── docker/                    # Docker 配置
├── database/                  # 数据库脚本
├── start-infra.bat           # 启动中间件
├── start-gateway.bat         # 启动网关
├── start-command-service.bat # 启动指令服务
├── start-payload-service.bat # 启动载荷服务
├── start-monitor-service.bat # 启动监控服务
├── start-frontend.bat        # 启动前端
├── start-all.bat             # 一键启动全部
├── stop-all.bat              # 停止全部
├── build-backend.bat         # 构建后端
└── init-db.py                # 初始化数据库
```

## 快速开始

### 环境要求
- JDK 1.8+
- Maven 3.6+
- Node.js 16+
- Python 3.x
- Docker Desktop

### 一键启动

```bash
# 1. 启动全部服务
start-all.bat

# 2. 停止全部服务
stop-all.bat
```

### 分步启动

```bash
# 1. 启动中间件 (Redis, Nacos, RocketMQ, Sentinel)
start-infra.bat

# 2. 初始化数据库
python init-db.py

# 3. 构建后端
build-backend.bat

# 4. 启动各服务 (分别在新窗口执行)
start-gateway.bat
start-command-service.bat
start-payload-service.bat
start-monitor-service.bat

# 5. 启动前端
start-frontend.bat
```

## 访问地址

| 服务 | 地址 | 账号密码 |
|------|------|----------|
| 前端 | http://localhost:3000 | - |
| 网关 | http://localhost:8080 | - |
| Nacos | http://localhost:8848/nacos | nacos/nacos |
| Sentinel | http://localhost:8858 | sentinel/sentinel |
| RocketMQ Console | http://localhost:8088 | admin/admin |

## 核心功能

### 1. 测控指令调度
- 指令发送与执行
- 指令状态跟踪
- 批量指令发送
- 指令取消功能
- 分布式锁保证指令唯一性

### 2. 载荷数据监控
- 实时数据采集
- 数据阈值告警
- 历史数据查询
- 设备状态监控
- 数据实时分发

### 3. 监控告警中心
- 告警实时推送
- 告警处理流程
- 告警统计分析
- 熔断器管理
- 系统状态监控

### 4. 设备管理
- 设备信息管理
- 设备状态监控
- 设备类型管理

## 核心特性

### Redis 分布式锁
- 基于 Redis SETNX 实现
- 支持锁自动过期
- Lua 脚本保证原子性释放

### RocketMQ 消息驱动
- 指令发送异步解耦
- 载荷数据实时分发
- 告警消息实时推送
- 高可靠消息传输

### Sentinel 熔断降级
- 流量控制
- 服务熔断
- 系统自适应保护

## 数据库表结构

- ttc_command - 测控指令表
- device - 设备信息表
- payload_data - 载荷数据表
- alert - 告警信息表
- circuit_breaker - 熔断器表
