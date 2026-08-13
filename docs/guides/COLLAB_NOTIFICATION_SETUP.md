# 协作通知接入说明（飞书 / 企业微信）

本仓库通过 `.github/workflows/notify-collaboration.yml` 对关键协作事件进行消息推送。

## 1) 支持事件

- PR 创建（`pull_request: opened/reopened`）
- PR 合并（`pull_request: closed + merged`）
- CI 失败（`workflow_run: CI/CD Pipeline`）
- 里程碑延期（每 30 分钟扫描一次 open milestones）

## 2) 消息字段

通知消息包含：

- 仓库名
- 分支信息
- 责任人/触发人
- 阻塞环节（CI 场景）
- 直接定位链接（PR/Workflow/Milestone URL）

## 3) 仓库密钥配置

在 **Repository Settings -> Secrets and variables -> Actions -> Secrets** 中配置：

- `FEISHU_WEBHOOK_URL`（可选）
- `WECOM_WEBHOOK_URL`（可选）

> 两者至少配置一个；若都未配置，工作流仅输出 warning，不会失败。

## 4) 飞书机器人示例

1. 在飞书群创建自定义机器人。
2. 获取 Webhook URL（形如 `https://open.feishu.cn/open-apis/bot/v2/hook/...`）。
3. 保存到 `FEISHU_WEBHOOK_URL`。

## 5) 企业微信机器人示例

1. 在企业微信群创建机器人。
2. 获取 Webhook URL（形如 `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...`）。
3. 保存到 `WECOM_WEBHOOK_URL`。

## 6) 验证方式

- 手动触发 `workflow_dispatch`，检查是否能收到通知。
- 创建测试 PR、触发一次 CI 失败，验证消息结构与到达时延。
