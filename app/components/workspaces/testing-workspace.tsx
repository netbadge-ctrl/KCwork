import { TestTube2 } from "lucide-react";
import type { WorkspaceRouterProps } from "./workspace-router";

export function TestingWorkspace({ requirement }: WorkspaceRouterProps) {
  return (
    <section className="workspace-canvas workspace-shell-card">
      <div className="workspace-heading"><div><p className="eyebrow">Spec verification</p><h2>测试工作台</h2><p>测试用例从 {requirement.code} 的验收标准派生并保留追溯。</p></div></div>
      <article className="role-workspace-summary"><TestTube2 size={22} /><div><strong>26 个测试用例 · 92% 通过</strong><small>2 个失败 · 1 个跳过</small></div></article>
    </section>
  );
}
