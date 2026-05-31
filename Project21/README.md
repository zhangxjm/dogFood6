# 非遗研学沉浸式互动课程系统

基于 Node.js NestJS 与 React 构建的非遗研学沉浸式互动课程系统。

## 功能特性

- 研学课程定制
- 实时直播教学（WebSocket）
- 数字证书颁发
- 大文件课件传输（MinIO）
- 多人实时互动

## 技术栈

- 后端：NestJS + TypeScript + SQLite + TypeORM + WebSocket
- 前端：React + TypeScript + Ant Design + Socket.io
- 存储：MinIO 对象存储
- 部署：Docker + Docker Compose

## 快速开始

### 方式一：一键启动（推荐）

Windows:
```bash
start.bat
```

Linux/Mac:
```bash
bash start.sh
```

### 方式二：手动启动

1. 启动 MinIO:
```bash
docker-compose up -d minio
```

2. 安装后端依赖并启动:
```bash
cd backend
npm install
npm run start:dev
```

3. 安装前端依赖并启动:
```bash
cd frontend
npm install
npm start
```

## 访问地址

- 前端应用：http://localhost:3000
- 后端 API：http://localhost:3001
- MinIO 控制台：http://localhost:9001 (minioadmin/minioadmin123)

## 默认账号

- 管理员：admin / admin123
- 教师：teacher / teacher123
- 学生：student / student123
