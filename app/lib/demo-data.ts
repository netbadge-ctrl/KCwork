import type { Agent, AssetItem, Project, RecentTask } from "./types";

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
