# Learn2Earn - 任务管理与奖励系统

一个基于 Rust + React 构建的去中心化任务管理和奖励发放平台，支持通过 SUI 区块链进行代币奖励发放。

## 🚀 项目特性

- **任务管理**: 完整的任务创建、编辑、删除功能
- **提交审核**: 任务提交记录管理和审核流程
- **权限控制**: 基于角色的访问控制（管理员/普通用户）
- **区块链集成**: 支持 SUI 区块链代币奖励发放
- **现代化界面**: 基于 Material-UI 的响应式界面设计
- **JWT 认证**: 安全的用户认证和授权机制

## 📋 技术栈

### 后端
- **Rust** - 主要编程语言
- **Actix-web** - Web 框架
- **SQLx** - 数据库 ORM
- **MySQL** - 数据库
- **JWT** - 身份验证

### 前端
- **React 18** - 前端框架
- **Material-UI (MUI)** - UI 组件库
- **SUI dApp Kit** - 区块链集成
- **React Router** - 路由管理
- **Axios** - HTTP 客户端

## 🛠️ 快速开始

### 环境要求

- Node.js >= 18
- Rust >= 1.70
- MySQL >= 8.0
- Git

### 1. 克隆项目

```bash
git clone <repository-url>
cd rust_learn2earn
```

### 2. 环境配置

在项目根目录创建 `.env` 文件：

```env
DATABASE_URL=mysql://username:password@localhost:3306/learn2earn
JWT_SECRET=your-super-secret-jwt-key
RUST_LOG=debug
```

### 3. 数据库设置

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE learn2earn;"

# 运行数据库迁移
cargo run --bin migration
```

### 4. 启动后端服务

```bash
# 安装依赖并启动
cargo run
```

后端服务将在 `http://localhost:8080` 启动

### 5. 启动前端应用

```bash
cd frontend
npm install
npm run dev
```

前端应用将在 `http://localhost:5173` 启动

## 🔐 默认账户

系统提供以下测试账户：

- **管理员**: `admin` / `admin123`
- **普通用户**: `demo` / `user123`

## 📁 项目结构

```
rust_learn2earn/
├── src/                    # 后端源码
│   ├── controllers/        # 控制器层
│   ├── services/          # 业务逻辑层
│   ├── models/            # 数据模型
│   ├── routes/            # 路由配置
│   ├── middleware/        # 中间件
│   ├── database/          # 数据库配置
│   ├── config/            # 配置管理
│   └── utils/             # 工具函数
├── frontend/              # 前端源码
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── contexts/      # React Context
│   │   ├── hooks/         # 自定义 Hooks
│   │   └── services/      # API 服务
│   └── public/            # 静态资源
└── target/                # Rust 编译输出
└── sql/                   # 数据库脚本
```

## 🔧 API 文档

### 认证接口

```
POST /api/auth/login          # 用户登录
GET  /api/auth/profile    # 获取用户信息
POST /api/auth/admin/users # 创建用户（管理员）
```

### 任务管理

```
GET    /api/tasks              # 获取任务列表（分页）
GET    /api/tasks/all          # 获取所有任务
GET    /api/tasks/{id}         # 获取单个任务
POST   /api/tasks              # 创建任务
PUT    /api/tasks/{id}         # 更新任务
DELETE /api/tasks/{id}         # 删除任务
```

### 提交管理

```
GET  /api/tasks/{id}/submissions     # 获取任务提交记录
GET  /api/submissions/{id}           # 获取提交详情
POST /api/submissions/{id}/approve   # 通过提交
POST /api/submissions/{id}/reject    # 拒绝提交
```

## 🎯 主要功能

### 任务管理
- 创建、编辑、删除任务
- 任务搜索和筛选
- 分页浏览任务列表

### 提交审核
- 查看任务提交记录
- 审核提交（通过/拒绝）
- 状态筛选和管理

### 奖励发放
- SUI 区块链集成
- 钱包连接和管理
- 代币奖励自动发放

### 权限管理
- 基于角色的访问控制
- JWT Token 认证
- 细粒度权限控制

## 🔐 权限系统

### 角色类型
- **admin**: 管理员，拥有所有权限
- **user**: 普通用户，基础权限

### 权限列表
- `task:create` - 创建任务
- `task:update` - 更新任务
- `task:delete` - 删除任务
- `submission:approve` - 审核提交


### 生产环境配置

1. **数据库优化**
   - 配置连接池
   - 设置合适的索引
   - 定期备份数据

2. **安全配置**
   - 使用强 JWT 密钥
   - 配置 HTTPS
   - 设置 CORS 策略

3. **监控日志**
   - 配置日志级别
   - 设置错误监控
   - 性能指标监控

## 🛡️ 安全考虑

- JWT Token 安全存储
- API 请求频率限制
- 输入验证和 SQL 注入防护
- 敏感信息加密存储

## 📝 开发指南

### 代码规范

- Rust: 遵循 Rust 官方编码规范
- React: 使用 ESLint 和 Prettier
- 提交信息: 遵循 Conventional Commits

### 测试

```bash
# 后端测试
cargo test

# 前端测试
cd frontend && npm test
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License


## 🔄 更新日志

### v1.0.0
- 初始版本发布
- 基础任务管理功能
- SUI 区块链集成
- 用户认证和权限系统