# PRD 文档化与右侧发送框对齐主 Composer — 设计

## 背景

当前 PRD 预览在两处入口呈现得很弱：

- `ProductPrdPanel`（产品设计 Agent 的 PRD 工作台，`app/components/product-panels.tsx:145`）渲染 `state.prdBody`，但 `prdBody` 只有 3 段单句（`## 1.背景与目标` + 一句话），读起来是稀疏占位，不像文档。
- `PrdPreview`（从项目资产入口打开 PRD 时，`app/components/preview-drawer.tsx:589`）是写死的 3 段卡片。
- 与之对照，`PdfPreview`（`app/components/preview-drawer.tsx:558`）已经是 A4 文档样式（白页、阴影、标题/元信息/章节），说明"文档"美学在代码库里已存在。

右侧"发送到主对话"框 `ScopedArtifactComposer`（`app/components/product-panels.tsx:160`）的视觉与主底栏 `Composer`（`app/components/composer.tsx`）不一致：紫色卡片头、`em` 标签、textarea 内嵌发送键，与主 Composer 的中性底/工具栏/圆角发送键不同。

本设计目标：(1) 把 PRD 预览统一成整页文档，对齐 PDF 样式；(2) 把右侧发送框视觉对齐主 Composer，保留"精准引用"功能。范围限定于样式与展示，不改产品交互模型。

## 目标

1. PRD 在两个入口（产品设计 PRD 工作台、项目资产 PRD 预览）用同一套整页文档渲染。
2. 文档正文真实、可读、有完整章节内容（确定性 Demo 的丰富种子数据）。
3. 右侧发送框复用主 Composer 的视觉语言，保留"精准引用到主对话、不创建新会话"的行为。

## 非目标

- 不改变 `prdBody` 的数据模型或版本/修订 reducer 逻辑。
- 不重构 `Composer` 组件本身（不抽共享 primitive）。
- 不改包脚本、构建工具、框架依赖。
- 不动产品交互模型（左侧导航/中间对话/右侧面板的布局不变）。

## 设计

### 1. PRD 整页文档

**新增共享组件** `app/components/prd-document-sheet.tsx`，导出 `PrdDocumentSheet({ title, meta, body, acceptance?, editable?, onChange? })`：

- 渲染单个可滚动白页，复用现有 `.pdf-sheet` 美学：`background:#fff`、`box-shadow`、`padding:38px 34px`、`h1 23px`/`h2 14px`/`p line-height 1.7`、页脚页码。
- 正文按 markdown-ish 解析 `body`：`## ` 行 → 章节标题（带可锚点 id）；连续非空非标题行 → 段落；空行分段；以 `✓ ` 开头的行 → `.check-line`（验收项，复用现有样式）。`createInitialProductPackage` 的 `prdBody` 末尾以 `## 6. 验收标准` + 若干 `✓ ` 行收尾，靠前缀区分、不依赖"末尾位置"推断。
- `editable` 为真时切换为 `prdBody` 的 textarea 编辑视图（保留现有"直接编辑"能力），`onChange` 回写。
- 文档头一条紧凑的章节锚点条（替代被移除的左侧目录），点击滚动到对应 `## `。

**扩充种子内容** `app/lib/product-package.ts` 的 `createInitialProductPackage`：把 `prdBody` 从 3 段单句扩成 5 个完整章节（背景与目标 / 产品范围 / 核心方案 / 权限规则 / 异常处理）+ 验收标准列表，正文为真实多句段落，丰富度对齐 `PdfPreview` 已硬编码的内容。

**`ProductPrdPanel`**（`app/components/product-panels.tsx:145`）改写：

- 文档页（`PrdDocumentSheet`）成为主视图，`editable` 由 `editing` state 驱动，`直接编辑`按钮保留。
- 左侧 `prd-editor-layout` 目录导航移除（per 整页文档决定）。
- `ScopedArtifactComposer` + 修订预览从主视图降为文档下方一条精简二级条带（"通过对话修改"），不再是主导元素。

**`PrdPreview`**（`app/components/preview-drawer.tsx:589`）改写：

- 移除写死的 `.document-sheet` 3 段卡片，改用同一 `PrdDocumentSheet`，只读，数据来自 `productPackage.prdBody`。
- `productPackage` 已是 `PreviewDrawer` 的 prop，直接传入。

### 2. 右侧发送框对齐主 Composer

**`ScopedArtifactComposer`**（`app/components/product-panels.tsx:160`）重做样式，逻辑不变：

- 容器弃用紫色 `.scoped-artifact-composer`，改用 `.composer` token：`--surface` 底、`--border-strong`、`radius-lg`、`--shadow-float`（与主底栏一致）。
- 紫色 header + `em` 标签 → 上方一条 `composer-product-reference` 风格引用 chip（"当前引用：PRD V3 / 3. 核心方案"），复用主 `Composer` 已有的 chip 模式，含移除按钮。
- 工具栏行对齐主 composer 布局；controls 区放一个"精准引用"小标签（不出现项目/Agent 选择器，因为是 scoped）+ 圆角 `.send-button`。Enter 发送保留。
- 行为不变：`onSend` → `onScopedSend` → 主对话，不创建新会话（符合 CLAUDE.md"右侧局部输入只产生精准引用"）。

### 受影响文件

- 新增：`app/components/prd-document-sheet.tsx`
- `app/components/product-panels.tsx` — `ProductPrdPanel` 用文档页；`ScopedArtifactComposer` 重做样式
- `app/components/preview-drawer.tsx` — `PrdPreview` 用文档页，传 `productPackage`
- `app/lib/product-package.ts` — 扩充 `prdBody`
- `app/globals.css` — 新增文档页样式（复用 pdf-sheet token）、把 scoped composer 重做上 composer token；退役紫色 `.scoped-artifact-composer` 规则

### 测试与守则

- `client-demo` 集成测试有 PRD 相关用例（如 "revises a PRD with natural language and opens PDF preview"、"retains an unconfirmed PRD revision"）。扩充 `prdBody` 与改渲染可能命中硬钉旧稀疏文本的断言：跑 `npm test`，只更新那些钉死旧占位文本的断言，不改测试表达的行为。
- 改动后跑 `npm run build`（CLAUDE.md 要求）。
- 不改包脚本、构建工具、部署设置、框架依赖。

## 风险

- **测试红线**：当前套件已是 56 失败（与本任务无关的历史状态）。本任务的渲染改动可能让 PRD 相关断言再变。处理：明确区分"旧占位文本断言"与"行为断言"，只改前者。
- **`prdBody` 扩充影响**：`confirm-prd-revision` 会把 `## 本轮补充\n{revision}` 追加到 `prdBody` 末尾，扩充后的长文档仍兼容该追加逻辑（按行解析）。验证保留。
