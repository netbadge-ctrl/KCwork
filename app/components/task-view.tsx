import {
  Check,
  ChevronDown,
  Circle,
  Clock3,
  FileText,
  Layers3,
  RotateCcw,
} from "lucide-react";
import { useState, type Dispatch } from "react";
import type {
  Agent,
  ExecutionState,
  Message,
  PreviewKind,
  ProductWorkMode,
  Project,
  ProjectRole,
  RecentTask,
  Requirement,
  ProductContextReference,
} from "../lib/types";
import { projectRoleLabels } from "../lib/project-capabilities";
import { Composer } from "./composer";
import { DownstreamProductContext, ProductPackageStrip } from "./product-package-strip";
import type { ProductPackageAction, ProductPackageState } from "../lib/product-package";
import { RequirementBaselineStrip } from "./requirement-baseline";
import type { RequirementBaselineState } from "../lib/requirement-baseline";
import { RequirementMoreActions } from "./requirement-more-actions";

export interface TaskViewProps {
  task: RecentTask;
  messages: Message[];
  execution: ExecutionState;
  agent: Agent;
  executionAgent: Agent;
  project: Project | null;
  agents: Agent[];
  projects: Project[];
  selectedProjectId: string | null;
  canEdit: boolean;
  currentRole: ProjectRole;
  contextCount?: number;
  productWorkMode?: ProductWorkMode;
  projectSelectionLocked?: boolean;
  requirement?: Requirement | null;
  onSelectAgent(id: string): void;
  onSelectProject(id: string | null): void;
  onProductWorkModeChange?(mode: ProductWorkMode): void;
  onSend(text: string, contextReference?: ProductContextReference): void;
  onOpenPreview(kind: PreviewKind): void;
  onOpenProductContext?(reference: ProductContextReference): void;
  onBackToProject?(): void;
  productPackage?: ProductPackageState;
  onProductPackageAction?: Dispatch<ProductPackageAction>;
  requirementBaseline?: RequirementBaselineState;
  activePreview?: PreviewKind | null;
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
  executionAgent,
  project,
  agents,
  projects,
  selectedProjectId,
  canEdit,
  currentRole,
  contextCount,
  productWorkMode,
  projectSelectionLocked = false,
  requirement = null,
  onSelectAgent,
  onSelectProject,
  onProductWorkModeChange,
  onSend,
  onOpenPreview,
  onOpenProductContext,
  onBackToProject,
  productPackage,
  onProductPackageAction,
  requirementBaseline,
  activePreview = null,
}: TaskViewProps) {
  const [isRequirementContextOpen, setIsRequirementContextOpen] = useState(false);
  const [savedArtifactIds, setSavedArtifactIds] = useState<Set<string>>(
    () => new Set(),
  );
  const requirementProductContext: ProductContextReference | null = agent.id === "product-design" && requirement ? {
    kind: "requirement",
    label: `${requirement.code} · ${requirement.title}`,
    artifactId: requirement.id,
  } : null;
  const prototypePage = productPackage?.pages.find((item) => item.id === productPackage.selectedPageId);
  const prototypeComponent = prototypePage?.components.find((item) => item.id === productPackage?.selectedComponentId);
  const prototypePageContext: ProductContextReference | null = agent.id === "product-design" && productPackage && prototypePage ? {
    kind: "prototype",
    label: `原型 ${productPackage.prototypeVersions.at(-1)?.version ?? ""} / ${prototypePage.name}`,
    artifactId: productPackage.prototypeVersions.at(-1)?.id,
    versionId: productPackage.prototypeVersions.at(-1)?.version,
    pageId: prototypePage.id,
  } : null;
  const prototypeProductContext: ProductContextReference | null = prototypePageContext && prototypeComponent ? {
    ...prototypePageContext,
    label: `${prototypePageContext.label} / ${prototypeComponent.name}`,
    componentId: prototypeComponent.id,
  } : prototypePageContext;
  const prdDocumentContext: ProductContextReference | null = agent.id === "product-design" && productPackage ? {
    kind: "prd",
    label: `PRD ${productPackage.prdVersions.at(-1)?.version ?? ""} / 整份文档`,
    artifactId: productPackage.prdVersions.at(-1)?.id,
    versionId: productPackage.prdVersions.at(-1)?.version,
  } : null;
  const prdProductContext: ProductContextReference | null = prdDocumentContext && productPackage?.selectedPrdSection ? {
    ...prdDocumentContext,
    label: `PRD ${productPackage.prdVersions.at(-1)?.version ?? ""} / ${productPackage.selectedPrdSection}`,
    sectionId: productPackage.selectedPrdSection ?? undefined,
  } : prdDocumentContext;
  const automaticProductContext = activePreview === "prototype"
    ? prototypeProductContext
    : activePreview === "prd"
      ? prdProductContext
      : requirementProductContext;
  return (
    <div className="task-view">
      <header className="task-header">
        <div>
          <div className="task-heading-row">
            <h1>{task.title}</h1>
          </div>
          <small>任务 · {task.time}</small>
        </div>
        <div className="task-header-actions">
          {!canEdit && project && <span className="read-only-notice">当前角色仅可查看</span>}
          {project && (
            <div className="project-header-cluster">
              {onBackToProject ? (
                <button className="project-chip" onClick={onBackToProject} type="button">
                  <span style={{ background: project.color }} /> {project.name}
                </button>
              ) : (
                <span className="project-chip">
                  <span style={{ background: project.color }} /> {project.name}
                </span>
              )}
              {requirement && requirementBaseline && agent.mode !== "office" && (
                <button
                  aria-expanded={isRequirementContextOpen}
                  className={`requirement-context-toggle ${isRequirementContextOpen ? "active" : ""}`}
                  onClick={() => setIsRequirementContextOpen((isOpen) => !isOpen)}
                  type="button"
                >
                  <Layers3 size={14} />
                  需求上下文
                  <span className="context-status-dot" />
                  <ChevronDown size={13} />
                </button>
              )}
              {requirement && <RequirementMoreActions canEdit={canEdit} />}
            </div>
          )}
          <button
            className="context-count"
            onClick={() => onOpenPreview("sources")}
            type="button"
          >
            {contextCount ?? project?.contextCount ?? 0} 项上下文
          </button>
        </div>
      </header>

      {isRequirementContextOpen && requirementBaseline && requirement && agent.mode !== "office" && (
        <div className={`requirement-context-toolbar ${agent.id === "product-design" ? "with-product" : ""}`}>
          <RequirementBaselineStrip onOpen={onOpenPreview} requirement={requirement} state={requirementBaseline} />
          {productPackage && onProductPackageAction && agent.id === "product-design" && (
            <ProductPackageStrip
              canEdit={canEdit}
              dispatch={onProductPackageAction}
              onOpen={onOpenPreview}
              state={productPackage}
            />
          )}
        </div>
      )}

      {!requirementBaseline && productPackage && onProductPackageAction && agent.id === "product-design" && (
        <ProductPackageStrip canEdit={canEdit} dispatch={onProductPackageAction} onOpen={onOpenPreview} state={productPackage} />
      )}

      {productPackage && onProductPackageAction && ["development", "testing"].includes(agent.id) && (
        <DownstreamProductContext
          agentId={agent.id}
          dispatch={onProductPackageAction}
          state={productPackage}
        />
      )}

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
                {message.contextReference && (message.contextReference.kind === "requirement" || !onOpenProductContext
                  ? <span className={`message-context-reference ${message.contextReference.kind}`}><Layers3 size={12} /><em>需求</em>{message.contextReference.label}</span>
                  : <button className={`message-context-reference ${message.contextReference.kind}`} onClick={() => onOpenProductContext(message.contextReference!)} title="在右栏定位此内容" type="button"><Layers3 size={12} /><em>{message.contextReference.kind === "prototype" ? "原型" : "PRD"}</em>{message.contextReference.label}</button>)}
                <p>{message.text}</p>
                {message.artifact && (
                  <div className="artifact-card">
                    <button
                      className="artifact-open"
                      aria-label={`查看${message.artifactTitle ?? `${task.title} 产物`}`}
                      onClick={() => onOpenPreview(message.artifact!)}
                      type="button"
                    >
                      <span className="artifact-icon"><FileText size={19} /></span>
                      <span className="artifact-copy">
                        <strong>{message.artifactTitle ?? `${task.title} 产物`}</strong>
                        <small>{message.artifactMeta ?? "任务产物"}</small>
                      </span>
                    </button>
                    <button
                      className={`artifact-save ${savedArtifactIds.has(message.id) ? "saved" : ""}`}
                      disabled={savedArtifactIds.has(message.id)}
                      onClick={() =>
                        setSavedArtifactIds((current) => {
                          const next = new Set(current);
                          next.add(message.id);
                          return next;
                        })
                      }
                      type="button"
                    >
                      {savedArtifactIds.has(message.id) && <Check size={13} />}
                      {savedArtifactIds.has(message.id) ? "已保存到项目" : "保存到项目"}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}

          {!["idle", "done", "error"].includes(execution) && (
            <article className="message-turn agent">
              <span className="message-avatar agent">{executionAgent.shortName}</span>
              <div className="message-content">
                <span className="message-agent-name">✦ {executionAgent.name}</span>
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
              <p>{executionAgent.name} 暂时无法完成请求，请重试或更换 Agent。</p>
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
          onProductWorkModeChange={onProductWorkModeChange}
          onSelectAgent={onSelectAgent}
          onSelectProject={onSelectProject}
          onSend={onSend}
          productWorkMode={productWorkMode}
          projectSelectionLocked={projectSelectionLocked}
          projects={projects}
          selectedAgentId={agent.id}
          selectedProjectId={selectedProjectId}
          selectedProductContext={automaticProductContext}
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
