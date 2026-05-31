## 1. 架构设计

```mermaid
graph TB
    subgraph "前端层"
        A[SolidJS 前端应用] --> B[Solid Router]
        A --> C[TailwindCSS]
        A --> D[小程序JS-SDK]
    end
    subgraph "后端层"
        E[Django REST API] --> F[Django ViewSet]
        E --> G[认证中间件]
        E --> H[推荐引擎]
    end
    subgraph "数据层"
        I[SQLite 数据库] --> J[ORM Models]
        K[Redis 缓存] --> L[会话/推荐缓存]
    end
    A -->|HTTP/REST| E
    F --> J
    H --> K
    G --> K
```

## 2. 技术说明
- 前端：SolidJS + Solid Router + TailwindCSS + Vite
- 后端：Django 5.x + Django REST Framework + SQLite
- 缓存：Redis（Docker镜像，用于会话缓存和推荐结果缓存）
- 数据库：SQLite（文件型数据库，零配置）
- 认证：JWT Token（SimpleJWT）
- 推荐算法：基于用户行为的协同过滤 + 内容推荐混合策略

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| / | 首页，推荐商品与活动展示 |
| /products | 文创品商城，分类浏览 |
| /products/:id | 商品详情页 |
| /customize/:id | 文创品定制页 |
| /customize/:id/preview | 定制预览确认 |
| /member | 会员中心 |
| /member/points | 积分商城 |
| /member/tasks | 专属任务 |
| /campaigns | 私域活动列表 |
| /campaigns/group-buy | 拼团活动 |
| /campaigns/share | 裂变分享 |
| /cart | 购物车 |
| /orders | 订单列表 |
| /orders/:id | 订单详情 |
| /admin | 管理后台 |
| /login | 登录页 |
| /register | 注册页 |

## 4. API定义

### 4.1 认证API
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/auth/register/ | POST | 用户注册 |
| /api/auth/login/ | POST | 用户登录，返回JWT |
| /api/auth/refresh/ | POST | 刷新Token |
| /api/auth/profile/ | GET | 获取用户信息 |

### 4.2 商品API
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/products/ | GET | 商品列表，支持分页、筛选 |
| /api/products/:id/ | GET | 商品详情 |
| /api/products/:id/customize/ | GET | 获取定制模板和参数 |
| /api/categories/ | GET | 商品分类列表 |

### 4.3 定制API
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/customize/preview/ | POST | 提交定制参数，返回预览 |
| /api/customize/submit/ | POST | 提交定制订单 |

### 4.4 会员API
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/member/profile/ | GET | 会员信息（等级/积分/权益） |
| /api/member/checkin/ | POST | 每日签到 |
| /api/member/tasks/ | GET | 任务列表 |
| /api/member/tasks/:id/complete/ | POST | 完成任务 |
| /api/member/points/exchange/ | POST | 积分兑换 |

### 4.5 私域运营API
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/campaigns/ | GET | 活动列表 |
| /api/coupons/ | GET | 可领取优惠券 |
| /api/coupons/:id/claim/ | POST | 领取优惠券 |
| /api/group-buy/ | GET | 拼团活动列表 |
| /api/group-buy/:id/join/ | POST | 参与拼团 |
| /api/share/generate/ | POST | 生成分享海报 |
| /api/share/track/ | POST | 分享追踪 |

### 4.6 推荐API
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/recommendations/ | GET | 个性化推荐商品 |
| /api/recommendations/similar/:id/ | GET | 相似商品推荐 |

### 4.7 订单API
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/cart/ | GET/POST | 购物车操作 |
| /api/cart/:id/ | PUT/DELETE | 购物车项操作 |
| /api/orders/ | GET/POST | 订单列表/创建 |
| /api/orders/:id/ | GET | 订单详情 |

### 4.8 管理后台API
| 接口 | 方法 | 说明 |
|------|------|------|
| /api/admin/dashboard/ | GET | 数据看板 |
| /api/admin/products/ | CRUD | 商品管理 |
| /api/admin/members/ | GET | 会员分析 |
| /api/admin/orders/ | GET | 订单管理 |

## 5. 服务架构图

```mermaid
graph LR
    subgraph "Controller层"
        A1[ProductViewSet]
        A2[MemberViewSet]
        A3[OrderViewSet]
        A4[CampaignViewSet]
        A5[RecommendationViewSet]
    end
    subgraph "Service层"
        B1[ProductService]
        B2[MemberService]
        B3[OrderService]
        B4[CampaignService]
        B5[RecommendationService]
    end
    subgraph "Repository层"
        C1[ProductRepository]
        C2[MemberRepository]
        C3[OrderRepository]
        C4[CampaignRepository]
    end
    subgraph "数据层"
        D1[(SQLite)]
    end
    A1 --> B1 --> C1 --> D1
    A2 --> B2 --> C2 --> D1
    A3 --> B3 --> C3 --> D1
    A4 --> B4 --> C4 --> D1
    A5 --> B5 --> C1
```

