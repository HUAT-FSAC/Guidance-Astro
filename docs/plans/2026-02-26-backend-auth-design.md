# 后端用户认证 & 权限系统设计

> 日期：2026-02-26
> 状态：已批准

## 概述

为 HUAT FSAC 文档站添加后端能力，基于 Cloudflare 全家桶（Workers + D1 + KV）实现用户认证和权限控制系统。

## 目标

1. 混合登录：账号密码 + GitHub OAuth + QQ 互联
2. 文档访问控制：内部技术文档需登录且角色达标才能查看
3. 管理后台：用户管理、成员管理面板

## 架构

```
Astro (hybrid mode) + @astrojs/cloudflare adapter
├── 静态页面（默认）：文档、首页、招新等公开页面
├── SSR 页面：/login, /register, /profile, /admin/*
├── API Routes：/api/auth/*, /api/admin/*
└── Middleware：统一 auth 拦截
```

**基础设施：**

| 服务               | 用途                       |
| ------------------ | -------------------------- |
| Cloudflare Workers | SSR + API 运行时           |
| Cloudflare D1      | 用户、OAuth 关联、角色数据 |
| Cloudflare KV      | Session 存储、缓存         |
| Cloudflare R2      | 预留：文件/图片上传        |

## 角色模型

| 角色          | 权限                | 说明         |
| ------------- | ------------------- | ------------ |
| `visitor`     | 公开页面            | 未登录用户   |
| `user`        | 公开 + 部分受限文档 | 外部注册用户 |
| `member`      | 公开 + 全部内部文档 | 车队成员     |
| `admin`       | 全部 + 管理后台     | 队长/部长    |
| `super_admin` | 全部 + 用户管理     | 超级管理员   |

## 数据库设计（D1）

```sql
-- 用户表
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user',
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

-- OAuth 关联表
CREATE TABLE oauth_accounts (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  provider      TEXT NOT NULL,
  provider_id   TEXT NOT NULL,
  access_token  TEXT,
  UNIQUE(provider, provider_id)
);

-- Session 表（备选，主要用 KV）
CREATE TABLE sessions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  expires_at    INTEGER NOT NULL
);
```

## 认证流程

**账号密码：**
用户提交 → POST /api/auth/login → bcryptjs 验证 → 创建 session → KV 写入 → Set-Cookie → 返回

**GitHub OAuth：**
点击登录 → 跳转 GitHub 授权 → 回调 /api/auth/callback/github → 查找/创建用户 → 关联 oauth_accounts → 创建 session → 跳转首页

**QQ 互联：**
点击登录 → 跳转 QQ 授权 → 回调 /api/auth/callback/qq → 查找/创建用户 → 关联 oauth_accounts → 创建 session → 跳转首页

**Session 管理：**

- Token 存 KV，key = token，value = `{userId, role, expiresAt}`
- Cookie: `HttpOnly`, `Secure`, `SameSite=Lax`
- 默认 7 天过期

## 权限控制（Middleware）

```
请求 → middleware.ts
  ├─ 公开路由（/, /docs/公开文档, /join, /about-fs）→ 放行
  ├─ Auth 路由（/login, /register, /api/auth/*）→ 放行
  ├─ 受限文档（/docs/docs-center/*, /docs/archive/*）
  │   └─ cookie → KV 查 session → role ≥ member → 放行/403
  ├─ 管理后台（/admin/*）
  │   └─ cookie → KV 查 session → role ≥ admin → 放行/403
  └─ API（/api/*，除 auth）
      └─ cookie → KV 查 session → 注入 user 到 locals → 放行/401
```

**文档权限标记：** MDX frontmatter 加 `access` 字段

```mdx
---
title: 2025 感知组技术文档
access: member # 'public' | 'user' | 'member' | 'admin'
---
```

未登录访问受限页面 → 重定向 `/login?redirect=/原始路径`

## 管理后台路由

```
/admin/          → 仪表盘概览
/admin/users     → 用户管理（列表、改角色、禁用）
/admin/members   → 成员管理（赛季数据，替代手改 JSON）
/admin/content   → 内容管理（未来扩展）
```

## 安全措施

- **密码**：bcryptjs，salt rounds = 10，最低 8 位
- **CSRF**：API 校验 Origin / Referer header
- **XSS**：HttpOnly Cookie + CSP（已有 security.ts）
- **暴力破解**：Cloudflare Rate Limiting
- **SQL 注入**：D1 全部 prepared statement

## 技术选型

- 前端页面：纯 Astro 组件 + vanilla JS，不引入 React/Vue
- 密码哈希：bcryptjs（纯 JS，兼容 Workers）
- UUID：crypto.randomUUID()（Workers 原生支持）

## 环境变量

```
SESSION_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
QQ_APP_ID
QQ_APP_KEY
```

## 文件结构变更

```
新增/修改：
  astro.config.mjs          # 改：hybrid mode + cloudflare adapter
  wrangler.toml              # 新增：D1/KV 绑定配置
  src/middleware.ts           # 新增：auth 中间件
  src/pages/login.astro      # 新增
  src/pages/register.astro   # 新增
  src/pages/profile.astro    # 新增
  src/pages/admin/index.astro
  src/pages/admin/users.astro
  src/pages/admin/members.astro
  src/pages/api/auth/login.ts
  src/pages/api/auth/register.ts
  src/pages/api/auth/logout.ts
  src/pages/api/auth/me.ts
  src/pages/api/auth/callback/github.ts
  src/pages/api/auth/callback/qq.ts
  src/lib/auth.ts            # 新增：auth 工具函数
  src/lib/db.ts              # 新增：D1 操作封装
  src/lib/session.ts         # 新增：session 管理
  src/db/schema.sql          # 新增：建表语句
```

## 实施优先级

1. **Phase 1**：基础设施（hybrid mode、D1/KV 配置、middleware 骨架）
2. **Phase 2**：账号密码注册/登录 + session 管理
3. **Phase 3**：GitHub OAuth
4. **Phase 4**：QQ 互联
5. **Phase 5**：文档权限控制（frontmatter access 字段 + middleware 拦截）
6. **Phase 6**：管理后台（用户管理、成员管理）
