# 社区便民维修上门预约系统

基于 Express + Bootstrap + SQLite 的社区便民维修上门预约系统。

## 功能特性

- 水电维修服务（水管维修、电路维修、灯具安装）
- 家电维修服务（空调维修、洗衣机维修、冰箱维修、热水器维修、燃气灶维修）
- 用户在线下单预约
- 订单状态管理（待处理、已派单、维修中、已完成）
- 维修完工确认
- 自动分配技师

## 技术栈

- **后端**: Node.js + Express
- **前端**: EJS + Bootstrap 5
- **数据库**: SQLite3
- **图标**: Font Awesome 4.7

## 快速启动

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

### 方式二：手动启动

1. 安装依赖
```bash
npm install
```

2. 初始化数据库
```bash
npm run init-db
```

3. 启动服务
```bash
npm start
```

### 方式三：使用 Docker

```bash
docker-compose up -d
```

## 访问系统

启动成功后，访问: http://localhost:3000

## 初始数据

系统初始化时会自动创建以下数据：

### 服务类型
- 水电维修：水管维修、电路维修、灯具安装
- 家电维修：空调维修、洗衣机维修、冰箱维修、热水器维修、燃气灶维修

### 技师
- 张师傅 - 水电维修
- 李师傅 - 家电维修
- 王师傅 - 空调维修
- 赵师傅 - 综合维修

## 订单状态流程

1. **待处理** - 用户提交订单，等待分配技师
2. **已派单** - 系统自动分配技师
3. **维修中** - 技师开始维修
4. **已完成** - 维修完成确认

## 目录结构

```
├── database/
│   ├── db.js          # 数据库连接配置
│   ├── init.js        # 数据库初始化脚本
│   └── repair.db      # SQLite数据库文件（自动生成）
├── routes/
│   ├── index.js       # 首页路由
│   ├── orders.js      # 订单路由
│   └── services.js    # 服务类型路由
├── views/
│   ├── partials/      # 公共模板
│   ├── orders/        # 订单页面
│   ├── services/      # 服务页面
│   └── index.ejs      # 首页
├── server.js          # 主入口文件
├── package.json       # 项目配置
├── start.bat          # Windows启动脚本
├── start.sh           # Linux/Mac启动脚本
├── Dockerfile         # Docker配置
└── docker-compose.yml # Docker Compose配置
```
