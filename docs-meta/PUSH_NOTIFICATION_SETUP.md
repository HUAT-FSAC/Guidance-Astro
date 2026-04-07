# 推送通知配置指南

## 📋 概述

本指南说明如何配置推送通知功能的 VAPID 密钥。

## 🔑 什么是 VAPID？

**VAPID**（Voluntary Application Server Identification）是 Web Push 协议的身份验证机制：

- **公钥**: 给浏览器使用，用于订阅推送
- **私钥**: 给服务器使用，用于发送推送（必须保密！）

## 🚀 配置步骤

### 1. 生成 VAPID 密钥对

在项目根目录运行：

```bash
npx web-push generate-vapid-keys
```

输出示例：

```
=======================================

Public Key:
BBswcXP___CeM5OQHfZIp7a4PNdfj8Vr7x8F9x...

Private Key:
GPH7p___YGpXh0l7kDzBcN...

=======================================
```

⚠️ **重要**:

- 妥善保存这两个密钥
- 私钥绝对不能泄露！
- 生产环境建议使用不同的密钥

### 2. 配置环境变量

#### 开发环境

创建 `.dev.vars` 文件：

```bash
# .dev.vars
VAPID_PUBLIC_KEY=你的公钥
VAPID_PRIVATE_KEY=你的私钥
```

#### Cloudflare Workers 生产环境

```bash
# 使用 wrangler 设置密钥
wrangler secret put VAPID_PUBLIC_KEY
wrangler secret put VAPID_PRIVATE_KEY
```

或者在 `wrangler.toml` 中配置：

```toml
[vars]
VAPID_PUBLIC_KEY = "你的公钥"

# 私钥使用 secret（更安全）
# wrangler secret put VAPID_PRIVATE_KEY
```

### 3. 更新 .dev.vars.example

为了让其他开发者知道需要配置什么，更新示例文件：

```bash
# .dev.vars.example
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

## ✅ 验证配置

1. 重启开发服务器：

    ```bash
    pnpm dev
    ```

2. 访问个人资料页面 `/profile/`

3. 点击"开启推送通知"

4. 如果弹出权限请求且能成功订阅，说明配置正确！

## 🔧 常见问题

### Q: 为什么需要 VAPID？

A: 这是浏览器安全要求。没有 VAPID，浏览器无法验证推送来源，会拒绝订阅。

### Q: 密钥泄露了怎么办？

A: 立即重新生成新的密钥对并更新配置。旧密钥会被浏览器拒绝。

### Q: 不同环境需要不同的密钥吗？

A: 建议不同环境使用不同密钥，这样更安全，也便于管理。

### Q: 推送通知支持哪些浏览器？

A: 主流浏览器都支持：

- ✅ Chrome / Edge（桌面和移动）
- ✅ Firefox（桌面和移动）
- ✅ Safari（macOS Ventura+ 和 iOS 16.4+）
- ❌ 部分国内浏览器（如微信内置浏览器）

## 📁 相关文件

| 文件                                       | 说明           |
| ------------------------------------------ | -------------- |
| `src/pages/api/notifications/vapid-key.ts` | 提供公钥给前端 |
| `src/pages/api/notifications/subscribe.ts` | 处理订阅       |
| `src/pages/api/notifications/send.ts`      | 发送推送       |
| `src/utils/push-notifications.ts`          | 前端推送工具   |
| `src/pages/profile.astro`                  | 用户推送设置   |
| `src/pages/admin/notifications.astro`      | 管理员发送页面 |
