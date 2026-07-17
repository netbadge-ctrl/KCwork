import { Check, CircleHelp, Sparkles } from "lucide-react";
import type { WorkspaceRouterProps } from "./workspace-router";

const sections = [
  { title: "目标与价值", status: "已确认", body: "让企业管理员能够清晰管理项目成员与角色边界。" },
  { title: "范围", status: "已确认", body: "成员列表、角色调整、批量操作与权限审计。" },
  { title: "非范围", status: "已确认", body: "本需求不调整租户级组织架构与外部身份源。" },
  { title: "用户故事", status: "待确认", body: "作为项目管理员，我希望批量调整成员角色并了解影响。" },
  { title: "业务规则", status: "已确认", body: "所有角色变更必须写入审计记录，并保留操作者。" },
  { title: "验收标准", status: "待确认", body: "已整理 12 条可验证标准，其中 2 条需要产品确认。" },
];

export function RequirementAnalysisWorkspace({ requirement }: WorkspaceRouterProps) {
  return (
    <section className="workspace-canvas requirement-analysis-workspace">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Spec foundation</p>
          <h2>产品需求工作台</h2>
          <p>逐项澄清需求，不让 Agent 跳过关键业务判断。</p>
        </div>
        <button className="primary-small" type="button"><Sparkles size={15} /> 继续澄清</button>
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
            <button type="button">查看与编辑</button>
          </article>
        ))}
      </div>
    </section>
  );
}
