import { CheckCircle2, FileCode2, GitBranch, GitCompareArrows } from "lucide-react";
import { codeChanges, developmentTasks } from "../../lib/demo-data";
import type { DevelopmentTaskStatus } from "../../lib/types";
import type { WorkspaceRouterProps } from "./workspace-router";

const statusLabels: Record<DevelopmentTaskStatus, string> = {
  "not-started": "未开始",
  "in-progress": "进行中",
  done: "已完成",
  blocked: "受阻",
};

export function DevelopmentWorkspace({
  requirement,
  developmentTaskStatuses,
  onSetDevelopmentTaskStatus,
  onOpenPreview,
}: WorkspaceRouterProps) {
  const tasks = developmentTasks.filter(
    (task) => task.requirementId === requirement.id,
  );
  const changes = codeChanges.filter(
    (change) => change.requirementId === requirement.id,
  );
  return (
    <section className="workspace-canvas development-workspace">
      <div className="workspace-heading"><div><p className="eyebrow">Spec to code</p><h2>开发工作台</h2><p>开发任务、代码基线和验证结果均关联 {requirement.code}。</p></div></div>
      <div className="dev-repo-bar">
        <span><GitBranch size={15} /> customer-portal / feature/role-permissions</span>
        <span>基线 main@7c42b1</span>
        <span className="spec-version-chip">Spec {requirement.specVersion}</span>
      </div>
      <div className="dev-grid">
        <div className="dev-task-list">
          <header><div><strong>开发任务</strong><small>由成员选择任务并确认状态</small></div><button type="button">+ 标记开发任务</button></header>
          {tasks.map((task) => {
            const status = developmentTaskStatuses[task.id] ?? task.status;
            const isRolePanelTask = task.id === "dev-role-panel";
            const taskChanges = changes.filter((change) => change.taskId === task.id);
            return (
              <article className="dev-task-row" key={task.id}>
                <div className="dev-task-title">
                  <FileCode2 size={17} />
                  <div><strong>{task.title}</strong><small>{task.repository} · {task.files} 个文件 · Spec {task.specRef}</small></div>
                </div>
                <select
                  aria-label={isRolePanelTask ? "角色面板任务状态" : `${task.title}任务状态`}
                  className={`dev-task-status ${status}`}
                  onChange={(event) => onSetDevelopmentTaskStatus(task.id, event.target.value as DevelopmentTaskStatus)}
                  value={status}
                >
                  {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                {taskChanges.length > 0 ? (
                  <button
                    aria-label={isRolePanelTask ? "查看角色面板代码差异" : `查看${task.title}代码差异`}
                    className="secondary-small"
                    onClick={() => onOpenPreview("diff")}
                    type="button"
                  ><GitCompareArrows size={14} /> 查看 Diff</button>
                ) : <span className="dev-no-change">等待变更</span>}
              </article>
            );
          })}
        </div>
        <aside className="change-summary">
          <div><GitCompareArrows size={19} /><strong>本次 AI 变更</strong></div>
          <b>3 个文件</b>
          <p><span className="plus-text">+95</span> <span className="minus-text">−8</span></p>
          <small>与 main@7c42b1 比较</small>
          <button onClick={() => onOpenPreview("diff")} type="button">查看完整代码差异</button>
        </aside>
      </div>
      <div className="implementation-log"><CheckCircle2 size={16} /><span><b>实现记录</b> Agent 已按 AC-07 重构权限判断；等待研发确认变更。</span></div>
    </section>
  );
}
