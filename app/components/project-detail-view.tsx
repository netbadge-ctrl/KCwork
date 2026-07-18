import { ArrowLeft, Settings } from "lucide-react";
import type {
  Agent,
  AgentWorkSession,
  ContextSource,
  Project,
  Requirement,
  RequirementStage,
} from "../lib/types";
import { AgentRequirementList } from "./agent-requirement-list";
import { ContextConnectionBar } from "./context-connection-bar";
import { RecentAgentWork } from "./recent-agent-work";

export interface ProjectDetailViewProps {
  project: Project;
  sessions: AgentWorkSession[];
  agents: Agent[];
  requirements: Requirement[];
  requirementStages: Record<string, RequirementStage>;
  lastAgentByRequirement: Record<string, string>;
  contextSources: ContextSource[];
  selectedContextIds: string[];
  onBack(): void;
  onResumeSession(sessionId: string): void;
  onOpenRequirement(requirementId: string): void;
  onOpenContext(): void;
  onOpenSettings(): void;
}

export function ProjectDetailView({
  project,
  sessions,
  agents,
  requirements,
  requirementStages,
  lastAgentByRequirement,
  contextSources,
  selectedContextIds,
  onBack,
  onResumeSession,
  onOpenRequirement,
  onOpenContext,
  onOpenSettings,
}: ProjectDetailViewProps) {
  return (
    <div className="project-detail page-scroll">
      <header className="page-header detail-header">
        <button className="back-button" onClick={onBack} type="button">
          <ArrowLeft size={17} /> 返回项目
        </button>
        <div className="detail-title-row">
          <div>
            <div className="project-kicker">
              <span style={{ background: project.color }} /> 系统开发项目
            </div>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>
          <button className="secondary-button" onClick={onOpenSettings} type="button">
            <Settings size={16} /> 项目设置
          </button>
        </div>
        <div className="project-meta-row">
          <span>更新于 {project.updatedAt}</span>
          <span>Agent 协作上下文已就绪</span>
        </div>
      </header>

      <RecentAgentWork agents={agents} onResume={onResumeSession} sessions={sessions} />
      <AgentRequirementList
        agents={agents}
        lastAgentByRequirement={lastAgentByRequirement}
        onOpen={onOpenRequirement}
        requirements={requirements}
        stages={requirementStages}
      />
      <ContextConnectionBar
        onOpen={onOpenContext}
        selectedIds={selectedContextIds}
        sources={contextSources}
      />
    </div>
  );
}
