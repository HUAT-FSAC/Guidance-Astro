# 推送通知现状

## 当前状态

本站目前没有业务 Web Push 推送实现：没有推送订阅与发送接口，也没有对应的用户设置或管理员发送页面。无需申请、生成或配置 VAPID 密钥。

已有的 PWA、Service Worker 缓存和离线页面不等于远程推送订阅与发送能力；不能通过配置密钥启用尚不存在的业务功能。本文件仅说明当前状态，不提供推送上线或验证步骤。

## 开发配置

日常开发不需要环境变量。仅在需要启用 Umami 分析时配置可选的 `UMAMI_WEBSITE_ID`，参见 [`.dev.vars.example`](../../.dev.vars.example) 与 [README 环境变量说明](../../README.md#环境变量)。

Cloudflare 适配器使用的框架 `SESSION` KV binding 与业务推送、业务 OAuth 无关；本次配置清理不改变框架会话或 `ASSETS` binding。部署使用的 Wrangler OAuth 登录也不是站点业务登录。

## 相关文档

- [项目文档索引](../README.md)
- [部署与回滚](../DEPLOYMENT.md)
- [开发流程与质量门禁](../WORKFLOW.md)
