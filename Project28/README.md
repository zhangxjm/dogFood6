# 航天卫星轨道计算仿真平台

基于 Python FastAPI 与 React 开发的全栈卫星轨道计算仿真系统。

## 功能特性

- **卫星管理**: 卫星信息的增删改查
- **轨道计算**: 基于开普勒元素的高精度轨道计算（使用 SciPy）
- **3D 轨道仿真**: 使用 Three.js 实现的实时轨道可视化
- **碰撞预警**: 基于轨道传播的碰撞检测和预警系统
- **J2 摄动**: 考虑地球扁率的高精度轨道传播

## 技术栈

### 后端
- Python 3.11+
- FastAPI - Web 框架
- SQLAlchemy - ORM
- SQLite - 数据库
- SciPy / NumPy - 科学计算
- Uvicorn - ASGI 服务器

### 前端
- React 18
- Ant Design - UI 组件库
- Three.js / @react-three/fiber - 3D 可视化
- React Router - 路由
- Axios - HTTP 客户端

## 快速开始

### 方式一：使用 Docker（推荐）

#### Windows
```bash
start.bat
```

#### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

启动后访问:
- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

停止服务:
```bash
# Windows
stop.bat

# Linux/Mac
./stop.sh
```

### 方式二：手动启动

#### 后端服务
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 前端服务
```bash
cd frontend
npm install
npm start
```

## 轨道算法说明

### 开普勒轨道要素
- 半长轴 (a): 椭圆轨道的半长轴
- 偏心率 (e): 轨道的偏心率
- 倾角 (i): 轨道平面与赤道面的夹角
- 升交点赤经 (Ω): 升交点的经度
- 近地点幅角 (ω): 近地点与升交点的夹角
- 真近点角 (ν): 卫星与近地点的夹角

### 轨道传播
使用数值积分方法（Runge-Kutta 45）考虑:
- 二体问题
- J2 摄动（地球扁率）

## 项目结构

```
.
├── backend/                 # 后端服务
│   ├── app/
│   │   ├── main.py         # FastAPI 主应用
│   │   ├── config.py       # 配置
│   │   ├── database.py     # 数据库连接
│   │   ├── models/         # 数据模型
│   │   ├── routers/        # API 路由
│   │   └── services/       # 业务逻辑
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   ├── components/     # 公共组件
│   │   └── services/       # API 服务
│   ├── package.json
│   └── Dockerfile
├── docker/                 # Docker 配置
│   └── docker-compose.yml
├── start.bat / start.sh    # 启动脚本
└── stop.bat / stop.sh      # 停止脚本
```

## API 接口

### 卫星管理
- `GET /api/v1/satellites` - 获取卫星列表
- `POST /api/v1/satellites` - 创建卫星
- `GET /api/v1/satellites/{id}` - 获取卫星详情
- `PUT /api/v1/satellites/{id}` - 更新卫星
- `DELETE /api/v1/satellites/{id}` - 删除卫星

### 轨道计算
- `POST /api/v1/orbit/calculate` - 计算轨道
- `GET /api/v1/orbit/elements` - 获取轨道要素

### 碰撞预警
- `POST /api/v1/collision/check` - 检查碰撞
- `GET /api/v1/collision/alerts` - 获取预警列表
- `POST /api/v1/collision/scan` - 全域扫描
