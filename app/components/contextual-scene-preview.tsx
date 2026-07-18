import {
  BarChart3,
  CheckCircle2,
  FileCode2,
  Presentation,
  Sparkles,
} from "lucide-react";
import type { PreviewKind } from "../lib/types";

const sceneCopy: Partial<Record<PreviewKind, { title: string; summary: string; items: string[] }>> = {
  actions: { title: "已识别 4 项后续事项", summary: "按负责人和截止时间整理，可在确认后同步到任务系统。", items: ["陈楠 · 确认需求范围", "林川 · 补充技术方案", "周祺 · 准备验收清单"] },
  analysis: { title: "Agent 分析结论", summary: "结论来自当前任务已连接的资料，不混用其他任务证据。", items: ["目标与边界已明确", "关键依赖已标记", "仍有 2 项需要人工确认"] },
  chart: { title: "Q3 核心指标", summary: "营收、续约率与交付成本已完成趋势对比。", items: ["营收同比 +18%", "企业客户续约率 +6pp", "交付成本环比 -4%"] },
  components: { title: "原型组件结构", summary: "当前页面拆分为可复用的导航、筛选、列表和角色操作组件。", items: ["WorkspaceNavigation", "MemberFilter", "RoleActionPanel"] },
  export: { title: "导出结果", summary: "可将当前 Agent 结果导出为 PDF、文档或演示文件。", items: ["PDF 文档", "可编辑 DOCX", "演示文稿"] },
  failures: { title: "2 项失败详情", summary: "失败用例保留运行环境、步骤和证据，等待测试人员确认。", items: ["SSO-014 租户切换超时", "SSO-021 错误提示缺少审计编号"] },
  files: { title: "3 个文件发生变化", summary: "文件列表与当前开发任务绑定，可继续进入完整 Diff。", items: ["RolePanel.tsx", "permissions.ts", "role-panel.test.tsx"] },
  interaction: { title: "交互说明", summary: "高风险角色变更需要确认，其他操作保持即时反馈。", items: ["批量选择后展示影响范围", "保存前校验权限边界", "成功后同步项目记忆"] },
  issues: { title: "代码审查问题清单", summary: "问题按风险和需求覆盖分类，修复决定仍由研发确认。", items: ["P1 · 缺少资源级权限判断", "P2 · 批量操作未记录审计", "建议 · 补充空状态测试"] },
  outline: { title: "演示大纲", summary: "按结论先行组织 8 页内容，并保留数据来源。", items: ["01 关键结论", "02 经营指标", "03 风险与下一步"] },
  questions: { title: "待确认问题", summary: "这些问题会影响 Spec 范围，Agent 不会代替项目成员决定。", items: ["观察者是否可导出审计记录？", "批量操作上限是多少？", "是否需要移动端适配？"] },
  slides: { title: "演示页面预览", summary: "已生成封面、指标总览和行动建议页面。", items: ["封面 · Q3 经营复盘", "指标总览 · 三项核心变化", "行动建议 · 四个优先事项"] },
};

export function ContextualScenePreview({ kind }: { kind: PreviewKind }) {
  const content = sceneCopy[kind];
  if (!content) return null;
  const Icon = kind === "chart" ? BarChart3 : kind === "slides" ? Presentation : kind === "files" || kind === "issues" ? FileCode2 : Sparkles;
  return (
    <article className="contextual-scene-preview">
      <div className="scene-preview-heading"><span><Icon size={20} /></span><div><p className="eyebrow">当前任务</p><h3>{content.title}</h3></div></div>
      <p>{content.summary}</p>
      <div className="scene-preview-list">
        {content.items.map((item) => <div key={item}><CheckCircle2 size={15} /><span>{item}</span></div>)}
      </div>
      <button className="primary-small" type="button">在对话中继续调整</button>
    </article>
  );
}
