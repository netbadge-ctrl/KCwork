import {
  BarChart3,
  Blocks,
  Bug,
  ClipboardCheck,
  CheckSquare2,
  ClipboardList,
  Database,
  Download,
  FileCode2,
  FileStack,
  FileText,
  GitBranch,
  GitCompareArrows,
  History,
  LayoutTemplate,
  ListChecks,
  ListTree,
  MessageSquareText,
  Presentation,
  Send,
  ScrollText,
  ShieldCheck,
  Table2,
  Terminal,
  TestTube2,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Mode, PreviewKind, ProductWorkMode, ViewId } from "./types";

export interface ContextualTool {
  kind: PreviewKind;
  label: string;
  icon: LucideIcon;
}

export interface ContextualToolContext {
  mode: Mode;
  view: ViewId;
  agentId: string;
  hasExecution: boolean;
  hasTestEvidence: boolean;
  productWorkMode?: ProductWorkMode;
}

const tool = (kind: PreviewKind, label: string, icon: LucideIcon): ContextualTool => ({ kind, label, icon });

const officeTools: Record<string, ContextualTool[]> = {
  "meeting-notes": [
    tool("context", "原始材料", FileStack),
    tool("prd", "纪要预览", MessageSquareText),
    tool("actions", "待办事项", CheckSquare2),
    tool("sources", "引用来源", ListTree),
  ],
  "data-analysis": [
    tool("context", "数据表", FileStack),
    tool("chart", "图表预览", BarChart3),
    tool("analysis", "分析依据", ClipboardList),
    tool("export", "导出结果", Download),
  ],
  presentation: [
    tool("outline", "演示大纲", ListChecks),
    tool("slides", "页面预览", Presentation),
    tool("context", "素材引用", FileStack),
    tool("export", "导出结果", Download),
  ],
  default: [
    tool("context", "引用来源", FileStack),
    tool("analysis", "工作草稿", FileText),
    tool("actions", "后续事项", CheckSquare2),
    tool("export", "导出结果", Download),
  ],
};

const developmentTools: Record<string, ContextualTool[]> = {
  "frontend-dev": [
    tool("files", "代码与文件", FileCode2),
    tool("frontend-preview", "页面预览", LayoutTemplate),
    tool("diff", "代码差异", GitCompareArrows),
    tool("console", "控制台", Terminal),
    tool("context", "开发上下文", ListTree),
  ],
  "backend-dev": [
    tool("files", "代码与文件", FileCode2),
    tool("api-debug", "接口调试", Send),
    tool("diff", "代码差异", GitCompareArrows),
    tool("log", "运行日志", ScrollText),
    tool("data-model", "数据模型", Table2),
    tool("context", "开发上下文", ListTree),
  ],
  "code-review": [
    tool("diff", "代码差异", GitCompareArrows),
    tool("issues", "问题清单", Bug),
    tool("analysis", "审查结论", ClipboardList),
    tool("context", "引用规范", ListTree),
  ],
  testing: [
    tool("test-cases", "测试用例", ClipboardCheck),
    tool("test-run", "执行测试", TestTube2),
    tool("failures", "失败证据", Bug),
    tool("test", "测试报告", TestTube2),
    tool("defects", "缺陷记录", ShieldCheck),
    tool("context", "测试依据", ListTree),
  ],
  default: [
    tool("context", "项目上下文", ListTree),
    tool("analysis", "Agent 结论", ClipboardList),
    tool("log", "执行记录", ScrollText),
  ],
};

const productTools: ContextualTool[] = [
  tool("prototype", "原型", LayoutTemplate),
  tool("prd", "PRD", FileText),
  tool("delivery-check", "交付检查", ClipboardCheck),
  tool("version-history", "版本记录", History),
  tool("context", "项目知识", Database),
];

export const contextualPreviewKinds = new Set<PreviewKind>([
  "actions", "analysis", "chart", "components", "context", "diff", "export",
  "failures", "files", "interaction", "issues", "log", "outline", "pdf",
  "prd", "prototype", "slides", "test", "questions",
  "requirement-analysis", "acceptance-criteria", "prototype-audit",
  "frontend-preview", "console", "api-debug", "data-model",
  "test-cases", "test-run", "defects",
  "delivery-check", "version-history",
  "requirement-governance", "context-maintenance", "project-repositories",
  "project-requirements", "project-tests",
]);

export function resolveContextualTools(context: ContextualToolContext): ContextualTool[] {
  if (context.view === "project-detail") {
    return [
      tool("project-repositories", "代码仓库", GitBranch),
      tool("project-requirements", "产品需求", FileText),
      tool("project-tests", "测试资产", TestTube2),
      tool("context-maintenance", "共享上下文", Database),
      tool("members", "成员与角色", Users),
      tool("requirement-governance", "需求状态与门禁", ShieldCheck),
    ];
  }
  if (!["task", "requirement-detail"].includes(context.view)) return [];
  const mapped = context.agentId === "product-design"
    ? productTools
    : context.mode === "office"
      ? officeTools[context.agentId] ?? officeTools.default
      : developmentTools[context.agentId] ?? developmentTools.default;

  return mapped
    .filter((item) => item.kind !== "log" || context.hasExecution)
    .filter((item) => item.kind !== "test" || context.agentId === "testing" || context.hasTestEvidence);
}
