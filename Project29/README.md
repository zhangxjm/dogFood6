# 非遗数字藏品合规发行平台

基于 Node.js NestJS 与 Vue3 构建的非遗数字藏品发行平台，实现藏品铸造、版权确权、二级市场交易等功能。

## 技术栈

### 后端
- **框架**: NestJS 10.x
- **数据库**: SQLite (TypeORM)
- **区块链**: 模拟实现 (含 PoW 共识机制)
- **搜索引擎**: Elasticsearch 8.x
- **认证**: JWT + Passport
- **加密**: bcrypt

### 前端
- **框架**: Vue 3.x (Composition API)
- **路由**: Vue Router 4.x
- **状态管理**: Pinia
- **UI 组件**: Element Plus
- **HTTP 客户端**: Axios

### 基础设施
- **容器化**: Docker + Docker Compose
- **Web 服务器**: Nginx (前端)

## 功能特性

### 1. 藏品铸造
- 基于非遗系列铸造数字藏品
- 区块链存证确保唯一性
- 自定义藏品名称和描述
- 设置铸造价格

### 2. 版权确权
- 版权登记申请
- 区块链存证证明
- 版权信息查询验证
- 登记证书生成

### 3. 二级市场交易
- 藏品挂牌出售
- 买家购买藏品
- 交易记录追踪
- 资金结算自动完成

### 4. 智能检索
- Elasticsearch 全文检索
- 多维度筛选（分类、地区、非遗类型）
- 模糊匹配支持

### 5. 用户系统
- 用户注册/登录
- 个人资产管理
- 交易历史查看
- 账户余额管理

## 快速开始

### 环境要求
- Docker Desktop (Windows/Mac) 或 Docker Engine + Docker Compose (Linux)
- 至少 4GB 可用内存
- 至少 10GB 可用磁盘空间

### 启动方式

#### Windows 系统
```bat
start.bat
```

#### Linux/Mac 系统
```bash
chmod +x start.sh
./start.sh
```

#### 手动启动
```bash
# 创建数据目录
mkdir -p backend/data

# 启动所有服务
docker-compose up -d --build
```

### 访问地址

启动成功后，可通过以下地址访问：

- **前端页面**: http://localhost:8080
- **后端 API**: http://localhost:3000
- **Elasticsearch**: http://localhost:9200

### 测试账号

平台启动后会自动初始化测试数据，可使用以下账号登录：

| 用户名 | 密码 | 角色 | 初始余额 |
|--------|------|------|----------|
| admin | 123456 | 管理员 | ¥100,000 |
| 收藏家 | 123456 | 普通用户 | ¥50,000 |
| 艺术爱好者 | 123456 | 普通用户 | ¥30,000 |

## 项目结构

```
Project29/
├── backend/                    # 后端项目
│   ├── src/
│   │   ├── auth/              # 认证模块
│   │   ├── nft/               # NFT 模块
│   │   ├── collection/        # 藏品系列模块
│   │   ├── transaction/       # 交易模块
│   │   ├── copyright/         # 版权模块
│   │   ├── entities/          # 数据库实体
│   │   ├── services/          # 公共服务
│   │   │   ├── blockchain.service.ts    # 区块链服务
│   │   │   └── elasticsearch.service.ts # ES 服务
│   │   ├── app.module.ts      # 应用模块
│   │   ├── main.ts            # 入口文件
│   │   └── seed.service.ts    # 数据初始化
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── views/             # 页面组件
│   │   ├── stores/            # 状态管理
│   │   ├── router/            # 路由配置
│   │   ├── utils/             # 工具函数
│   │   ├── App.vue
│   │   └── main.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml         # Docker 编排
├── start.bat                  # Windows 启动脚本
├── start.sh                   # Linux/Mac 启动脚本
└── README.md
```

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### NFT 接口
- `POST /api/nfts/mint` - 铸造 NFT
- `GET /api/nfts` - 获取 NFT 列表
- `GET /api/nfts/:id` - 获取 NFT 详情
- `GET /api/nfts/search` - 搜索 NFT
- `GET /api/nfts/my` - 获取我的 NFT
- `PUT /api/nfts/:id/price` - 设置价格
- `GET /api/nfts/stats` - 获取统计数据

### 藏品系列接口
- `GET /api/collections` - 获取系列列表
- `GET /api/collections/:id` - 获取系列详情
- `GET /api/collections/categories` - 获取分类列表

### 交易接口
- `POST /api/transactions/buy` - 购买 NFT
- `GET /api/transactions` - 获取交易列表
- `GET /api/transactions/my` - 获取我的交易

### 版权接口
- `POST /api/copyrights/register` - 版权登记
- `GET /api/copyrights` - 获取版权列表
- `GET /api/copyrights/verify/:number` - 验证版权

## 区块链实现说明

平台内置了一个简化的区块链实现，具有以下特性：

- **区块结构**: 包含索引、时间戳、交易列表、前一区块哈希、当前哈希、随机数
- **共识机制**: PoW (工作量证明)，难度为 4 个前导零
- **交易类型**: MINT (铸造)、TRANSFER (转账)、COPYRIGHT_REGISTER (版权登记)
- **哈希算法**: SHA-256

## 数据初始化

平台首次启动时会自动执行数据初始化：

1. 创建 3 个测试用户
2. 创建 6 个非遗系列（景德镇青花瓷、苏绣精品、宣纸制作、京剧脸谱、川江号子、东阳木雕）
3. 为每个系列铸造 2-4 个 NFT 藏品
4. 所有数据自动上链存证

## 注意事项

1. **生产环境**: 本项目的区块链实现为模拟版本，生产环境建议对接真实的区块链网络（如以太坊、BSC 等）
2. **Elasticsearch**: 若 ES 服务不可用，平台会自动降级使用数据库模糊查询
3. **数据持久化**: SQLite 数据库文件存储在 `backend/data/` 目录，Elasticsearch 数据使用 Docker 卷持久化
4. **端口占用**: 确保 3000、8080、9200、9300 端口未被占用

## 许可证

MIT License
