# KCWork Demo — Codex 交接文档

更新时间：2026-07-23（Asia/Shanghai）  
交接目标：供另一 Codex 账号在不重复梳理历史上下文的情况下，继续产品设计、前端 Demo 实现、GitHub 同步与线上发布。

## 1. 当前目标

基于 OpenCode 客户端进行二次开发，设计并实现一套面向企业内部系统开发全链路的 Agent 提效客户端 Demo。

产品覆盖产品设计、前端开发、后端开发、测试和日常办公，但本质不是项目管理或需求管理工具。需求文档、代码库、知识库、记忆和测试资产主要用于为 Agent 提供可信上下文。

当前阶段目标：

1. 继续提升 Agent 工作区的交互完整度与视觉精致度；
2. 保持左、中、右三栏架构：左栏导航，中栏主对话，右栏按任务类型承载辅助能力；
3. 产品、研发、测试共享同一项目和需求上下文，但不做复杂 Agent 编排；
4. 完善产品原型、PRD、Spec、验收标准、代码 Diff、测试资产、知识库和多人记忆 Demo；
5. 所有交互只需前端演示，不需要实现真实后端。

## 2. 仓库、分支与线上环境

- 本地目录：`/Users/landos/Documents/Codex/2026-07-17/new-chat/work/client-demo`
- GitHub：`https://github.com/netbadge-ctrl/KCwork`
- 当前分支：`feature/unified-conversation-architecture`
- 当前实现基线提交：`382b5c9737db8d4d43a3a37071c119ef10558d15`（其后的提交仅新增本交接文档）
- GitHub 同步状态：当前分支已推送，`origin/feature/unified-conversation-architecture` 与本地一致
- 默认分支：尚未在本任务中合并；不要擅自合并或覆盖默认分支
- 线上 Demo：`https://kflow-enterprise-demo-0717-a6c5e.netbadge7777.chatgpt.site/`
- 当前线上版本：Sites version 32
- Sites project ID：`appgprj_6a5a097e48fc819199827ee34db9ea15`
- Sites 配置：`.openai/hosting.json`
- 最近成功部署 ID：`appgdep_6a60e421c8f88191890cfaed5c092e2c`

注意：用户已经明确授权，后续前端修改在一次构建通过后直接发布，不要再反复询问“是否确认发布”。

## 3. 产品原则与关键决策

### 3.1 Agent 优先，不是管理系统

- 管理功能必须存在，但视觉和操作层级要弱化；
- 页面核心应是与 Agent 对话、查看执行产物和继续调整；
- 项目、需求、状态、门禁只作为上下文和协作边界，不做重流程看板；
- 不做 Agent 协作编排，不把整个研发流程自动化。

### 3.2 三栏架构

- 左栏：新建任务、项目、智能资产、最新任务和个人入口；支持折叠；
- 中栏：主对话和主任务交互，输入框固定在底部；
- 右栏：默认收起，按当前 Agent 和任务类型展示原型、PRD、代码、Diff、测试、上下文等辅助能力；支持调宽；
- 新建任务页不展示右栏；
- 右栏打开时尽量保证右栏宽度，中栏适度缩窄；中右栏使用一致的标题高度、背景和弱分隔。

### 3.3 中栏主对话与右栏工具关系

- 中栏是唯一主会话；
- 右栏中的原型/PRD局部输入不是独立对话，只负责把当前页面、组件或章节作为精准引用发送到主对话；
- Agent 的修改建议在右栏预览，用户确认后才生成新版本；
- 研发以对话驱动代码修改为主，右栏代码编辑和 Diff 是辅助能力。

### 3.4 产品需求交付逻辑

- 用户可以先做原型再生成 PRD，也可以先写 PRD 再生成原型，不强制显式选择流程；
- 产品交付物是原型 + PRD；Spec 和验收标准属于整个需求维度，由产品、研发、测试共同查看、编辑和确认；
- 允许只有 PRD、没有原型时将需求标记完成；
- 产品标记需求完成后，同项目研发和测试自动可见，不需要“交给研发/测试”的复杂流转；
- 原型支持多页面、页面切换、浏览器打开、组件选择修改和版本回退；
- PRD 支持直接编辑和自然语言修订。

### 3.5 状态与权限

- 有状态流转和门禁审核，但所有项目成员可自由切换需求状态；
- 项目角色控制内容编辑、设置、资产维护等能力；
- 项目成员可以查看项目内所有需求、进展、代码和测试资产；
- 产品、研发、测试上下文互通。

### 3.6 知识与记忆

