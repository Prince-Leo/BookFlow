# BookFlow - 图书馆管理系统

一个功能完善的图书馆管理系统，支持图书管理、借阅管理、用户管理等功能。

## 功能特性

### 图书管理
- ✅ 图书增删改查（CRUD）
- ✅ 图书搜索和筛选（按书名、作者、ISBN、类别、出版社等）
- ✅ 图书分类管理
- ✅ 图书库存管理
- ✅ 图书评分和评论

### 借阅管理
- ✅ 用户借书
- ✅ 用户还书
- ✅ 借阅历史记录
- ✅ 逾期提醒
- ✅ 续借功能
- ✅ 预约功能

### 用户管理
- ✅ 用户注册和登录（JWT 认证）
- ✅ 用户信息管理
- ✅ 用户权限管理（普通用户、管理员）
- ✅ 用户借阅记录

### 管理员功能
- ✅ 图书库存管理
- ✅ 用户管理和权限分配
- ✅ 借阅记录管理
- ✅ 数据统计和报表（借阅趋势、热门图书等）
- ✅ 系统日志管理

### 高级功能
- ✅ 图书推荐算法
- ✅ 个人图书馆（收藏夹）
- ✅ 借阅统计分析
- ✅ 通知系统（借阅截止日期提醒）

## 技术栈

### 后端
- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT 认证
- bcryptjs 密码加密
- 其他：helmet, cors, rate-limit 等安全中间件

### 前端
- React 18
- Ant Design 5
- Zustand 状态管理
- Axios HTTP 客户端
- Recharts 图表库

### 部署
- Docker + Docker Compose
- Nginx 反向代理

## 项目结构

```
BookFlow/
├── backend/                    # Node.js 后端服务
│   ├── src/
│   │   ├── config/            # 数据库和服务配置
│   │   ├── controllers/       # 业务逻辑控制器
│   │   ├── routes/            # API 路由
│   │   ├── models/            # 数据模型
│   │   ├── middleware/        # 中间件（认证、验证等）
│   │   ├── services/          # 业务服务层
│   │   ├── utils/             # 工具函数
│   │   └── app.js             # Express 应用入口
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   └── react-app/             # React 前端
│       ├── src/
│       │   ├── components/    # React 组件
│       │   ├── pages/         # 页面
│       │   ├── services/      # API 服务
│       │   ├── stores/        # 状态管理
│       │   └── App.jsx
│       └── package.json
│
├── docker/
│   ├── docker-compose.yml     # Docker Compose 配置
│   ├── Dockerfile.backend     # 后端 Docker 镜像
│   ├── Dockerfile.frontend    # 前端 Docker 镜像
│   ├── nginx.conf             # Nginx 配置
│   └── postgres/
│       └── init.sql           # PostgreSQL 初始化脚本
│
├── deploy.sh                  # 部署脚本
└── README.md
```

## 快速开始

### 环境要求
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+（本地开发）

### 使用 Docker 部署

1. 克隆项目
```bash
git clone <repository-url>
cd BookFlow
```

2. 配置环境变量
```bash
cp docker/.env.example docker/.env
# 编辑 docker/.env 文件，设置数据库密码和 JWT 密钥
```

3. 启动服务
```bash
cd docker
docker-compose up -d
```

4. 访问应用
- 前端：http://localhost
- 后端 API：http://localhost:3000

### 部署到云服务器

使用提供的部署脚本：

```bash
./deploy.sh
```

或者手动部署：

```bash
# 复制项目到服务器
scp -r . root@152.32.225.49:/opt/bookflow

# SSH 到服务器并启动
ssh root@152.32.225.49
cd /opt/bookflow/docker
docker-compose up -d
```

## 默认账号

- 管理员账号：admin
- 管理员邮箱：admin@bookflow.com
- 管理员密码：admin123

**注意**：生产环境请立即修改默认密码！

## API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/profile` - 更新个人信息

### 图书相关
- `GET /api/books/search` - 搜索图书
- `GET /api/books/:id` - 获取图书详情
- `POST /api/books` - 创建图书（管理员）
- `PUT /api/books/:id` - 更新图书（管理员）
- `DELETE /api/books/:id` - 删除图书（管理员）

### 借阅相关
- `POST /api/borrows` - 借书
- `POST /api/borrows/:id/return` - 还书
- `POST /api/borrows/:id/renew` - 续借
- `POST /api/borrows/reserve` - 预约图书
- `GET /api/borrows/history` - 借阅历史
- `GET /api/borrows/current` - 当前借阅

### 用户相关
- `GET /api/users` - 获取所有用户（管理员）
- `PUT /api/users/:id/status` - 更新用户状态（管理员）
- `PUT /api/users/:id/role` - 更新用户角色（管理员）

## 开发

### 本地开发

1. 启动数据库
```bash
cd docker
docker-compose up -d postgres
```

2. 启动后端
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

3. 启动前端
```bash
cd frontend/react-app
npm install
npm run dev
```

### 环境变量

#### 后端 (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookflow
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
PORT=3000
```

#### 前端 (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## 许可证

MIT License
