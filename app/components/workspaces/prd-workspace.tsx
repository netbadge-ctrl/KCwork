import { FileText } from "lucide-react";
import type { WorkspaceRouterProps } from "./workspace-router";

export function PrdWorkspace({ requirement }: WorkspaceRouterProps) {
  return (
    <section className="workspace-canvas workspace-shell-card">
      <div className="workspace-heading"><div><p className="eyebrow">Product document</p><h2>PRD 撰写工作台</h2><p>基于 Spec、原型和项目记忆维护可追溯文档。</p></div></div>
      <article className="role-workspace-summary"><FileText size={22} /><div><strong>角色与成员权限 PRD {requirement.specVersion}</strong><small>已确认 · 检测到 1 项新修订</small></div></article>
    </section>
  );
}
