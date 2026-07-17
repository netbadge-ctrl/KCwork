import { ArrowLeft, ShieldCheck, Users } from "lucide-react";
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
  stageRisk?: string;
  agent: Agent;
  agents: Agent[];
  project: Project;
  projects: Project[];
  selectedProjectId: string | null;
  documentDraft: string;
  developmentTaskStatuses: Record<string, DevelopmentTaskStatus>;
  onBack(): void;
  onSetStage(stage: RequirementStage): void;
  onSelectAgent(agentId: string): void;
  onSelectProject(projectId: string | null): void;
  onSend(text: string): void;
  onOpenPreview(kind: PreviewKind): void;
  onSaveDocumentDraft(draft: string): void;
  onSetDevelopmentTaskStatus(taskId: string, status: DevelopmentTaskStatus): void;
}

export function RequirementWorkspace({
  requirement,
  currentStage,
  stageRisk,
  agent,
  agents,
  project,
  projects,
  selectedProjectId,
  documentDraft,
  developmentTaskStatuses,
  onBack,
  onSetStage,
  onSelectAgent,
  onSelectProject,
  onSend,
  onOpenPreview,
  onSaveDocumentDraft,
  onSetDevelopmentTaskStatus,
}: RequirementWorkspaceProps) {
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
          <select
            aria-label="切换需求状态"
            onChange={(event) => onSetStage(event.target.value as RequirementStage)}
            value={currentStage}
          >
            {Object.entries(stageLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <span className={`gate-badge ${requirement.gateStatus}`}>
            <ShieldCheck size={12} /> {requirement.gateLabel}
          </span>
          <span className="spec-version-chip">Spec {requirement.specVersion}</span>
          <select
            aria-label="切换工作台 Agent"
            onChange={(event) => requestAgentSwitch(event.target.value)}
            value={agent.id}
          >
            {researchAgents.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="requirement-context-line">
          <span><Users size={13} /> 产品 {requirement.owners.product}</span>
          <span>研发 {requirement.owners.development}</span>
          <span>测试 {requirement.owners.testing}</span>
          {stageRisk && <b>状态跳转已记录：{stageRisk}</b>}
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
