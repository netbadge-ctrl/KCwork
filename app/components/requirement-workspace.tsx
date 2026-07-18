import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import type {
  Agent,
  DevelopmentTaskStatus,
  PreviewKind,
  Project,
  Requirement,
  RequirementStage,
} from "../lib/types";
import { Composer } from "./composer";
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
  onBack(): void;
  onSelectAgent(agentId: string): void;
  onSelectProject(projectId: string | null): void;
  onSend(text: string): void;
  onOpenPreview(kind: PreviewKind): void;
  onOpenContext(): void;
  onOpenSettings(): void;
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
  onBack,
  onSelectAgent,
  onSelectProject,
  onSend,
  onOpenPreview,
  onOpenContext,
  onOpenSettings,
  onSaveDocumentDraft,
  onSetDevelopmentTaskStatus,
}: RequirementWorkspaceProps) {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const researchAgents = agents.filter((item) => item.mode === "research" || item.mode === "both");
  const requestAgentSwitch = (agentId: string) => {
    if (
      agent.id === "prd-writer" &&
      documentDraft &&
      agentId !== agent.id
    ) {
      const shouldLeave = window.confirm(
        "当前修订尚未确认，是否放弃并切换 Agent？",
      );
      if (!shouldLeave) return;
      onSaveDocumentDraft("");
    }
    onSelectAgent(agentId);
  };
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
          <select
            aria-label="切换工作台 Agent"
            onChange={(event) => requestAgentSwitch(event.target.value)}
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
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenSettings();
                  }}
                  type="button"
                >
                  调整状态与门禁
                </button>
                <button type="button">编辑负责人</button>
                <button type="button">归档需求</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="requirement-workspace-scroll">
        <WorkspaceRouter
          agent={agent}
          documentDraft={documentDraft}
          developmentTaskStatuses={developmentTaskStatuses}
          onOpenPreview={onOpenPreview}
          onSaveDocumentDraft={onSaveDocumentDraft}
          onSetDevelopmentTaskStatus={onSetDevelopmentTaskStatus}
          requirement={requirement}
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
          mode="research"
          onSelectAgent={requestAgentSwitch}
          onSelectProject={onSelectProject}
          onSend={onSend}
          projects={projects}
          selectedAgentId={agent.id}
          selectedProjectId={selectedProjectId}
          variant="task"
        />
        <p className="composer-hint">当前 Agent 读写同一份需求 Spec，执行结果由你确认。</p>
      </div>
    </div>
  );
}
