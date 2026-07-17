import type {
  Agent,
  AssetItem,
  CodeChange,
  DevelopmentTask,
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
  { id: "prd-writer", name: "PRD 撰写 Agent", shortName: "产", mode: "research", category: "产品", description: "基于项目上下文完善 PRD 与验收标准" },
  { id: "requirement-analysis", name: "需求分析 Agent", shortName: "析", mode: "research", category: "产品", description: "识别范围、依赖、冲突和业务边界" },
  { id: "prototype", name: "原型设计 Agent", shortName: "设", mode: "research", category: "产品", description: "将需求转化为页面结构与交互原型" },
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

export const projects: Project[] = [
  { id: "customer-portal", name: "企业客户门户 V3.2", description: "统一客户身份、角色与权限体验", members: 12, updatedAt: "10 分钟前", contextCount: 23, color: "#7053d8" },
  { id: "expense", name: "智能报销系统", description: "优化报销审核与异常识别", members: 8, updatedAt: "昨天", contextCount: 17, color: "#d97746" },
  { id: "ops", name: "研发效能平台", description: "打通代码、构建、测试与度量数据", members: 15, updatedAt: "3 天前", contextCount: 31, color: "#258866" },
];

export const recentTasks: RecentTask[] = [
  { id: "prd-role", title: "完善角色管理 PRD", mode: "research", projectId: "customer-portal", agentId: "prd-writer", time: "14:32" },
  { id: "permission-ui", title: "实现权限配置页面", mode: "research", projectId: "customer-portal", agentId: "frontend-dev", time: "昨天" },
  { id: "login-failure", title: "分析登录失败问题", mode: "research", projectId: "expense", agentId: "backend-dev", time: "周一" },
  { id: "q3-report", title: "Q3 经营分析报告", mode: "office", agentId: "data-analysis", time: "7 月 12 日" },
];

export const assetGroups: AssetItem[] = [
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
    counts: { prototypes: 2, documents: 1, tasks: 5, changes: 11, tests: 34 },
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
    counts: { prototypes: 1, documents: 1, tasks: 0, changes: 0, tests: 6 },
    updatedAt: "2 小时前",
  },
];

export const projectMembers: ProjectMember[] = [
  { id: "member-chen", projectId: "customer-portal", name: "陈楠", initials: "陈", role: "admin", team: "产品中心" },
  { id: "member-lin", projectId: "customer-portal", name: "林川", initials: "林", role: "development", team: "前端研发" },
  { id: "member-zhao", projectId: "customer-portal", name: "赵屿", initials: "赵", role: "development", team: "后端研发" },
  { id: "member-zhou", projectId: "customer-portal", name: "周祺", initials: "周", role: "testing", team: "质量保障" },
  { id: "member-gu", projectId: "customer-portal", name: "顾言", initials: "顾", role: "product", team: "产品中心" },
];

export const projectAssetSummaries: ProjectAssetSummary[] = [
  { section: "documents", label: "产品文档", value: "8 份", note: "PRD、原型与验收标准", updatedAt: "10 分钟前" },
  { section: "memory", label: "项目记忆", value: "23 条", note: "人工确认的范围与决策", updatedAt: "昨天" },
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
];

export const testReports: TestReport[] = [
  { id: "report-role-regression", requirementId: "role-permissions", title: "角色管理回归测试报告", passRate: 92, passed: 23, failed: 2, skipped: 1 },
];
