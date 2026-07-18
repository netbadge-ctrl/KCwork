import { FileWarning, ScanSearch, ShieldCheck } from "lucide-react";
import { codeChanges } from "../../lib/demo-data";
import type { WorkspaceRouterProps } from "./workspace-router";
import { WorkspaceEmptyState } from "./workspace-empty-state";

export function CodeReviewWorkspace({ requirement, onOpenPreview }: WorkspaceRouterProps) {
  const changes = codeChanges.filter((change) => change.requirementId === requirement.id);
  if (changes.length === 0) {
    return (
      <section className="workspace-canvas workspace-shell-card">
        <div className="workspace-heading"><div><p className="eyebrow">Independent review</p><h2>代码审查工作台</h2><p>当前工作区只展示 {requirement.code} 的代码证据。</p></div></div>
        <WorkspaceEmptyState title="当前需求暂无可审查代码变更" detail="生成代码变更后，审查 Agent 才会展示结论。" />
      </section>
    );
  }
  return (
    <section className="workspace-canvas workspace-shell-card">
      <div className="workspace-heading"><div><p className="eyebrow">Independent review</p><h2>代码审查工作台</h2><p>围绕 {requirement.code} 检查需求覆盖、安全与兼容性。</p></div></div>
      <article className="role-workspace-summary"><ScanSearch size={22} /><div><strong>3 项建议 · 0 项阻断</strong><small>已覆盖 12 条验收标准，结论由审查人确认</small></div><button className="secondary-small" onClick={() => onOpenPreview("diff")} type="button">查看 Diff</button></article>
      <div className="review-issue-list">
        <article className="review-issue warning"><FileWarning size={18} /><div><strong>建议补充空权限集合的降级处理</strong><p>useRolePermissions.ts · 与 AC-07 相关</p></div><span>建议</span></article>
        <article className="review-issue"><ShieldCheck size={18} /><div><strong>权限范围已绑定当前项目</strong><p>RolePanel.tsx · 未发现跨项目访问风险</p></div><span>通过</span></article>
        <article className="review-issue"><ShieldCheck size={18} /><div><strong>测试覆盖管理员与观察者</strong><p>RolePanel.test.tsx · 对应 AC-07、AC-09</p></div><span>通过</span></article>
      </div>
    </section>
  );
}
