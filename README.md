# 逛博 APP - H5 前端

基于 Vue 3 + TypeScript + Vite 构建的博物馆聚合平台移动端应用。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4+ | 核心框架 |
| Vite | 5+ | 构建工具 |
| TypeScript | 5+ | 类型支持 |
| Vant | 4+ | 移动端 UI 组件库 |
| Pinia | 2+ | 状态管理 |
| Vue Router | 4+ | 路由管理 |
| Axios | 1+ | HTTP 客户端 |
| Sass | - | CSS 预处理 |
| Mock.js | - | 数据模拟 |

## 项目结构

```
src/
├── api/              # API 请求模块
│   ├── auth.ts       # 认证相关
│   ├── museum.ts     # 博物馆相关
│   ├── checkin.ts    # 打卡相关
│   ├── medal.ts      # 勋章相关
│   └── footprint.ts  # 足迹相关
├── assets/           # 静态资源
├── components/       # 公共组件
│   └── TabBar.vue    # 底部导航栏
├── composables/      # 组合式函数
├── layouts/          # 布局组件
├── mock/             # Mock 数据
│   ├── data/         # 数据定义
│   └── index.ts      # Mock 配置
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
│   ├── user.ts       # 用户状态
│   └── museum.ts     # 博物馆状态
├── styles/           # 全局样式
│   ├── variables.scss # 样式变量
│   ├── reset.scss    # 样式重置
│   └── index.scss    # 入口文件
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
│   └── request.ts    # Axios 封装
├── views/            # 页面组件
│   ├── home/         # 首页
│   ├── museum/       # 博物馆详情
│   ├── checkin/      # 打卡页
│   ├── medal/        # 勋章页
│   ├── user/         # 个人中心
│   └── auth/         # 登录页
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 页面列表

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 博物馆列表，支持筛选和搜索 |
| `/museum/:id` | 博物馆详情 | 博物馆信息、镇馆之宝、打卡 |
| `/checkin` | 打卡页 | 附近博物馆、GPS 打卡 |
| `/medal` | 勋章页 | 勋章列表、解锁进度 |
| `/user` | 个人中心 | 用户信息、统计数据 |
| `/user/footprint` | 我的足迹 | 足迹地图、省份统计 |
| `/user/favorites` | 我的收藏 | 收藏的博物馆列表 |
| `/login` | 登录页 | 微信登录 |
| `/search` | 搜索页 | 博物馆搜索 |

## API 接口

### 认证模块
- `POST /v1/auth/wechat-login` - 微信登录
- `POST /v1/auth/refresh-token` - 刷新 Token
- `GET /v1/users/me` - 获取当前用户信息

### 博物馆模块
- `GET /v1/museums` - 获取博物馆列表
- `GET /v1/museums/:id` - 获取博物馆详情
- `GET /v1/museums/nearby` - 获取附近博物馆

### 打卡模块
- `POST /v1/checkins` - 打卡
- `GET /v1/checkins` - 获取打卡记录

### 勋章模块
- `GET /v1/medals` - 获取勋章列表

### 足迹模块
- `GET /v1/footprint/stats` - 获取足迹统计
- `GET /v1/footprint/map` - 获取足迹地图数据

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | API 基础地址 | `/api` |
| `VITE_APP_TITLE` | 应用标题 | `逛博 - 发现身边的博物馆` |

## 开发规范

### 代码规范
- 使用 ESLint + Prettier 进行代码格式化
- 使用 TypeScript 类型检查
- 组件使用 `<script setup>` 语法

### 命名规范
- 组件名：PascalCase (如 `MuseumCard.vue`)
- 文件名：kebab-case (如 `museum-detail.vue`)
- 变量名：camelCase
- 常量名：UPPER_SNAKE_CASE

### Git 提交规范
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## License

MIT