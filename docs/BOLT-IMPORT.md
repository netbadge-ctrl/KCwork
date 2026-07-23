# Bolt 导入说明：完全保留现有实现

## 目标

把当前 KCWork Demo 导入 Bolt，并完全保留现有实现。

这里的“完全保留”指：

- 不迁移前端架构；
- 不改目录结构；
- 不替换 Vinext/Next 外壳；
- 不重写 React 组件；
- 不重新生成页面；
- 不改变当前 Sites 线上发布链路。

## 当前技术架构

当前项目已经是 React 项目：

- React 19
- TypeScript
- Next App Router 目录结构
- Vinext + Vite 构建
- Lucide React 图标
- 原生 CSS
- Vitest + Testing Library
- Cloudflare/Sites 兼容部署

入口文件：

- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`

构建命令：

```bash
npm run build
```

本地开发命令：

```bash
npm run dev
```

## 推荐导入方式

### 方式一：导入当前 GitHub 仓库

Bolt 支持从 GitHub 导入现有仓库。当前完整实现位于：

```text
https://github.com/netbadge-ctrl/KCwork
```

当前主要工作分支：

```text
feature/unified-conversation-architecture
```

如果 Bolt 导入后默认从 `main` 打开，应在 Bolt 中切换到该分支，或使用一个镜像仓库把当前实现放在默认 `main`。

### 方式二：创建 Bolt 专用镜像仓库

如果 Bolt 无法直接选择 `feature/unified-conversation-architecture`，建议创建一个专用仓库，例如：

```text
netbadge-ctrl/KCwork-bolt
```

然后将当前提交原样推送到该仓库的 `main` 分支。

这一步只改变 GitHub 仓库承载方式，不改变任何项目代码。

## 不建议的做法

不要为了适配 Bolt 做以下操作：

- 改成纯 Vite SPA；
- 改成 React Router；
- 删除 Next 或 Vinext；
- 移除 `.openai/hosting.json`；
- 重构 `app/` 目录到 `src/`；
- 让 Bolt 根据截图重新生成一套 UI；
- 把当前 Demo 拆成多个新项目。

这些操作都会破坏“完全保留现有实现”的目标。

## Bolt Agent 指令

仓库根目录已提供：

```text
claude.md
```

Bolt Agent 应优先读取该文件，按其中规则继续修改。核心约束是：

- 保留当前架构；
- 保留三栏客户端；
- 保持 Agent 优先；
- 弱化管理感；
- 保持紧凑、精致、一致的企业工具风格。

## 导入后验证

导入 Bolt 后先执行：

```bash
npm install
npm run build
```

如果 Bolt WebContainer 无法运行 Vinext/Wrangler，不要立即迁移架构。应先把 Bolt 作为代码编辑和设计协作工具，继续使用当前 Sites 链路发布预览。

## 线上 Demo

当前线上 Demo：

```text
https://kflow-enterprise-demo-0717-a6c5e.netbadge7777.chatgpt.site/
```

Sites project ID：

```text
appgprj_6a5a097e48fc819199827ee34db9ea15
```

## 关键提醒

Lovable 当前不适合“完全保留现有实现”的要求，因为它不能从现有 GitHub 仓库创建项目。Bolt 是当前更合适的导入工具。

