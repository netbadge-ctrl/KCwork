import { ScanSearch } from "lucide-react";
import type { WorkspaceRouterProps } from "./workspace-router";

export function CodeReviewWorkspace({ requirement }: WorkspaceRouterProps) {
  return (
    <section className="workspace-canvas workspace-shell-card">
      <div className="workspace-heading"><div><p className="eyebrow">Independent review</p><h2>代码审查工作台</h2><p>围绕 {requirement.code} 检查需求覆盖、安全与兼容性。</p></div></div>
      <article className="role-workspace-summary"><ScanSearch size={22} /><div><strong>3 项建议 · 0 项阻断</strong><small>已覆盖 12 条验收标准</small></div></article>
    </section>
  );
}