- 企业知识库存放可查证内容：代码 Wiki、业务/产品文档、研发规范、办公文档；
- 项目知识确定“这个系统实际采用什么”，包括企业知识固定版本、代码 Wiki、历史需求和测试基线；
- 多人记忆不是聊天记录，而是带来源、范围、贡献人、状态和有效期的稳定原子结论；
- 候选记忆不能自动影响 Agent，需要成员确认；
- Agent 按用户权限、项目、需求和角色装配相关子集，不把整个知识库塞入上下文；
- 回答和产物必须保留可追溯引用。

详细说明见：`docs/KCWork-knowledge-and-memory-design.md`。

## 4. 已完成内容

### 4.1 主客户端

- 左中右三栏客户端框架；
- 左栏折叠、右栏展开与宽度拖动；
- 日常办公 / 系统开发切换；
- 项目列表、项目详情、需求列表、需求 Agent 工作区；
- 个人页面；
- 智能资产页面；
- 新建系统项目 Demo；
- 最近任务和任务类型图标。

### 4.2 项目与需求

- 一个项目代表长期迭代的系统，而不是一次需求；
- 项目关联多个代码仓库、历史需求、测试资产和共享上下文；
- 一个项目包含多份需求，每份需求拥有自己的产品、开发和测试上下文；
- 成员角色、需求状态与门禁、上下文维护入口位于项目右侧区域；
- Spec 与验收标准已从产品交付检查中拆出，提升为需求公共基线；
- 产品需求包和公共基线入口可在项目名称附近展开/收起。

### 4.3 产品设计 Agent

- 外部只展示一个“产品设计 Agent”，没有需求分析、原型审计、PRD 撰写三个子 Agent；
- 产品工作可从需求分析、原型或 PRD 任一环节开始；
- 原型和 PRD 均在统一会话架构下工作；
- 原型支持页面切换、添加、复制、删除、起始页、浏览器打开、桌面/平板/移动端、组件选择与局部调整；
- 原型有版本和回退；
- PRD 支持直接编辑与自然语言修订；
- 产品交付检查只检查原型与 PRD；
- 已替换原型画布中的旧 Demo，当前是更完整的企业成员与权限管理界面。

### 4.4 研发与测试右栏

- 前端：文件、Diff、页面预览、控制台；
- 后端：文件、Diff、接口调试、数据模型、运行日志；
- 测试：测试用例、执行测试、失败证据、缺陷、测试报告；
- 代码工作台支持代码查看、编辑和 Diff；
- 主交互仍是中栏对话，代码编辑只是辅助。

### 4.5 智能资产

- Tab 顺序：Skill、插件、MCP、Agent、代码库、知识库、记忆库；
- 每个 Tab 有自己的“添加”入口；
- 企业知识库增加代码 Wiki、产品/业务知识、研发规范、办公文档；
- 展示同步来源、负责人、内容规模、权限范围、索引状态和 Agent 使用规则；
- 支持知识类型筛选、详情切换和带引用检索示例；
- 多人记忆支持项目、团队、企业三级范围，候选确认和治理说明。

### 4.6 项目知识与记忆

- 原“项目记忆”入口升级为“项目知识与记忆”；
- 三个视图：项目知识、多人记忆、Agent 上下文；
- 展示企业知识与项目覆盖关系；
- 展示多人共同贡献、候选确认、来源与有效范围；
- 展示产品、开发、测试 Agent 不同的上下文装配内容。

### 4.7 视觉收敛

- 右侧产物面板操作按钮统一为紧凑密度；
- 原型控制项移动到“原型”标题栏；
- 中右栏标题高度、背景和分隔线统一；
- 修复 Grid 自动行被拉伸导致提示条和卡片异常增高的问题；
- 产品产物工作区统一按钮高度、字号和圆角；
- 用户对精致度和页面空间占用非常敏感，新增组件需优先使用紧凑样式。

## 5. 最近关键提交

- `382b5c9` `feat: deepen knowledge memory and prototype demo`
- `2ad7466` `fix stretched artifact panel rows`
- `060e2ee` `refine artifact control density`
- `f7ce54b` `refine split prototype workspace`
- `535dc14` `feat: add artifact-first split workspace`
- `cf68469` `fix: attach page actions to prototype title`
- `875f33d` `refactor: compact prototype page controls`
- `0626d20` `refactor: prioritize prototype canvas workspace`
- `0018987` `feat: unify scoped artifact input with main conversation`
- `57d24f4` `feat: toggle requirement context from project header`
- `bdfb41d` `refactor: compact requirement context toolbar`
- `52ec8da` `feat: promote spec to shared requirement baseline`

## 6. 修改的主要文件与原因

