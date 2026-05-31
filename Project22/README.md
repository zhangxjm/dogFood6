# Industrial AI Vision Inspection System

工业AI视觉质检闭环系统，基于Java Spring Boot与React构建，实现产品缺陷实时检测、不合格品自动分流、质检报表生成。

## 技术栈

- **后端**: Java 17 + Spring Boot 3.2 + Spring WebSocket + Spring Data JPA
- **数据库**: SQLite (嵌入式)
- **前端**: React 18 + TypeScript + Vite + TailwindCSS + Recharts
- **状态管理**: Zustand
- **实时通信**: WebSocket (STOMP)
- **图标**: Lucide React

## 项目结构

```
Project22/
├── backend/                    # Java Spring Boot 后端
│   ├── src/main/java/com/inspection/
│   │   ├── controller/         # REST API 控制器
│   │   ├── service/            # 业务服务层
│   │   ├── entity/             # JPA 实体类
│   │   ├── repository/         # 数据访问层
│   │   ├── dto/                # 数据传输对象
│   │   └── config/             # 配置类
│   ├── src/main/resources/     # 资源文件
│   └── data/                   # SQLite 数据库目录
├── src/                        # React 前端
│   ├── components/             # 组件
│   ├── pages/                  # 页面
│   ├── store.ts                # Zustand 状态管理
│   ├── api.ts                  # API 接口
│   └── App.tsx                 # 应用入口
├── docker-compose.yml          # Docker 中间件配置
├── start.bat                   # Windows 启动脚本
└── start.sh                    # Linux/Mac 启动脚本
```

## 功能模块

1. **实时监控仪表盘**
   - 产线运行状态监控
   - 检测数据实时统计
   - 合格率趋势图
   - 实时检测流展示

2. **缺陷管理**
   - 缺陷类型配置
   - 检测记录查询
   - 缺陷图像查看

3. **自动分流控制**
   - 分流规则配置
   - 分流统计
   - 设备状态监控

4. **质检报表中心**
   - 日报/周报/月报生成
   - 趋势分析图表
   - 缺陷分布统计

5. **设备与模型管理**
   - 相机管理
   - 视觉模型部署
   - 边缘节点监控

6. **系统管理**
   - 用户管理
   - 产线配置
   - 系统参数设置

## 快速启动

### 环境要求

- Java 17+
- Maven 3.6+
- Node.js 18+
- npm 8+

### 启动方式

**Windows:**
```cmd
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### 手动启动

1. **启动后端:**
```bash
cd backend
mvn clean package -DskipTests
java -jar target/industrial-inspection-backend-1.0.0.jar
```

2. **启动前端 (新终端):**
```bash
npm install
npm run dev
```

## 访问地址

- **前端页面**: http://localhost:3000
- **后端API**: http://localhost:8080
- **API文档**: http://localhost:8080/actuator

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

其他预设账号:
- `manager` / `manager123` (生产主管)
- `operator` / `operator123` (质检操作员)

## 数据说明

系统启动时会自动初始化以下数据:
- 3条用户账号
- 4条生产流水线
- 6台工业相机
- 3个边缘计算节点
- 8种常见缺陷类型
- 3个视觉检测模型
- 3条分流规则
- 系统配置参数

## 检测模拟

系统内置检测模拟器，会定时生成模拟检测数据用于演示。可通过系统设置中的 `simulation.enabled` 参数控制。
