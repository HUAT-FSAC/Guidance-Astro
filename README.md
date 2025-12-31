# Guidance - Astro

基于 Astro 的 starlight 模版构建的教程站点。


Page was deployed @ Cloudflare Pages on behalf of @nekorectifier  
You may access umami analytics data [here](https://cloud.umami.is/share/ADsMBsz2WVJPbqjO)

---

## 🛠️ 开发与构建常见问题 (FAQ)

### 1. MDX 编写规范
*   **特殊字符转义**：内容中（特别是表格里）如果包含 `<` (小于号)，必须转义，否则会被误判为组件。
    *   ❌ 错误：`| <1A |`
    *   ✅ 正确：`| \<1A |` 或 ``| `<1A` |``
*   **Aside 组件类型**：Starlight 的 Aside 组件不支持 `warning` 类型。
    *   ❌ 错误：`<Aside type="warning">`
    *   ✅ 正确：`<Aside type="caution">` (可选值: `note`, `tip`, `caution`, `danger`)

### 2. 依赖与构建 (pnpm)
*   **Lock 文件管理**：
    *   **删除** `package-lock.json` (避免与 pnpm 冲突)。
    *   **保留并提交** `pnpm-lock.yaml`。如果在 Codespaces 中该文件发生变更（为了适配 Linux 环境），**请务必提交**，这能确保 Cloudflare 构建成功。
*   **关键配置保留**：
    *   `pnpm-workspace.yaml` 中的 `onlyBuiltDependencies` (esbuild, sharp) 是构建脚本白名单，**严禁删除**，否则无法构建。