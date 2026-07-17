import { GitBranch } from "lucide-react";
import type { WorkspaceRouterProps } from "./workspace-router";

export function DevelopmentWorkspace({ requirement }: WorkspaceRouterProps) {
  return (
    <section className="workspace-canvas workspace-shell-card">
      <div className="workspace-heading"><div><p className="eyebrow">Spec to code</p><h2>开发工作台</h2><p>开发任务、代码基线和验证结果均关联 {requirement.code}。</p></div></div>
      <article className="role-workspace-summary"><GitBranch size={22} /><div><strong>customer-portal · feature/role-permissions</strong><small>6 个任务 · 8 个代码变更</small></div></article>
    </section>
  );
}
