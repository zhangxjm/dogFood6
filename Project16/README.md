# 宠物医疗影像 AI 诊断系统

Pet Medical Imaging AI Diagnosis System

## 项目简介

本系统是一个基于 Python Django 与 React 开发的宠物医疗影像 AI 诊断系统，集成 TensorFlow 实现宠物 X 光片识别、病症自动分析和电子病历生成功能。

## 技术栈

### 后端
- Python 3.10+
- Django 4.2
- Django REST Framework
- SQLite 数据库
- TensorFlow 2.15
- OpenCV
- Cryptography (影像加密)

### 前端
- React 18
- Ant Design 5
- React Router
- Axios
- Recharts (图表)

## 主要功能

1. **用户管理** - 支持医生、助理、管理员三种角色
2. **宠物管理** - 宠物信息录入和管理
3. **医疗记录** - 电子病历创建和管理
4. **影像加密存储** - 使用 AES 加密存储医疗影像
5. **AI 诊断** - 基于 TensorFlow 的 X 光片识别和病症分析
6. **治疗建议** - 自动生成个性化治疗建议
7. **数据统计** - 诊断数据可视化展示

## 快速开始

### Windows 启动方式

```bash
# 双击运行启动脚本
start.bat

# 或按顺序执行：
# 1. 初始化后端
scripts\init_backend.bat

# 2. 初始化前端
scripts\init_frontend.bat

# 3. 启动后端
scripts\start_backend.bat

# 4. 启动前端
scripts\start_frontend.bat
```

### Docker 启动方式

```bash
# 构建并启动所有服务
docker-compose up -d

# 初始化数据库
docker-compose exec backend python manage.py migrate
docker-compose exec backend python init_data.py
```

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 医生 | doctor | doctor123 |
| 助理 | assistant | assistant123 |

## 访问地址

- 前端界面: http://localhost:3000
- 后端 API: http://localhost:8000/api
- Django 管理后台: http://localhost:8000/admin

## 项目结构

```
Project16/
├── backend/                 # Django 后端
│   ├── accounts/           # 用户管理模块
│   ├── pets/               # 宠物管理模块
│   ├── medical_records/    # 医疗记录模块
│   ├── ai_diagnosis/       # AI 诊断模块
│   ├── pet_med_ai/         # 项目配置
│   ├── init_data.py        # 初始化数据脚本
│   └── requirements.txt    # Python 依赖
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── pages/          # 页面组件
│   │   └── services/       # API 服务
│   └── package.json        # Node 依赖
├── scripts/                # 启动脚本
├── docker/                 # Docker 配置
├── media/                  # 媒体文件
├── docker-compose.yml      # Docker Compose 配置
└── start.bat              # Windows 启动脚本
```

## AI 诊断支持的病症

- 正常 (Normal)
- 髋关节发育不良 (Hip Dysplasia)
- 骨折 (Fracture)
- 关节炎 (Arthritis)
- 心脏病 (Heart Disease)
- 肺部疾病 (Lung Disease)
- 肿瘤 (Tumor)
- 膀胱结石 (Bladder Stone)

## 许可证

MIT License