| 文件 | 作用 / 修改原因 |
| --- | --- |
| `app/page.tsx` | 顶层视图切换、项目资产和右栏联动；更新“项目知识与记忆”命名 |
| `app/globals.css` | 整体设计系统、三栏、产物面板、原型 Demo、知识与记忆工作区样式；文件较大，修改时必须限制选择器作用域 |
| `app/components/preview-drawer.tsx` | 右栏入口、按 Agent/任务选择内容、右栏宽度、原型标题栏控制项 |
| `app/components/product-panels.tsx` | 产品原型、PRD、交付检查、版本记录；新增精致版原型 Demo |
| `app/components/product-package-strip.tsx` | 产品需求包的紧凑入口与完成状态 |
| `app/components/requirement-baseline.tsx` | Spec 与验收标准的需求级公共编辑和确认 |
| `app/components/requirement-workspace.tsx` | 需求 Agent 主工作区与公共上下文入口 |
| `app/components/code-workbench-preview.tsx` | 代码查看、编辑和 Diff |
| `app/components/agent-tool-panels.tsx` | 产品、研发、测试不同类型的右栏完整交互 Demo |
| `app/components/assets-view.tsx` | 智能资产 Tab、添加、知识库和记忆库入口 |
| `app/components/knowledge-memory-workspace.tsx` | 企业知识库、代码 Wiki、办公知识和组织多人记忆完整交互 |
| `app/components/project-assets-view.tsx` | 项目文档、知识/记忆、仓库和测试资产页面；接入项目知识与记忆工作区 |
| `app/components/project-knowledge-memory.tsx` | 项目知识、多人记忆和 Agent 上下文装配交互 |
| `app/components/project-settings-panel.tsx` | 项目右侧设置与资产入口；更新项目知识与记忆名称 |
| `app/components/project-context-panel.tsx` | 项目代码、需求、测试、共享上下文的右栏入口 |
| `app/components/create-system-panel.tsx` | 新建项目时关联代码仓库、需求源、测试源和上下文资产 |
| `app/lib/product-package.ts` | 原型页面、版本、PRD、交付状态和 reducer |
| `app/lib/requirement-baseline.ts` | Spec 与验收标准公共基线状态 |
| `app/lib/demo-data.ts` | 项目、需求、智能资产、知识和记忆 Demo 数据 |
| `app/lib/demo-state.ts` | 顶层客户端交互状态与 reducer |
| `app/lib/contextual-tools.ts` | 不同 Agent/任务对应的右栏工具集合 |
| `app/lib/types.ts` | View、Preview、Asset、Project、Requirement 等公共类型 |
| `docs/KCWork-knowledge-and-memory-design.md` | 知识库、代码 Wiki、项目知识和多人记忆的独立产品说明 |
| `docs/superpowers/specs/*` | 历史设计规格，记录关键产品决策 |
| `docs/superpowers/plans/*` | 历史实现计划，仅用于理解演进过程；用户不希望后续小改动反复走重计划流程 |

## 7. 尚未完成事项

当前 Demo 已能完整展示核心概念，但以下内容仍是模拟或可继续完善：

1. 没有真实后端，刷新页面后部分新增、确认和编辑状态会恢复；
2. 知识库同步、向量检索、引用、权限过滤和健康度均为前端模拟；
3. 代码 Wiki 没有接入真实仓库索引和符号图；
4. 多人记忆没有真实审批、冲突关系、审计日志和持久化；
5. “添加知识库/记忆”只完成 Demo 级交互，未实现完整连接向导；
6. 浏览器打开的原型与右栏原型状态没有真实跨窗口实时同步；
7. 原型仍是固定业务示例，不是真正生成的多页面应用；
8. 代码编辑与 Diff 不会写入真实仓库；
9. 测试执行、控制台、接口调试和数据模型都是模拟；
10. 当前功能分支尚未合并到 GitHub 默认分支；
11. 尚未建立正式的设计 Token / 基础组件库，`app/globals.css` 已较大，后续应避免继续无边界追加；
12. 尚未进行完整跨浏览器、键盘可访问性和小屏幕系统性验收。

## 8. 已运行的命令与结果

最近每次前端修改均遵从用户要求：只做一次主要构建检查，避免反复验证和浪费时间。

### 8.1 构建

```bash
npm run build
```

最近一次结果：成功。Vinext 完成 client、server、RSC、SSR 构建，路由 `/` 与 `/prototype` 可用。

已知构建提示：

- Node 输出 `module.register()` deprecated warning；不影响构建；
- Vinext 提示部分路由无法静态分类；不影响当前 Demo；
- 不要为了消除这两个提示进行无关升级。

### 8.2 静态差异检查

```bash
git diff --check
```

结果：通过，无空白错误。

### 8.3 Git

```bash
git status --short
git branch --show-current
git log --oneline
git push origin feature/unified-conversation-architecture
```

结果：当前工作树在生成本交接文档前为干净状态；功能分支已同步到 `netbadge-ctrl/KCwork`。

### 8.4 Sites 打包与发布

打包命令形式：

