import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import type {
  Agent,
  DevelopmentTaskStatus,
  ExecutionState,
  Message,
  PreviewKind,
  Project,
  ProjectRole,
  ProductWorkMode,
  Requirement,
  RequirementStage,
} from "../lib/types";
import { projectRoleLabels } from "../lib/project-capabilities";
import { Composer } from "./composer";
import { RequirementAgentActivity } from "./requirement-agent-activity";
import { stageLabels } from "./requirement-list";
import { WorkspaceRouter } from "./workspaces/workspace-router";

export interface RequirementWorkspaceProps {
  requirement: Requirement;
  currentStage: RequirementStage;
  agent: Agent;
  agents: Agent[];
  project: Project;
  projects: Project[];
  selectedProjectId: string | null;
  documentDraft: string;
  developmentTaskStatuses: Record<string, DevelopmentTaskStatus>;
  selectedContextCount: number;
  messages: Message[];
  execution: ExecutionState;
  canEdit: boolean;
  currentRole: ProjectRole;
  productWorkMode: ProductWorkMode;
  onBack(): void;
  onSelectAgent(agentId: string): void;
  onProductWorkModeChange(mode: ProductWorkMode): void;
  onSend(text: string): void;
  onOpenPreview(kind: PreviewKind): void;
  onOpenContext(): void;
  onSaveDocumentDraft(draft: string): void;
  onSetDevelopmentTaskStatus(taskId: string, status: DevelopmentTaskStatus): void;
}

export function RequirementWorkspace({
  requirement,
  currentStage,
  agent,
  agents,
  project,
  projects,
  selectedProjectId,
  documentDraft,
  developmentTaskStatuses,
  selectedContextCount,
  messages,
  execution,
  canEdit,
  currentRole,
  productWorkMode,
  onBack,
  onSelectAgent,
  onProductWorkModeChange,
  onSend,
  onOpenPreview,
  onOpenContext,
  onSaveDocumentDraft,
  onSetDevelopmentTaskStatus,
}: RequirementWorkspaceProps) {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const researchAgents = agents.filter((item) => item.mode === "research" || item.mode === "both");
  return (
    <div className="requirement-workspace">
      <header className="requirement-header">
        <div className="requirement-header-main">
          <button className="back-button" onClick={onBack} type="button">
            <ArrowLeft size={16} /> {project.name}
          </button>
          <span className="requirement-code">{requirement.code}</span>
          <div>
            <h1>{requirement.title}</h1>
            <small>{requirement.summary}</small>
          </div>
        </div>
        <div className="requirement-toolbar">
          <span className="spec-version-chip">Spec {requirement.specVersion}</span>
          <span className="requirement-stage-label">{stageLabels[currentStage]}</span>
          {!canEdit && (
            <span className="read-only-notice">
              {currentRole === "viewer"
                ? "当前角色仅可查看"
                : "当前角色无此工作区编辑权限"}
            </span>
          )}
          <select
            aria-label="切换工作台 Agent"
            disabled={currentRole === "viewer"}
            onChange={(event) => onSelectAgent(event.target.value)}
            value={agent.id}
          >
            {researchAgents.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <div className="requirement-more-actions">
            <button
              aria-expanded={isMoreMenuOpen}
              className="secondary-button"
              onClick={() => setIsMoreMenuOpen((isOpen) => !isOpen)}
              type="button"
            >
              更多需求操作
            </button>
            {isMoreMenuOpen && (
              <div className="requirement-more-menu">
                <button disabled={!canEdit} type="button">编辑负责人</button>
                <button disabled={!canEdit} type="button">归档需求</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="requirement-workspace-scroll">
        <WorkspaceRouter
          agent={agent}
          canEdit={canEdit}
          documentDraft={documentDraft}
          developmentTaskStatuses={developmentTaskStatuses}
          onOpenPreview={onOpenPreview}
          onProductWorkModeChange={onProductWorkModeChange}
          onSaveDocumentDraft={onSaveDocumentDraft}
          onSetDevelopmentTaskStatus={onSetDevelopmentTaskStatus}
          requirement={requirement}
          productModePickerVariant="compact"
          productWorkMode={productWorkMode}
        />
        <RequirementAgentActivity
          agents={agents}
          execution={execution}
          messages={messages}
          onOpenPreview={onOpenPreview}
        />
      </div>

      <div className="task-composer-wrap requirement-composer-wrap">
        <button
          aria-label={`查看本次 ${selectedContextCount} 项自动上下文`}
          className="composer-context-button"
          onClick={onOpenContext}
          type="button"
        >
          自动上下文 {selectedContextCount} 项 · 可调整
        </button>
        <Composer
          agents={agents}
          disabled={!canEdit}
          mode="research"
          onSelectAgent={onSelectAgent}
          onSend={onSend}
          projects={projects}
          selectedAgentId={agent.id}
          selectedProjectId={selectedProjectId}
          projectSelectionLocked
          variant="task"
        />
        <p className="composer-hint">
          {canEdit
            ? "当前 Agent 读写同一份需求 Spec，执行结果由你确认。"
            : currentRole === "viewer"
              ? `${projectRoleLabels[currentRole]}角色仅可查看当前需求与产物。`
              : `${projectRoleLabels[currentRole]}角色无此工作区编辑权限。`}
        </p>
      </div>
    </div>
  );
}