## 6. 数据模型

### 6.1 数据模型定义

```mermaid
erDiagram
    "User" {
        int id PK
        string username
        string phone
        string password
        datetime created_at
    }
    "MemberProfile" {
        int id PK
        int user_id FK
        int level
        int points
        int growth_value
        string invite_code
        int inviter_id FK
    }
    "Category" {
        int id PK
        string name
        string icon
        int parent_id FK
    }
    "Product" {
        int id PK
        string name
        string description
        decimal price
        string image
        int category_id FK
        bool is_customizable
        bool is_active
    }
    "CustomizeTemplate" {
        int id PK
        int product_id FK
        string name
        json config_schema
    }
    "CustomizeOrder" {
        int id PK
        int user_id FK
        int product_id FK
        int template_id FK
        json config_data
        string preview_url
    }
    "CartItem" {
        int id PK
        int user_id FK
        int product_id FK
        int customize_order_id FK
        int quantity
    }
    "Order" {
        int id PK
        int user_id FK
        string order_no
        decimal total_amount
        string status
        string address
        datetime created_at
    }
    "OrderItem" {
        int id PK
        int order_id FK
        int product_id FK
        int customize_order_id FK
        int quantity
        decimal price
    }
    "Coupon" {
        int id PK
        string name
        string coupon_type
        decimal discount
        int min_amount
        datetime expire_at
    }
    "UserCoupon" {
        int id PK
        int user_id FK
        int coupon_id FK
        bool is_used
    }
    "Campaign" {
        int id PK
        string title
        string campaign_type
        json rules
        datetime start_at
        datetime end_at
    }
    "GroupBuy" {
        int id PK
        int campaign_id FK
        int product_id FK
        decimal group_price
        int target_count
        int current_count
    }
    "GroupBuyParticipant" {
        int id PK
        int group_buy_id FK
        int user_id FK
        bool is_leader
    }
    "UserBehavior" {
        int id PK
        int user_id FK
        int product_id FK
        string action_type
        datetime created_at
    }
    "ShareRecord" {
        int id PK
        int user_id FK
        string share_type
        int target_id
        string code
        int click_count
        int convert_count
    }
    "CheckIn" {
        int id PK
        int user_id FK
        date check_date
        int points_earned
    }
    "MemberTask" {
        int id PK
        string name
        string task_type
        int points_reward
        int growth_reward
        json condition
    }
    "UserTask" {
        int id PK
        int user_id FK
        int task_id FK
        bool is_completed
        datetime completed_at
    }

    "User" ||--o| "MemberProfile" : "has"
    "User" ||--o{ "CartItem" : "has"
    "User" ||--o{ "Order" : "places"
    "User" ||--o{ "UserCoupon" : "owns"
    "User" ||--o{ "CheckIn" : "records"
    "User" ||--o{ "UserTask" : "completes"
    "User" ||--o{ "ShareRecord" : "creates"
    "User" ||--o{ "UserBehavior" : "generates"
    "Category" ||--o{ "Product" : "contains"
    "Category" ||--o| "Category" : "parent"
    "Product" ||--o{ "CustomizeTemplate" : "has"
    "Product" ||--o{ "CartItem" : "in"
    "Product" ||--o{ "OrderItem" : "in"
    "Product" ||--o{ "GroupBuy" : "featured"
    "Product" ||--o{ "UserBehavior" : "targeted"
    "CustomizeTemplate" ||--o{ "CustomizeOrder" : "used_by"
    "CustomizeOrder" ||--o| "CartItem" : "added_to"
    "CustomizeOrder" ||--o| "OrderItem" : "included_in"
    "Order" ||--o{ "OrderItem" : "contains"
    "Coupon" ||--o{ "UserCoupon" : "claimed"
    "Campaign" ||--o{ "GroupBuy" : "has"
    "GroupBuy" ||--o{ "GroupBuyParticipant" : "has"
    "MemberTask" ||--o{ "UserTask" : "completed"
    "MemberProfile" ||--o| "MemberProfile" : "invited_by"
```

### 6.2 数据定义语言（Django ORM自动生成，此处为逻辑参考）

所有表通过Django ORM的makemigrations/migrate自动创建，无需手写DDL。初始数据通过Django management command和fixtures自动加载，包含：
- 预设商品分类（刺绣、陶瓷、剪纸、漆器、织锦等）
- 示例商品数据（各分类3-5件）
- 定制模板配置
- 优惠券模板
- 会员任务配置
- 示例活动数据
- 管理员账号（admin/admin123）
