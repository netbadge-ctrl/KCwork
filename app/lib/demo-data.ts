import type {
  Agent,
  AgentWorkSession,
  AssetItem,
  CodeChange,
  ContextSource,
  DevelopmentTask,
  Message,
  ProductDocument,
  Project,
  ProjectAssetSummary,
  ProjectMember,
  RecentTask,
  Requirement,
  TestCase,
  TestReport,
} from "./types";

export const agents: Agent[] = [
  { id: "product-design", name: "产品设计 Agent", shortName: "产", mode: "research", category: "产品", description: "从需求分析、原型设计与审计或 PRD 撰写任一环节开始" },
  { id: "frontend-dev", name: "前端开发 Agent", shortName: "前", mode: "research", category: "研发", description: "理解代码库并完成前端实现" },
  { id: "backend-dev", name: "后端开发 Agent", shortName: "后", mode: "research", category: "研发", description: "实现接口、服务和数据逻辑" },
  { id: "code-review", name: "代码审查 Agent", shortName: "审", mode: "research", category: "研发", description: "检查质量、安全与需求覆盖" },
  { id: "testing", name: "测试 Agent", shortName: "测", mode: "research", category: "测试", description: "设计用例并生成测试报告" },
  { id: "meeting-notes", name: "会议纪要 Agent", shortName: "会", mode: "office", category: "办公", description: "提炼决议、风险和待办" },
  { id: "document-writer", name: "文档写作 Agent", shortName: "文", mode: "office", category: "办公", description: "撰写报告、制度与工作方案" },
  { id: "data-analysis", name: "数据分析 Agent", shortName: "数", mode: "office", category: "办公", description: "分析表格并生成洞察" },
  { id: "presentation", name: "演示文稿 Agent", shortName: "演", mode: "office", category: "办公", description: "生成提纲、页面与讲稿" },
  { id: "email", name: "邮件助手 Agent", shortName: "邮", mode: "office", category: "办公", description: "撰写、总结和跟进企业邮件" },
];

export const agentWorkSessions: AgentWorkSession[] = [
  {
    id: "session-role-prd",
    projectId: "customer-portal",
    requirementId: "role-permissions",
    agentId: "product-design",
    productWorkMode: "prd",
    title: "角色与成员权限重构",
    summary: "已生成 PRD v1.4，并补充 4 条可测试验收标准",
    pendingAction: "等待确认 PRD 修订",
    updatedAt: "8 分钟前",
  },
  {
    id: "session-sso-test",
    projectId: "customer-portal",
    requirementId: "sso-login",
    agentId: "testing",
    title: "企业 SSO 登录体验优化",
    summary: "核心回归完成，发现 2 项失败用例",
    pendingAction: "等待确认测试结论",
    updatedAt: "昨天",
  },
];

export const contextSources: ContextSource[] = [
  { id: "context-role-spec", projectId: "customer-portal", requirementId: "role-permissions", kind: "requirement", name: "REQ-032 Spec v1.4", detail: "需求、规则与 12 条验收标准", status: "available", autoSelected: true },
  { id: "context-role-interview", projectId: "customer-portal", requirementId: "role-permissions", kind: "document", name: "角色权限访谈纪要", detail: "2026-07-12 · 产品确认", status: "available", autoSelected: true },
  { id: "context-role-prototype", projectId: "customer-portal", requirementId: "role-permissions", kind: "prototype", name: "角色配置原型 V3", detail: "12 个交互热点", status: "available", autoSelected: true },
  { id: "context-project-memory", projectId: "customer-portal", kind: "memory", name: "项目决策记忆", detail: "权限范围与兼容性决策", status: "available", autoSelected: true },
  { id: "context-portal-repo", projectId: "customer-portal", kind: "repository", name: "customer-portal", detail: "main · 8 分钟前同步", status: "available", autoSelected: true },
  { id: "context-role-tests", projectId: "customer-portal", requirementId: "role-permissions", kind: "test", name: "角色管理测试资产", detail: "26 个用例 · 1 份报告", status: "available", autoSelected: true },
  { id: "context-sso-spec", projectId: "customer-portal", requirementId: "sso-login", kind: "requirement", name: "REQ-029 Spec v2.1", detail: "SSO 异常、租户选择与审计验收标准", status: "available", autoSelected: true },
  { id: "context-sso-runbook", projectId: "customer-portal", requirementId: "sso-login", kind: "document", name: "SSO 异常处理手册", detail: "身份源错误码与降级指引", status: "available", autoSelected: true },
  { id: "context-sso-tests", projectId: "customer-portal", requirementId: "sso-login", kind: "test", name: "SSO 登录测试资产", detail: "34 个用例 · 1 份报告", status: "available", autoSelected: true },
  { id: "context-audit-spec", projectId: "customer-portal", requirementId: "audit-export", kind: "requirement", name: "REQ-035 Spec v0.8", detail: "审计记录导出范围与 6 条验收标准", status: "available", autoSelected: true },
];