```bash
/Users/landos/.codex/plugins/cache/openai-bundled/sites/0.1.30/scripts/package-site.sh \
  /Users/landos/Documents/Codex/2026-07-17/new-chat/work/client-demo \
  /private/tmp/kcwork-<commit>.tar.gz
```

然后使用 Sites：

1. 创建短期源仓库写入凭证；
2. 将当前 HEAD 推送至 Sites 内部源仓库 `main`；
3. 使用完整 40 位 commit SHA 保存站点版本；
4. 直接部署保存后的版本；
5. 轮询部署状态直到 `succeeded`。

最近结果：version 32 发布成功。

### 8.5 测试

仓库有 `npm test`（Vitest），但近期视觉和前端 Demo 调整没有反复运行完整测试套件，这是用户明确要求的节奏。高风险状态逻辑修改时仍应按比例运行相关测试。

## 9. 已知工具和环境问题

1. 用户终端曾提示 `brew` 和 `gh` 不存在，不要依赖 Homebrew 或 GitHub CLI；
2. GitHub 通过已有 HTTPS 授权可直接 `git push`；
3. 沙箱内直接访问 Sites Git 域名可能报 `Could not resolve host`，需要使用授权的网络执行；
4. Sites `package-site.sh` 必须提供两个参数：项目目录和归档路径；
5. Sites 保存版本时必须传完整 40 位 SHA，短 SHA 会报 `stale_commit_sha`；
6. Sites 项目是共享站点。用户已经明确授权后续直接发布，因此可以使用共享站点部署接口，无需再次请求确认；
7. 不要在日志、文档或 Git 配置中保存 Sites 短期 Token。

## 10. 用户工作偏好

下一账号必须遵守以下偏好：

- 不要为小型前端交互修改反复走 writing plan、TDD 或多轮确认；
- 不要重复询问是否发布，构建通过后直接发布；
- 不要反复执行相同测试；产品 Demo 以合理设计和可交互为优先；
- 实现前应认真判断设计合理性，避免机械堆功能；
- 组件需要紧凑、精致、一致，避免过高按钮、过大卡片和无意义留白；
- 不要创造第二套页面架构，始终在现有三栏与统一对话架构中扩展；
- Agent 是核心，管理功能应弱化；
- 主对话必须保持在中栏底部，右栏输入只作为精准引用；
- 用户会直接指出不合理设计，收到反馈后应先定位公共根因，避免逐页打补丁；
- 交付结果应同步 GitHub，并在需要时直接更新线上 Demo。

## 11. 推荐下一步

### 优先级 1：做一次真实任务路径验收

选择 `企业客户门户 V3.2 / REQ-032`，依次验证：

1. 进入产品设计 Agent；
2. 打开原型、切换页面、选择组件并发送到主对话；
3. 打开 PRD、进行自然语言修订；
4. 展开需求公共基线，编辑 Spec 和验收标准；
5. 切换到前端/后端/测试 Agent，确认右栏工具和上下文随任务变化；
6. 打开项目知识与记忆，确认候选记忆和 Agent 上下文装配交互；
7. 检查中右栏在不同宽度下是否仍保持视觉一致。

这次验收应一次完成，不要在每个页面重复跑完整测试。

### 优先级 2：收敛基础组件与密度 Token

从 `app/globals.css` 提取右栏按钮、卡片、标签、标题、表单等基础 Token，减少后续出现高度不一致和选择器互相覆盖的问题。优先做小范围、低风险收敛，不要重写整个 CSS。

### 优先级 3：增强知识与记忆连接向导

在不引入后端的前提下补充：

- 新建知识库时选择来源、范围、同步策略和权限；
- 代码 Wiki 选择仓库、分支和索引范围；
- 多人记忆查看冲突、复核周期和历史版本；
- 项目引用企业知识时显示固定版本与项目覆盖项。

### 优先级 4：决定分支集成方式

在用户明确要求后，再将 `feature/unified-conversation-architecture` 合并到默认分支或创建 PR。不要擅自删除分支或重写历史。

## 12. 快速启动

```bash
cd /Users/landos/Documents/Codex/2026-07-17/new-chat/work/client-demo
npm run dev
```

生产构建：

```bash
npm run build
```

主要入口：

- `/`：客户端 Demo
- `/prototype`：浏览器原型预览

## 13. 交接完成标准

另一 Codex 账号接手后，应先阅读：

1. 本文件；
2. `docs/KCWork-knowledge-and-memory-design.md`；
3. `docs/superpowers/specs/2026-07-19-unified-conversation-architecture-design.md`；
4. `docs/superpowers/specs/2026-07-22-kflow-product-requirement-package-design.md`。

然后查看当前线上 Demo 与 `git status`，从现有架构继续，不要重新生成项目或新建第二套界面。
