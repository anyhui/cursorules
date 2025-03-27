# Windsurf 应用

Windsurf 是一个基于 Next.js 的现代化 Web 应用。

## 功能特性

- 现代化的用户界面
- 响应式设计
- 服务端渲染
- API 路由
- 数据持久化

## 技术栈

- Next.js 15.1.4
- React 19
- Tailwind CSS
- Radix UI
- Supabase
- Upstash Redis

## 开发环境设置

### 环境变量

复制 `.env.example` 到 `.env.local` 并填写必要的环境变量：

```bash
cp .env.example .env.local
```

### 安装依赖

```bash
pnpm install
```

### 开发服务器

```bash
pnpm dev
```

应用将在 http://localhost:3001 启动

### 构建

```bash
pnpm build
pnpm start
```

## 项目结构

```
src/
├── app/          # 应用路由和页面
├── components/   # React 组件
├── lib/          # 工具函数和配置
├── styles/       # 全局样式
└── types/        # TypeScript 类型定义
```

## API 文档

### 认证 API

- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/user`

### 数据 API

- GET `/api/data`
- POST `/api/data`
- PUT `/api/data/:id`
- DELETE `/api/data/:id`

## 组件使用指南

### 布局组件

```tsx
import { Layout } from '@/components/layout'

export default function Page() {
  return (
    <Layout>
      <h1>内容</h1>
    </Layout>
  )
}
```

### 数据获取

```tsx
import { getData } from '@/lib/data'

// 在服务端组件中
const data = await getData()
```

## 测试

```bash
# 运行单元测试
pnpm test

# 运行 E2E 测试
pnpm test:e2e
```

## 部署

应用支持以下部署平台：

- Vercel
- AWS
- Docker

### Vercel 部署

1. 连接 GitHub 仓库
2. 配置环境变量
3. 部署

## 故障排除

常见问题及解决方案：

1. 环境变量未设置
2. 数据库连接问题
3. 构建错误

## 更新日志

请参考 [CHANGELOG.md](./CHANGELOG.md) 