export const projects: Project[] = [
  { id: "customer-portal", name: "企业客户门户 V3.2", systemCode: "customer-portal", description: "统一客户身份、角色与权限体验", members: 12, updatedAt: "10 分钟前", contextCount: 23, color: "#7053d8", repositories: ["customer-portal-web", "customer-identity-api", "permission-service"], requirementSource: "企业需求平台 · 客户门户空间", historicalRequirementCount: 38, testSuite: "企业测试平台 · 客户门户回归集", testCaseCount: 286, contextAssets: ["产品规范知识库", "权限领域记忆", "企业设计系统"] },
  { id: "expense", name: "智能报销系统", systemCode: "expense-platform", description: "优化报销审核与异常识别", members: 8, updatedAt: "昨天", contextCount: 17, color: "#d97746", repositories: ["expense-web", "expense-service"], requirementSource: "企业需求平台 · 财务数字化空间", historicalRequirementCount: 24, testSuite: "费用平台自动化测试集", testCaseCount: 164, contextAssets: ["财务制度知识库", "报销规则记忆"] },
  { id: "ops", name: "研发效能平台", systemCode: "engineering-ops", description: "打通代码、构建、测试与度量数据", members: 15, updatedAt: "3 天前", contextCount: 31, color: "#258866", repositories: ["devops-console", "pipeline-service", "metrics-worker", "quality-gateway"], requirementSource: "企业需求平台 · 研发效能空间", historicalRequirementCount: 46, testSuite: "研发效能核心回归集", testCaseCount: 318, contextAssets: ["研发规范知识库", "流水线运维记忆", "质量门禁规则"] },
];

export const recentTasks: RecentTask[] = [
  { id: "prd-role", title: "完善角色管理 PRD", mode: "research", projectId: "customer-portal", requirementId: "role-permissions", agentId: "product-design", productWorkMode: "prd", time: "14:32" },
  { id: "permission-ui", title: "实现权限配置页面", mode: "research", projectId: "customer-portal", requirementId: "role-permissions", agentId: "frontend-dev", time: "昨天" },
  { id: "login-failure", title: "分析登录失败问题", mode: "research", projectId: "expense", agentId: "backend-dev", time: "周一" },
  { id: "q3-report", title: "Q3 经营分析报告", mode: "office", agentId: "data-analysis", time: "7 月 12 日" },
];

export const recentTaskMessages: Record<string, Message[]> = {
  "prd-role": [
    {
      id: "prd-role-user",
      role: "user",
      text: "根据需求访谈和原型，帮我完善角色管理模块的 PRD，重点补全权限边界和验收标准。",
    },
    {
      id: "prd-role-agent",
      role: "agent",
      agentId: "product-design",
      text: "PRD 已更新。我补充了租户管理员、项目管理员和普通成员三类角色的权限边界，并新增了 12 条可测试的验收标准。",
      artifact: "prd",
      artifactTitle: "角色管理模块 PRD v1.3",
      artifactMeta: "产品文档 · 刚刚更新 · 8.4 KB",
    },
  ],
  "permission-ui": [
    {
      id: "permission-ui-user",
      role: "user",
      text: "按照确认后的权限边界实现角色配置页面，并补齐观察者只读状态。",
    },
    {
      id: "permission-ui-agent",
      role: "agent",
      agentId: "frontend-dev",
      text: "角色配置页面已完成，项目管理员和观察者的操作范围已分别覆盖。",
      artifact: "diff",
      artifactTitle: "角色配置页面代码变更",
      artifactMeta: "代码差异 · 昨天更新 · 3 个文件",
    },
  ],
  "login-failure": [
    {
      id: "login-failure-user",
      role: "user",
      text: "分析智能报销系统本周的登录失败记录，找出主要原因。",
    },
    {
      id: "login-failure-agent",
      role: "agent",
      agentId: "backend-dev",
      text: "登录失败集中在过期会话和企业身份源超时，尚未生成可确认的代码变更或诊断产物。",
    },
  ],
  "q3-report": [
    {
      id: "q3-report-user",
      role: "user",
      text: "分析 Q3 经营数据，提炼收入、客户和成本趋势。",
    },
    {
      id: "q3-report-agent",
      role: "agent",
      agentId: "data-analysis",
      text: "Q3 营收同比增长 18%，企业客户续约率提升 6 个百分点；当前为分析结论，尚未生成正式报告产物。",
    },
  ],
};

