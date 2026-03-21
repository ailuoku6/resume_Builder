# resume_Builder

基于 `Vite + React + TypeScript + kisstate` 的简历生成器。

## 启动方式

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## Cloudflare 后端

项目现在带有一套基于 `Cloudflare Pages Functions + Hono + D1` 的草稿后端：

- API 入口：`functions/api/[[routes]].ts`
- 后端路由：`lib/hono/index.ts`
- D1 建表脚本：`migrations/0001_resume_drafts.sql`、`migrations/0002_users_and_secure_drafts.sql`
- Cloudflare 配置：`wrangler.toml`

首次使用前需要把 `wrangler.toml` 里的 D1 `database_id / preview_database_id` 换成你自己的值，然后执行本地迁移：

```bash
npm install
npm run db:migrate:local
```

认证和加密还需要再配置两个 Cloudflare Secret：

```bash
wrangler secret put AUTH_JWT_SECRET
wrangler secret put RESUME_ENCRYPTION_SECRET
```

- `AUTH_JWT_SECRET`：用于签发登录 JWT
- `RESUME_ENCRYPTION_SECRET`：用于将简历内容加密后再写入 D1

现在云端能力包含：

- 邮箱注册 / 登录
- 按用户隔离的简历草稿
- D1 中仅保存加密后的简历 payload
- 前端“我的草稿”抽屉按当前登录用户展示

如果要用 Cloudflare 本地预览静态页 + Functions：

```bash
npm run build
npm run preview:cloudflare
```

前端顶部的“保存草稿”现在会先写入本地 `localStorage`，再尝试同步到 Cloudflare D1；成功后地址栏会自动带上 `?draft=...`，便于后续直接打开同一份云端草稿。

## 架构分层

```text
src
├─ app                       # 入口与全局样式
├─ entities/resume/model     # 核心类型与 kisstate store
├─ features/resume-builder   # 编辑器模块
├─ features/resume-preview   # PDF 预览模块
└─ shared                    # 通用工具与类型声明
```

## 关键设计

- `ResumeStore` 使用 `@ObservableClass` 管理简历状态。
- 组件使用 `observer` 自动订阅状态变更。
- `localStorage` 支持新旧 key 兼容（`resume-builder:data:v2` / `data`）。
- 编辑态与预览态解耦，便于后续扩展模板和导出能力。
