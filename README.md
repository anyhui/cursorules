# Directories Monorepo

这是一个基于 TypeScript 的 Monorepo 项目，包含多个应用和共享包。

## 项目结构

```
directories/
├── apps/
│   ├── windsurf/    # Windsurf 应用
│   └── cursor/      # Cursor 应用
├── packages/
│   ├── kv/          # 键值存储包
│   └── data/        # 数据处理包
└── scripts/         # 项目脚本
```

## 技术栈

- 语言：TypeScript
- 框架：Next.js
- 样式：Tailwind CSS
- 组件：Radix UI
- 代码质量：Biome
- 包管理：pnpm
- 数据库：Supabase
- 缓存：Upstash Redis

## 开始使用

### 前置要求

- Node.js >= 18
- pnpm >= 8.0.0

### 安装

```bash
# 安装 pnpm（如果未安装）
corepack enable
corepack prepare pnpm@latest --activate

# 安装依赖
pnpm install
```

### 开发

```bash
# 启动所有应用
pnpm dev

# 启动特定应用
pnpm --filter @directories/windsurf dev
pnpm --filter @directories/cursor dev
```

### 构建

```bash
# 构建所有项目
pnpm build

# 构建特定项目
pnpm --filter @directories/windsurf build
```

## 开发规范

### 代码风格

- 使用 Biome 进行代码格式化和 lint
- 遵循 TypeScript 严格模式
- 使用函数式编程范式
- 保持代码简洁和可测试性

### Git 提交规范

提交信息格式：
```
<type>(<scope>): <subject>

<body>
```

类型（type）：
- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

### 分支管理

- main: 主分支，保护分支
- develop: 开发分支
- feature/*: 功能分支
- bugfix/*: 修复分支
- release/*: 发布分支

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### Pull Request 规范

- 标题清晰描述变更
- 详细描述变更内容
- 确保所有测试通过
- 确保代码符合规范
- 更新相关文档

## 许可证

MIT

## 维护者

[维护者信息]

![hero](image.png)

# How to Contribute to Directories

### This guide will help you understand how to add new rules or prompts to the both Cursor and Windsurf Directories.

#### 1. Fork the Repo

#### 2. Adding a New Rule

If you want to submit a **new rule** that does not already exist in the Directories, follow these steps:

1. **Locate the Rule Index**:  

   Add your new rule in the `packages/data/rules/index.ts` file. For example:
   
   ```typescript
   import { cRules } from "./rules/c";

2. **Create a Rule File**:
    
    Create a new file in the `packages/data/rules/` directory with the appropriate name. For example, if you're adding a rule for Next.js, name the file `nextjs.ts`.

3. **Define the Rule**:
   
    Add your prompts inside the newly created file. Refer to the existing rules for formatting guidance.  Make sure your prompts are accurate, clear, and helpful to developers.

    Your prompts should:
      - Be accurate and related to the rule.
      - Be clearly worded to help developers understand and use them easily.
      - Be actionable, providing steps or insights to solve common problems or optimize workflows.
      - Test your prompts: Before submitting, ensure that your prompts have been tested and work as expected in the relevant development environment. This ensures that other developers can rely your contributions :) .

#### 3. Adding New Prompts/Content to Existing Rules

If you want to add new prompts to an existing rule, follow these steps:

1. **Find the Existing Rule**:

    Navigate to the `packages/data/rules/` directory and open the relevant file for the rule you want to update. For example, if you're adding prompts for **Next.js**, open `nextjs.ts`.

2. **Add Your New Prompts**:

    Add your new prompts below the existing ones. Ensure that your additions are tested.

#### 4. Important Parameters in Rule Files

  When creating or updating rules, be sure to include the following parameters for consistency and clarity:

  1. **tags**: Add language-specific tags to categorize the rule.

      ```
      tags: ["JavaScript", "Next.js"]

  2. **title**: Provide an appropriate title that describes the rule.

      ```
        title: "Next.js Best Practices"

  3. **slug**: Create a unique slug that reflects the purpose of the rule.

      ```
        slug: "nextjs-best-practices"

  4. **content**: Write the content of your prompt here. Make sure it is clear, actionable, and helpful to developers. Be concise, but provide enough detail to assist cursor ai in completing tasks effectively...

      ```
        content: `your amazing prompt`

  5. **author**: Include details about yourself as the contributor. This helps others recognize your contributions and allows them to reach out if needed.

  
     - **name**: Your full name or GitHub username.
     - **URL**: A link to your GitHub, Twitter, website, or any other profile you want to share. This is optional but recommended.
     - **avatar**: The URL path to an image or avatar that represents you. You can use a photo from a service like Gravatar or any image hosting service.

### 5. Create a PR


## Getting Started

First, run the development server:

```bash
npm install

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.