export const assetGroups: AssetItem[] = [
  { id: "prd-writing", kind: "skill", name: "PRD 专业写作", description: "基于原型、需求上下文和组织规范生成可评审 PRD", status: "已启用", meta: "产品设计 Agent", scope: "团队 Skill", trigger: "撰写或修改产品文档", enabled: true },
  { id: "spec-development", kind: "skill", name: "Spec 开发", description: "将需求转成可确认的规格、任务和验收依据", status: "已启用", meta: "系统开发 Agent", scope: "系统 Skill", trigger: "进入研发实现前", enabled: true },
  { id: "meeting-summary", kind: "skill", name: "会议结论提炼", description: "从会议材料中提取决策、待办和风险", status: "已启用", meta: "日常办公 Agent", scope: "个人 Skill", trigger: "上传会议录音或纪要", enabled: true },
  { id: "github-plugin", kind: "plugin", name: "GitHub", description: "代码、Pull Request 与 Issue", status: "已连接", meta: "3 个代码库", capabilities: ["读取代码", "比较 Diff", "创建 PR"], enabled: true },
  { id: "figma-plugin", kind: "plugin", name: "Figma", description: "设计稿、组件与页面原型", status: "已连接", meta: "产品中心", capabilities: ["读取页面", "引用组件", "生成预览"], enabled: true },
  { id: "test-plugin", kind: "plugin", name: "企业测试平台", description: "测试用例、执行结果与缺陷", status: "未启用", meta: "质量保障", capabilities: ["读取用例", "同步报告", "创建缺陷"], enabled: false },
  { id: "product-kb", kind: "knowledge", name: "产品规范知识库", description: "PRD、交互和验收规范", status: "已同步", meta: "286 篇文档" },
  { id: "engineering-kb", kind: "knowledge", name: "研发规范知识库", description: "架构、编码、安全与发布规范", status: "已同步", meta: "194 篇文档" },
  { id: "project-memory", kind: "memory", name: "项目决策记忆", description: "人工确认的范围与技术决策", status: "可用", meta: "23 条记忆" },
  { id: "team-memory", kind: "memory", name: "研发团队记忆", description: "团队偏好、约定与常见问题", status: "可用", meta: "68 条记忆" },
  { id: "portal-repo", kind: "repository", name: "customer-portal", description: "main · 最近索引 8 分钟前", status: "可用", meta: "3 个关联项目" },
  { id: "expense-repo", kind: "repository", name: "expense-platform", description: "main · 最近索引昨天", status: "可用", meta: "2 个关联项目" },
  { id: "requirements", kind: "tool", name: "企业需求平台", description: "需求、评审与验收标准", status: "已连接", meta: "全员可用" },
  { id: "test-platform", kind: "tool", name: "企业测试平台", description: "测试用例与执行报告", status: "已连接", meta: "研发中心" },
];

