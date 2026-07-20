import {
  BarChart3,
  Blocks,
  Bug,
  CheckSquare2,
  ClipboardList,
  Database,
  Download,
  FileCode2,
  FileStack,
  FileText,
  GitCompareArrows,
  HelpCircle,
  LayoutTemplate,
  ListChecks,
  ListTree,
  MessageSquareText,
  MousePointerClick,
  Presentation,
  ScrollText,
  ShieldCheck,
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
    tool("files", "文件变更", FileCode2),
    tool("diff", "代码差异", GitCompareArrows),
    tool("log", "运行日志", ScrollText),
    tool("context", "引用代码", ListTree),
  ],
  "backend-dev": [
    tool("files", "文件变更", FileCode2),
    tool("diff", "代码差异", GitCompareArrows),
    tool("log", "运行日志", ScrollText),
    tool("context", "引用代码", ListTree),
  ],
  "code-review": [
    tool("diff", "代码差异", GitCompareArrows),
    tool("issues", "问题清单", Bug),
    tool("analysis", "审查结论", ClipboardList),
    tool("context", "引用规范", ListTree),
  ],
  testing: [
    tool("test", "测试报告", TestTube2),
    tool("failures", "失败详情", Bug),
    tool("log", "运行日志", ScrollText),
    tool("context", "测试依据", ListTree),
  ],
  default: [
    tool("context", "项目上下文", ListTree),
    tool("analysis", "Agent 结论", ClipboardList),
    tool("log", "执行记录", ScrollText),
  ],
};

const productTools: Record<ProductWorkMode, ContextualTool[]> = {
  analysis: [
    tool("context", "需求上下文", ListTree),
    tool("analysis", "分析结论", ClipboardList),
    tool("questions", "待确认问题", HelpCircle),
    tool("log", "执行记录", ScrollText),
  ],
  prototype: [
    tool("prototype", "页面预览", LayoutTemplate),
    tool("components", "组件结构", Blocks),
    tool("interaction", "交互说明", MousePointerClick),
    tool("context", "引用上下文", ListTree),
  ],
  prd: [
    tool("prd", "文档预览", FileText),
    tool("pdf", "PDF 预览", FileStack),
    tool("analysis", "版本修改", GitCompareArrows),
    tool("context", "引用上下文", ListTree),
  ],
};

export const contextualPreviewKinds = new Set<PreviewKind>([
  "actions", "analysis", "chart", "components", "context", "diff", "export",
  "failures", "files", "interaction", "issues", "log", "outline", "pdf",
  "prd", "prototype", "slides", "test", "questions",
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
  if (!["home", "task", "requirement-detail"].includes(context.view)) return [];
  const mapped = context.agentId === "product-design"
    ? productTools[context.productWorkMode ?? "analysis"]
    : context.mode === "office"
      ? officeTools[context.agentId] ?? officeTools.default
      : developmentTools[context.agentId] ?? developmentTools.default;

  return mapped
    .filter((item) => item.kind !== "log" || context.hasExecution)
    .filter((item) => item.kind !== "test" || context.agentId === "testing" || context.hasTestEvidence)
    .slice(0, 4);
}
