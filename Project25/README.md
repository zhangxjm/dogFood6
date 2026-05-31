# 元宇宙教育虚拟实训平台

基于 Node.js Express + Next.js + WebGL + SQLite 的全栈元宇宙教育虚拟实训系统，实现专业技能虚拟操作、实训数据记录、成绩自动评定，突破 3D 虚拟场景渲染、多人协同实训瓶颈。

## 技术栈

### 后端
- Node.js + Express
- SQLite (better-sqlite3)
- WebSocket (ws)
- JWT 认证
- bcryptjs 密码加密

### 前端
- Next.js 14
- React 18
- Three.js + @react-three/fiber (3D渲染)
- Tailwind CSS
- Zustand (状态管理)
- Axios (HTTP客户端)
- Lucide React (图标库)

## 功能特性

### 核心功能
1. **3D虚拟场景渲染** - 使用WebGL技术实现沉浸式虚拟实训环境
2. **专业技能虚拟操作** - 支持电子电路、机械装配、化学实验、PLC编程、机器人操作、网络配置等多学科实训
3. **实训数据记录** - 完整记录用户操作轨迹、用时、错误次数等数据
4. **成绩自动评定** - 根据操作准确率和用时自动计算实训成绩
5. **多人协同实训** - WebSocket实时同步，支持多人协作完成实训任务
6. **成就系统** - 完成实训获得成就奖励，激发学习动力

### 用户系统
- 三种角色：管理员、教师、学生
- JWT令牌认证
- 用户资料管理
- 实训历史记录
- 个人成就展示

### 实训模块管理
- 预置6个专业实训模块
- 支持按分类、难度筛选
- 教师/管理员可创建新模块

### 协同实训
- 创建/加入房间
- 房间码分享
- 实时聊天
- 成员管理
- 多人状态同步

## 快速开始

### 方式一：使用启动脚本（推荐）

#### Windows
```bash
start.bat
```

#### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

### 方式二：使用 Docker

#### Windows
```bash
docker-start.bat
```

#### Linux/Mac
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### 方式三：手动启动

1. 安装依赖并启动后端：
```bash
cd server
npm install
node app.js
```

2. 安装依赖并启动前端：
```bash
cd client
npm install
npm run dev
```

## 访问地址

- 前端界面：http://localhost:3000
- 后端API：http://localhost:3001/api
- WebSocket：ws://localhost:3001/ws

## 演示账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 教师 | teacher | teacher123 |
| 学生 | student1 | student123 |
| 学生 | student2 | student123 |
| 学生 | student3 | student123 |

## 项目结构

```
Project25/
├── server/                 # 后端服务
│   ├── app.js             # 应用入口
│   ├── database.js        # 数据库初始化
│   ├── routes/            # API路由
│   │   ├── auth.js        # 认证相关
│   │   ├── training.js    # 实训模块
│   │   ├── session.js     # 实训会话
│   │   ├── collaborative.js # 协同实训
│   │   └── achievement.js # 成就系统
│   ├── websocket/
│   │   └── handler.js     # WebSocket处理
│   └── package.json
├── client/                 # 前端应用
│   ├── pages/             # 页面组件
│   │   ├── _app.js        # 应用入口
│   │   ├── login.js       # 登录页
│   │   ├── dashboard.js   # 仪表盘
│   │   ├── training.js    # 实训列表
│   │   ├── training/
│   │   │   └── [id].js    # 实训详情
│   │   ├── collaborative.js # 协同实训
│   │   ├── achievements.js # 成就中心
│   │   └── profile.js     # 个人中心
│   ├── components/
│   │   ├── Layout.js      # 布局组件
│   │   └── VirtualScene.js # 3D场景组件
│   ├── lib/
│   │   ├── api.js         # API请求封装
│   │   └── websocket.js   # WebSocket服务
│   ├── store/
│   │   └── index.js       # 状态管理
│   ├── styles/
│   │   └── globals.css    # 全局样式
│   └── package.json
├── docker-compose.yml      # Docker编排
├── start.bat              # Windows启动脚本
├── start.sh               # Linux启动脚本
├── docker-start.bat       # Windows Docker启动
├── docker-start.sh        # Linux Docker启动
└── README.md
```

## 数据库

使用 SQLite 数据库，数据库文件位于 `server/data/training.db`，首次启动会自动创建并初始化测试数据。

### 数据表
- users - 用户表
- training_modules - 实训模块表
- training_sessions - 实训会话表
- operation_logs - 操作日志表
- achievements - 成就表
- collaborative_rooms - 协同房间表
- room_participants - 房间参与者表

## API 接口

### 认证相关
- POST /api/auth/login - 用户登录
- POST /api/auth/register - 用户注册
- GET /api/auth/profile - 获取用户信息
- PUT /api/auth/profile - 更新用户信息

### 实训模块
- GET /api/training/modules - 获取模块列表
- GET /api/training/modules/:id - 获取模块详情
- POST /api/training/modules - 创建模块
- PUT /api/training/modules/:id - 更新模块
- DELETE /api/training/modules/:id - 删除模块
- GET /api/training/categories - 获取分类
- GET /api/training/difficulties - 获取难度

### 实训会话
- POST /api/session/start - 开始实训
- POST /api/session/:id/complete - 完成实训
- POST /api/session/:id/log - 记录操作
- GET /api/session - 获取会话列表
- GET /api/session/:id - 获取会话详情
- GET /api/session/stats/overview - 获取统计数据

### 协同实训
- POST /api/collaborative/rooms - 创建房间
- GET /api/collaborative/rooms - 获取房间列表
- GET /api/collaborative/rooms/:code - 获取房间详情
- POST /api/collaborative/rooms/:code/join - 加入房间
- POST /api/collaborative/rooms/:code/leave - 离开房间
- POST /api/collaborative/rooms/:code/start - 开始实训
- POST /api/collaborative/rooms/:code/close - 关闭房间

### 成就系统
- GET /api/achievement - 获取成就列表
- GET /api/achievement/leaderboard - 获取排行榜
- GET /api/achievement/:id - 获取成就详情

## License

MIT License