export const requirements: Requirement[] = [
  {
    id: "role-permissions",
    projectId: "customer-portal",
    code: "REQ-032",
    title: "角色与成员权限重构",
    summary: "统一租户、项目和资源级操作边界",
    stage: "developing",
    gateStatus: "approved",
    gateLabel: "产品方案已确认",
    specVersion: "v1.4",
    specCompletion: 92,
    owners: { product: "陈楠", development: "林川", testing: "周祺" },
    counts: { prototypes: 3, documents: 2, tasks: 6, changes: 8, tests: 26 },
    updatedAt: "10 分钟前",
  },
  {
    id: "sso-login",
    projectId: "customer-portal",
    code: "REQ-029",
    title: "企业 SSO 登录体验优化",
    summary: "补齐异常反馈、租户选择和登录审计",
    stage: "testing",
    gateStatus: "objected",
    gateLabel: "2 项测试异议",
    specVersion: "v2.1",
    specCompletion: 100,
    owners: { product: "顾言", development: "赵屿", testing: "周祺" },
    counts: { prototypes: 0, documents: 0, tasks: 0, changes: 0, tests: 34 },
    updatedAt: "昨天",
  },
  {
    id: "audit-export",
    projectId: "customer-portal",
    code: "REQ-035",
    title: "权限审计记录导出",
    summary: "支持按成员、操作和时间范围导出审计记录",
    stage: "designing",
    gateStatus: "pending",
    gateLabel: "等待产品评审",
    specVersion: "v0.8",
    specCompletion: 68,
    owners: { product: "陈楠", development: "林川", testing: "待分配" },
    counts: { prototypes: 0, documents: 0, tasks: 0, changes: 0, tests: 0 },
    updatedAt: "2 小时前",
  },
];

export const projectMembers: ProjectMember[] = [
  { id: "member-chen", projectId: "customer-portal", name: "陈楠", initials: "陈", role: "admin", team: "产品中心" },
  { id: "member-lin", projectId: "customer-portal", name: "林川", initials: "林", role: "development", team: "前端研发" },
  { id: "member-zhao", projectId: "customer-portal", name: "赵屿", initials: "赵", role: "development", team: "后端研发" },
  { id: "member-zhou", projectId: "customer-portal", name: "周祺", initials: "周", role: "testing", team: "质量保障" },
  { id: "member-gu", projectId: "customer-portal", name: "顾言", initials: "顾", role: "product", team: "产品中心" },
  { id: "member-digital-portal", projectId: "customer-portal", name: "数字人", initials: "AI", role: "development", team: "智能体", digital: true },
  { id: "member-chen-expense", projectId: "expense", name: "陈楠", initials: "陈", role: "product", team: "产品中心" },
  { id: "member-digital-expense", projectId: "expense", name: "数字人", initials: "AI", role: "development", team: "智能体", digital: true },
  { id: "member-chen-ops", projectId: "ops", name: "陈楠", initials: "陈", role: "product", team: "产品中心" },
  { id: "member-digital-ops", projectId: "ops", name: "数字人", initials: "AI", role: "development", team: "智能体", digital: true },
];

export const projectAssetSummaries: ProjectAssetSummary[] = [
  { section: "documents", label: "产品文档", value: "8 份", note: "PRD、原型与验收标准", updatedAt: "10 分钟前" },
  { section: "memory", label: "项目知识与记忆", value: "4 源 · 23 条", note: "系统知识与多人确认的稳定结论", updatedAt: "8 分钟前" },
  { section: "repositories", label: "代码库", value: "3 个", note: "主仓库与依赖服务", updatedAt: "8 分钟前" },
  { section: "tests", label: "测试资产", value: "42 项", note: "用例、报告与缺陷", updatedAt: "20 分钟前" },
];

export const productDocuments: ProductDocument[] = [
  { id: "prd-role-permissions", projectId: "customer-portal", requirementId: "role-permissions", title: "角色与成员权限 PRD", kind: "prd", status: "changed", version: "v1.4", updatedAt: "10 分钟前" },
  { id: "prototype-role-permissions", projectId: "customer-portal", requirementId: "role-permissions", title: "角色配置交互原型", kind: "prototype", status: "confirmed", version: "V3", updatedAt: "昨天" },
];

export const developmentTasks: DevelopmentTask[] = [
  { id: "dev-role-panel", requirementId: "role-permissions", title: "重构角色面板权限判断", status: "not-started", specRef: "AC-07", repository: "customer-portal", files: 3 },
  { id: "dev-member-batch", requirementId: "role-permissions", title: "增加成员批量角色操作", status: "in-progress", specRef: "US-04", repository: "customer-portal", files: 5 },
  { id: "dev-audit-api", requirementId: "role-permissions", title: "补齐权限变更审计接口", status: "done", specRef: "BR-12", repository: "portal-service", files: 4 },
];

