import { Check, CircleHelp, Sparkles } from "lucide-react";
import { requirementAnalysisSections } from "../../lib/demo-data";
import type { WorkspaceRouterProps } from "./workspace-router";

export function RequirementAnalysisWorkspace({ requirement, canEdit }: WorkspaceRouterProps) {
  const sections = requirementAnalysisSections[requirement.id] ?? [];
  return (
    <section className="workspace-canvas requirement-analysis-workspace">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Spec foundation</p>
          <h2>产品需求工作台</h2>
          <p>逐项澄清需求，不让 Agent 跳过关键业务判断。</p>
        </div>
        <button className="primary-small" disabled={!canEdit} type="button"><Sparkles size={15} /> 继续澄清</button>
      </div>
      <div className="spec-summary-card">
        <div><strong>Spec 完整度</strong><b>{requirement.specCompletion}%</b></div>
        <span><i style={{ width: `${requirement.specCompletion}%` }} /></span>
        <small>当前版本 {requirement.specVersion} · 2 个待确认问题</small>
      </div>
      <div className="workspace-section-grid">
        {sections.map((section) => (
          <article key={section.title}>
            <header>
              <span>{section.status === "已确认" ? <Check size={14} /> : <CircleHelp size={14} />}</span>
              <strong>{section.title}</strong>
              <small className={section.status === "已确认" ? "confirmed" : "pending"}>{section.status}</small>
            </header>
            <p>{section.body}</p>
            <button disabled={!canEdit} type="button">查看与编辑</button>
          </article>
        ))}
      </div>
    </section>
  );
}
