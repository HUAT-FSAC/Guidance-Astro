# HUAT FSAC Guidance-Astro — Developer Makefile
#
# 用法:make <target>   (例:make dev, make test, make deploy)
# 列出所有 target:make help
#
# 这些 target 全部是对 pnpm 脚本的薄封装,确保 CI/本地/新人/Docker 一致。
# 任何复杂逻辑请直接放在 scripts/ 下,本文件保持"短、平、快"。

# ──────────────── 元信息 ────────────────
SHELL         := /bin/sh
.SHELLFLAGS   := -eu -c
.DEFAULT_GOAL := help
MAKEFLAGS     += --no-print-directory

# 颜色(在不支持 ANSI 时自动退化)
GREEN  := \033[32m
YELLOW := \033[33m
CYAN   := \033[36m
RESET  := \033[0m

# ──────────────── 工具检测 ────────────────
PNPM := $(shell command -v pnpm 2>/dev/null)
ifeq ($(PNPM),)
$(error ❌ pnpm not found. Install pnpm 11+ first: https://pnpm.io/installation)
endif

# ──────────────── 帮助 ────────────────
.PHONY: help
help: ## 显示本 Makefile 的所有 target 与说明
	@printf "$(CYAN)HUAT FSAC Guidance-Astro$(RESET) — 常用命令:\n\n"
	@awk 'BEGIN {FS = ":.*##"; printf "  $(GREEN)%-18s$(RESET) %s\n", "target", "description"} \
		/^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-18s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@printf "\n$(YELLOW)更多命令见 package.json 的 scripts 字段$(RESET)\n"

# ──────────────── 开发 ────────────────
.PHONY: install
install: ## 安装依赖(锁定 pnpm 11)
	@printf "$(CYAN)▶ pnpm install$(RESET)\n"
	@pnpm install --frozen-lockfile

.PHONY: dev
dev: ## 启动 Astro 开发服务器(http://localhost:4321)
	@pnpm dev

.PHONY: build
build: ## 构建生产版本(产物在 dist/)
	@pnpm build

.PHONY: preview
preview: ## 预览构建(静态)
	@pnpm preview

.PHONY: preview-ssr
preview-ssr: ## 用 Wrangler 本地跑 SSR(port 8787)
	@pnpm preview:ssr

# ──────────────── 质量门禁 ────────────────
.PHONY: lint
lint: ## ESLint 检查
	@pnpm lint

.PHONY: lint-fix
lint-fix: ## ESLint 自动修复
	@pnpm lint:fix

.PHONY: format
format: ## Prettier 格式化
	@pnpm format

.PHONY: format-check
format-check: ## Prettier 校验
	@pnpm format:check

.PHONY: typecheck
typecheck: ## TypeScript 类型检查
	@pnpm exec tsc --noEmit

.PHONY: test
test: ## 监听模式跑 Vitest
	@pnpm test

.PHONY: test-run
test-run: ## 单次跑 Vitest
	@pnpm test:run

.PHONY: test-coverage
test-coverage: ## 覆盖率报告(70/60/70/70 阈值)
	@pnpm test:coverage

.PHONY: test-e2e
test-e2e: ## Playwright 端到端
	@pnpm test:e2e

.PHONY: quality
quality: ## 跑质量门禁(bundle + theme)
	@pnpm quality:bundle
	@pnpm quality:theme

.PHONY: lighthouse
lighthouse: ## Lighthouse CI 断言
	@pnpm quality:lighthouse

# ──────────────── 组合任务 ────────────────
.PHONY: ci
ci: lint format-check typecheck test-run build ## 跑本地 CI 全套(lint + format + typecheck + test + build)
	@printf "$(GREEN)✅ CI 全套通过$(RESET)\n"

.PHONY: clean
clean: ## 清理构建产物(dist / .astro / coverage)
	@pnpm clean
	@rm -rf coverage test-results playwright-report .lighthouseci

.PHONY: reset
reset: clean install ## clean + install(依赖坏了时救场)

# ──────────────── 部署 ────────────────
.PHONY: deploy
deploy: build ## 构建并部署到 Cloudflare Workers(需 CLOUDFLARE_API_TOKEN/ACCOUNT_ID)
	@pnpm deploy:worker

.PHONY: whoami
whoami: ## 确认 wrangler 登录状态
	@pnpm exec wrangler whoami || true

# ──────────────── 安全 ────────────────
.PHONY: secret-scan
secret-scan: ## 本地 gitleaks 扫描(需先 install:https://github.com/gitleaks/gitleaks)
	@command -v gitleaks >/dev/null 2>&1 || { \
		printf "$(YELLOW)⚠️  gitleaks 未安装$(RESET)\n"; \
		printf "安装: $(CYAN)https://github.com/gitleaks/gitleaks#installing$(RESET)\n"; \
		exit 0; }
	@printf "$(CYAN)▶ 扫描 staged + working tree$(RESET)\n"
	@gitleaks protect --redact --no-banner --config .gitleaks.toml --verbose
	@printf "$(CYAN)▶ 扫描 git history$(RESET)\n"
	@gitleaks detect --no-banner --config .gitleaks.toml --verbose

.PHONY: audit
audit: ## pnpm 安全审计
	@pnpm audit --prod
