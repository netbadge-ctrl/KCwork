import { LayoutTemplate } from "lucide-react";
import type { WorkspaceRouterProps } from "./workspace-router";

export function PrototypeWorkspace({ requirement }: WorkspaceRouterProps) {
  return (
    <section className="workspace-canvas workspace-shell-card">
      <div className="workspace-heading"><div><p className="eyebrow">Prototype</p><h2>原型设计工作台</h2><p>从 {requirement.code} 的用户故事生成并调整页面交互。</p></div></div>
      <article className="role-workspace-summary"><LayoutTemplate size={22} /><div><strong>4 个页面 · 12 个交互热点</strong><small>角色配置原型 V3 · 昨天已确认</small></div></article>
    </section>
  );
}
