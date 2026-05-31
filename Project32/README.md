# 宠物行为 AI 分析训练系统

基于 Python Django 与 Vue3 开发的全栈宠物行为分析系统，集成 AI 行为识别模型与 MinIO 存储。

## 功能特性

- **宠物管理**: 宠物信息的增删改查
- **视频上传与存储**: 基于 MinIO 的视频云存储
- **AI 行为识别**: 自动分析视频中的宠物行为
- **不良行为检测**: 识别并标记不良行为及其严重程度
- **个性化训练推荐**: 根据分析结果生成训练方案
- **训练进度追踪**: 记录和追踪训练完成情况

## 技术栈

**后端**:
- Python 3.9+
- Django 4.2
- Django REST Framework
- SQLite 数据库
- MinIO 对象存储

**前端**:
- Vue 3
- Vite
- Element Plus
- Vue Router
- Axios

**基础设施**:
- Docker & Docker Compose
- MinIO

## 快速开始

### 环境要求

- Python 3.9+
- Node.js 16+
- Docker & Docker Compose
- Git

### Windows 系统启动

```bash
# 双击运行或在命令行执行
start.bat
```

### Linux/Mac 系统启动

```bash
chmod +x start.sh
./start.sh
```

### 手动启动

1. 启动 Docker 服务:
```bash
cd docker
docker-compose up -d
```

2. 启动后端:
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py init_data
python manage.py runserver 0.0.0.0:8000
```

3. 启动前端:
```bash
cd frontend
npm install
npm run dev
```

## 访问地址

- **前端界面**: http://localhost:3000
- **后端 API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin
- **MinIO 控制台**: http://localhost:9001 (用户名: minioadmin, 密码: minioadmin)

## 系统使用

### 1. 宠物管理
- 在"宠物管理"页面添加您的宠物信息
- 系统预置了两只示例宠物：旺财（金毛）和咪咪（英短）

### 2. 视频上传
- 选择要分析的宠物
- 上传视频文件（支持 MP4、AVI、MOV 等格式）
- 视频自动存储到 MinIO

### 3. 行为分析
- 点击"开始分析"按钮对视频进行 AI 分析
- 系统将识别视频中的宠物行为
- 标记不良行为及其置信度

### 4. 训练方案
- 选择宠物后点击"生成推荐方案"
- 系统根据行为分析结果自动生成个性化训练方案
- 可查看训练步骤并标记完成进度

### 5. 行为类型管理
- 管理系统支持的行为类型
- 可自定义行为代码、名称、描述及严重程度

## 项目结构

```
Project32/
├── backend/                 # Django 后端
│   ├── api/                 # API 应用
│   │   ├── management/      # 自定义命令（数据初始化）
│   │   ├── models.py        # 数据模型
│   │   ├── views.py         # API 视图
│   │   ├── serializers.py   # 序列化器
│   │   ├── minio_service.py # MinIO 服务
│   │   └── behavior_analyzer.py  # 行为分析器
│   ├── pet_behavior_system/ # Django 项目配置
│   ├── requirements.txt     # Python 依赖
│   └── manage.py
├── frontend/                # Vue3 前端
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   ├── router/          # 路由配置
│   │   ├── api/             # API 封装
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker/                  # Docker 配置
│   └── docker-compose.yml
├── start.bat                # Windows 启动脚本
└── start.sh                 # Linux/Mac 启动脚本
```

## API 接口

- `GET /api/pets/` - 宠物列表
- `POST /api/pets/` - 创建宠物
- `GET /api/videos/` - 视频列表
- `POST /api/videos/` - 上传视频
- `POST /api/videos/{id}/analyze/` - 分析视频
- `GET /api/analyses/` - 分析记录
- `POST /api/training-plans/recommend/` - 生成训练方案
- `GET /api/dashboard/stats/` - 数据概览统计

## 默认数据

系统初始化时会创建以下默认数据：

**行为类型 (15种)**:
- 正常行为: 坐下、停留、过来、行走、奔跑、玩耍、进食、睡觉
- 不良行为: 吠叫、扑人、咬东西、攻击行为、恐惧反应、焦虑不安、追逐

**示例宠物**:
- 旺财 - 金毛寻回犬，3岁，28.5kg
- 咪咪 - 英国短毛猫，2岁，5.2kg

## 注意事项

1. 首次启动需要安装依赖，可能需要较长时间
2. 请确保 Docker 服务正常运行
3. 如需使用真实 AI 模型，请替换 `behavior_analyzer.py` 中的模拟实现
4. 生产环境请修改 `.env` 文件中的密钥和密码

## 开发说明

本系统目前使用模拟的 AI 行为识别算法进行演示。如需集成真实的深度学习模型，请修改 `backend/api/behavior_analyzer.py` 文件，接入您的 TensorFlow/PyTorch 模型。