export const codeChanges: CodeChange[] = [
  { id: "change-role-panel", requirementId: "role-permissions", taskId: "dev-role-panel", file: "src/features/roles/RolePanel.tsx", additions: 18, deletions: 6, rationale: "将管理员判断替换为项目权限集合判断" },
  { id: "change-role-hook", requirementId: "role-permissions", taskId: "dev-role-panel", file: "src/features/roles/useRolePermissions.ts", additions: 42, deletions: 0, rationale: "集中计算资源范围与操作权限" },
  { id: "change-role-test", requirementId: "role-permissions", taskId: "dev-role-panel", file: "src/features/roles/RolePanel.test.tsx", additions: 35, deletions: 2, rationale: "覆盖项目管理员和观察者权限" },
];

export const testCases: TestCase[] = [
  { id: "tc-role-edit", requirementId: "role-permissions", title: "项目管理员可以修改成员角色", type: "automated", status: "passed", specRef: "AC-07" },
  { id: "tc-role-viewer", requirementId: "role-permissions", title: "观察者只能查看项目内容", type: "automated", status: "passed", specRef: "AC-09" },
  { id: "tc-role-batch", requirementId: "role-permissions", title: "批量修改角色需要二次确认", type: "manual", status: "failed", specRef: "AC-11" },
  { id: "tc-role-audit", requirementId: "role-permissions", title: "角色变更写入审计记录", type: "automated", status: "pending", specRef: "AC-12" },
  { id: "tc-sso-retry", requirementId: "sso-login", title: "租户选择失败时可重新发起 SSO", type: "automated", status: "failed", specRef: "AC-05" },
  { id: "tc-sso-error", requirementId: "sso-login", title: "身份源异常展示可诊断错误信息", type: "automated", status: "failed", specRef: "AC-08" },
  { id: "tc-sso-audit", requirementId: "sso-login", title: "登录失败写入租户审计记录", type: "automated", status: "passed", specRef: "AC-11" },
];

export const testReports: TestReport[] = [
  { id: "report-role-regression", requirementId: "role-permissions", title: "角色管理回归测试报告", passRate: 92, passed: 23, failed: 2, skipped: 1 },
  { id: "report-sso-regression", requirementId: "sso-login", title: "SSO 登录核心回归报告", passRate: 91, passed: 31, failed: 2, skipped: 1 },
];

export const requirementAnalysisSections: Record<
  string,
  { title: string; status: "已确认" | "待确认"; body: string }[]
> = {
  "role-permissions": [
    { title: "目标与价值", status: "已确认", body: "让企业管理员能够清晰管理项目成员与角色边界。" },
    { title: "范围", status: "已确认", body: "成员列表、角色调整、批量操作与权限审计。" },
    { title: "非范围", status: "已确认", body: "本需求不调整租户级组织架构与外部身份源。" },
    { title: "用户故事", status: "待确认", body: "作为项目管理员，我希望批量调整成员角色并了解影响。" },
    { title: "业务规则", status: "已确认", body: "所有角色变更必须写入审计记录，并保留操作者。" },
    { title: "验收标准", status: "待确认", body: "已整理 12 条可验证标准，其中 2 条需要产品确认。" },
  ],
  "sso-login": [
    { title: "目标与价值", status: "已确认", body: "让企业用户在身份源异常时获得明确反馈并可以安全重试。" },
    { title: "范围", status: "已确认", body: "异常反馈、租户选择、重试入口与登录审计。" },
    { title: "非范围", status: "已确认", body: "不替换企业身份源，也不改变现有 SAML 配置流程。" },
    { title: "用户故事", status: "已确认", body: "作为企业成员，我希望登录失败后知道原因并重新选择租户。" },
    { title: "业务规则", status: "已确认", body: "错误信息不得暴露身份源密钥，所有失败均写入租户审计。" },
    { title: "验收标准", status: "已确认", body: "34 个用例覆盖成功、失败、重试与审计路径。" },
  ],
  "audit-export": [
    { title: "目标与价值", status: "已确认", body: "支持管理员按成员、操作和时间范围导出审计记录。" },
    { title: "范围", status: "待确认", body: "导出筛选、字段范围和下载权限仍在澄清。" },
    { title: "非范围", status: "已确认", body: "不改变审计数据保留周期和写入链路。" },
    { title: "用户故事", status: "待确认", body: "作为审计管理员，我希望导出指定范围的操作记录。" },
    { title: "业务规则", status: "待确认", body: "超大导出任务的上限和脱敏规则等待评审。" },
    { title: "验收标准", status: "待确认", body: "当前整理 6 条初稿，尚无可执行测试资产。" },
  ],
};
