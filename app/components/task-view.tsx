import {
  Check,
  ChevronDown,
  Circle,
  Clock3,
  FileText,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react";
import type {
  Agent,
  ExecutionState,
  Message,
  PreviewKind,
  Project,
  ProjectRole,
  RecentTask,
} from "../lib/types";
import { projectRoleLabels } from "../lib/project-capabilities";
import { Composer } from "./composer";

export interface TaskViewProps {
  task: RecentTask;
  messages: Message[];
  execution: ExecutionState;
  agent: Agent;
  project: Project | null;
  agents: Agent[];
  projects: Project[];
  selectedProjectId: string | null;
  canEdit: boolean;
  currentRole: ProjectRole;
  onSelectAgent(id: string): void;
  onSelectProject(id: string | null): void;
  onSend(text: string): void;
  onOpenPreview(kind: PreviewKind): void;
}

const executionSteps = [
  { state: "reading", label: "读取项目上下文" },
  { state: "analyzing", label: "分析资料" },
  { state: "generating", label: "生成结果" },
] as const;

export function TaskView({
  task,
  messages,
  execution,
  agent,
  project,
  agents,
  projects,
  selectedProjectId,
  canEdit,
  currentRole,
  onSelectAgent,
  onSelectProject,
  onSend,
  onOpenPreview,
}: TaskViewProps) {
  return (
    <div className="task-view">
      <header className="task-header">
        <div>
          <div className="task-heading-row">
            <h1>{task.title}</h1>
            <ChevronDown size={15} />
          </div>
          <small>任务 · {task.time}</small>
        </div>
        <div className="task-header-actions">
          {!canEdit && project && <span className="read-only-notice">当前角色仅可查看</span>}
          {project && (
            <span className="project-chip">
              <span style={{ background: project.color }} /> {project.name}
            </span>
          )}
          <button
            className="context-count"
            onClick={() => onOpenPreview("sources")}
            type="button"
          >
            {project?.contextCount ?? 0} 项上下文
          </button>
          <button aria-label="更多任务操作" className="icon-button" type="button">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      <div className="conversation-scroll">
        <div className="conversation-inner">
          {messages.map((message) => (
            <article className={`message-turn ${message.role}`} key={message.id}>
              <span className={`message-avatar ${message.role}`}>
                {message.role === "user"
                  ? "陈"
                  : agents.find((item) => item.id === message.agentId)
                      ?.shortName ?? "智"}
              </span>
              <div className="message-content">
                {message.role === "agent" && (
                  <span className="message-agent-name">
                    ✦ {agents.find((item) => item.id === message.agentId)?.name}
                  </span>
                )}
                <p>{message.text}</p>
                {message.artifact && (
                  <div className="artifact-card">
                    <span className="artifact-icon"><FileText size={19} /></span>
                    <span className="artifact-copy">
                      <strong>{message.artifactTitle ?? `${task.title} 产物`}</strong>
                      <small>{message.artifactMeta ?? "任务产物"}</small>
                    </span>
                    <button
                      aria-label={`查看${message.artifactTitle ?? `${task.title} 产物`}`}
                      onClick={() => onOpenPreview(message.artifact!)}
                      type="button"
                    >
                      查看产物
                    </button>
                  </div>
                )}
                {message.role === "agent" && message.artifact && (
                  <div className="result-actions">
                    <button className="primary-small" onClick={() => onOpenPreview(message.artifact!)} type="button">打开预览</button>
                    <button type="button">继续调整</button>
                    <button type="button">保存到项目</button>
                  </div>
                )}
              </div>
            </article>
          ))}

          {!["idle", "done", "error"].includes(execution) && (
            <article className="message-turn agent">
              <span className="message-avatar agent">{agent.shortName}</span>
              <div className="message-content">
                <span className="message-agent-name">✦ {agent.name}</span>
                <div className="execution-card">
                  <div className="execution-heading">
                    <span><Clock3 size={15} /> 正在执行</span>
                    <small>{project ? "项目上下文已授权" : "仅使用本次对话"}</small>
                  </div>
                  <div className="execution-list">
                    {executionSteps.map((step, index) => {
                      const currentIndex = executionSteps.findIndex(
                        (item) => item.state === execution,
                      );
                      const isDone = index < currentIndex;
                      const isCurrent = index === currentIndex;
                      return (
                        <div className={isCurrent ? "current" : ""} key={step.state}>
                          <span className="execution-state-icon">
                            {isDone ? <Check size={13} /> : <Circle size={10} fill={isCurrent ? "currentColor" : "none"} />}
                          </span>
                          {step.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>
          )}

          {execution === "error" && (
            <article className="error-card">
              <strong>执行失败</strong>
              <p>当前 Agent 暂时无法完成请求，请重试或更换 Agent。</p>
              <div><button type="button"><RotateCcw size={14} /> 重试</button><button type="button">更换 Agent</button></div>
            </article>
          )}

          {execution === "done" && (
            <div className="execution-complete-note">
              <Check size={15} /> 执行产物已生成，下一步由你决定。
            </div>
          )}
        </div>
      </div>

      <div className="task-composer-wrap">
        <Composer
          agents={agents}
          disabled={!canEdit}
          mode={agent.mode === "office" ? "office" : "research"}
          onSelectAgent={onSelectAgent}
          onSelectProject={onSelectProject}
          onSend={onSend}
          projects={projects}
          selectedAgentId={agent.id}
          selectedProjectId={selectedProjectId}
          variant="task"
        />
        <p className="composer-hint">
          {canEdit
            ? "Agent 可能会出错，请检查重要信息与产物。"
            : `${projectRoleLabels[currentRole]}角色仅可查看当前项目任务。`}
        </p>
      </div>
    </div>
  );
}
