# 航天遥感影像智能解译平台

基于 Python FastAPI 与 Vue3 开发的航天遥感影像智能解译平台，集成 OpenCV 与 Elasticsearch，实现卫星影像地物识别、变化检测、数据标注等功能。

## 功能特性

- **影像管理**：支持卫星影像上传、预览、删除、元数据管理
- **数据标注**：可视化标注工具，支持矩形框标注地物
- **地物识别**：基于 OpenCV 的智能地物检测算法
- **变化检测**：双时相影像变化检测，生成变化热力图
- **数据检索**：集成 Elasticsearch，支持全文检索和多条件筛选
- **统计仪表盘**：数据概览和可视化统计

## 技术栈

### 后端
- Python 3.10
- FastAPI - Web 框架
- SQLAlchemy - ORM
- SQLite - 数据库
- OpenCV - 图像处理
- Elasticsearch - 搜索引擎
- PIL/Pillow - 图片处理

### 前端
- Vue 3
- Element Plus - UI 组件库
- Pinia - 状态管理
- Vue Router - 路由
- ECharts - 数据可视化
- Axios - HTTP 客户端

## 快速开始

### 环境要求
- Docker
- Docker Compose

### 启动项目

**Windows 系统：**
```bash
start.bat
```

**Linux/Mac 系统：**
```bash
chmod +x start.sh
./start.sh
```

### 停止项目

**Windows 系统：**
```bash
stop.bat
```

**Linux/Mac 系统：**
```bash
./stop.sh
```

## 访问地址

启动成功后，可通过以下地址访问：

- **前端页面**: http://localhost:3000
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs
- **Elasticsearch**: http://localhost:9200

## 项目结构

```
Project20/
├── backend/                 # 后端服务
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI 主入口
│   │   ├── config.py       # 配置文件
│   │   ├── database.py     # 数据库连接
│   │   ├── models.py       # 数据模型
│   │   ├── schemas.py      # Pydantic 模型
│   │   ├── routers/        # API 路由
│   │   │   ├── images.py
│   │   │   ├── annotations.py
│   │   │   └── detection.py
│   │   ├── image_processor.py    # 图像处理
│   │   └── elasticsearch_client.py # ES 客户端
│   ├── init_data.py        # 初始化数据脚本
│   ├── requirements.txt    # Python 依赖
│   └── Dockerfile
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── router/         # 路由配置
│   │   ├── api/            # API 封装
│   │   ├── views/          # 页面组件
│   │   │   ├── HomeView.vue
│   │   │   ├── ImagesView.vue
│   │   │   ├── AnnotationView.vue
│   │   │   ├── DetectionView.vue
│   │   │   ├── ChangeDetectionView.vue
│   │   │   └── SearchView.vue
│   │   └── assets/         # 静态资源
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml      # Docker 编排
├── start.bat / start.sh    # 启动脚本
└── stop.bat / stop.sh      # 停止脚本
```

## 功能模块说明

### 1. 首页概览
- 展示系统统计数据（影像总数、标注数量、检测任务等）
- 最新影像预览
- 功能使用分布图表
- 快捷操作入口

### 2. 影像管理
- 影像列表展示
- 支持上传新影像
- 影像详情查看
- 按卫星来源、位置筛选

### 3. 数据标注
- 影像选择面板
- 可视化标注画布
- 矩形框标注工具
- 标注列表管理

### 4. 地物识别
- 选择影像进行智能检测
- 检测结果可视化展示
- 置信度显示
- 检测结果管理

### 5. 变化检测
- 双时相影像选择
- 变化区域检测
- 变化热力图展示
- 变化率统计
- 历史记录

### 6. 数据检索
- 关键词全文检索（Elasticsearch）
- 多条件筛选
- 热门搜索标签
- 搜索结果详情

## API 接口

主要 API 端点：

- `GET /api/v1/images/` - 获取影像列表
- `POST /api/v1/images/upload` - 上传影像
- `POST /api/v1/images/search` - 搜索影像
- `GET /api/v1/annotations/` - 获取标注列表
- `POST /api/v1/annotations/` - 创建标注
- `POST /api/v1/detection/objects` - 地物识别
- `POST /api/v1/detection/change-detection` - 变化检测

## 注意事项

1. 首次启动会自动初始化示例数据
2. Elasticsearch 服务启动可能需要较长时间（约 30 秒）
3. 如果 ES 连接失败，系统会降级使用数据库搜索
4. 数据文件存储在 `backend/uploads`、`backend/thumbnails` 目录
