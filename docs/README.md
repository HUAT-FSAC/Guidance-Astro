# 仓库文档

这里是 **Guidance-Astro 仓库自己的文档**（部署、贡献流程、计划、报告）。

车队站点上对外发布的正文在 `src/content/docs/`，不要和本目录混用。

社区与安全文件维护在 `.github/` 目录中：

| 文件                                          | 说明         |
| --------------------------------------------- | ------------ |
| [CONTRIBUTING.md](../.github/CONTRIBUTING.md) | 贡献指南     |
| [SECURITY.md](../.github/SECURITY.md)         | 安全漏洞上报 |
| [CHANGELOG.md](../CHANGELOG.md)               | 版本记录     |
| [LICENSE](../LICENSE)                         | MIT 许可证   |

## 目录

```text
docs/
├── README.md                      # 本索引
├── ARCHITECTURE.md                # 系统架构与模块全景
├── WORKFLOW.md                    # 开发流程与任务看板 SSOT
├── DEPLOYMENT.md                  # 部署与回滚
├── ROADMAP.md                     # 路线图与演进方向
├── VERSION_CONTROL_POLICY.md      # 分支与发布
├── PROJECT_MANAGEMENT_MODEL.md    # 项目管理模型
├── TODOLIST.md                    # 历史任务清单
├── adr/                           # 架构决策记录
├── guides/                        # 操作指南
├── plans/                         # 功能计划与设计（历史归档见 archive/）
├── reports/                       # 实施 / 完成 / 归档报告
└── components/                    # 组件说明
```

## 常用入口

- [部署说明](./DEPLOYMENT.md)
- [分支与发布策略](./VERSION_CONTROL_POLICY.md)
- [文档编写规范](./guides/document-management.md)
- [技术报告索引](./reports/README.md)
- [ADR 模板](./adr/000-template.md)

`openwiki/` 由定时工作流生成，请不要手改；改源码和本目录即可。
