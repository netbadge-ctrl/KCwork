import { ArrowLeft, FilePlus2, Settings } from "lucide-react";
import type {
  Agent,
  AgentWorkSession,
  ContextSource,
  PreviewKind,
  Project,
  Requirement,
  RequirementStage,
} from "../lib/types";
import { AgentRequirementList } from "./agent-requirement-list";
import { RecentAgentWork } from "./recent-agent-work";

export interface ProjectDetailViewProps {
  project: Project;
  sessions: AgentWorkSession[];
  agents: Agent[];
  requirements: Requirement[];
  requirementStages: Record<string, RequirementStage>;
  lastAgentByRequirement: Record<string, string>;
  contextSources: ContextSource[];
  onBack(): void;
  onResumeSession(sessionId: string): void;
  onOpenRequirement(requirementId: string): void;
  onCreateRequirement(): void;
  onOpenPreview(kind: PreviewKind): void;
}

export function ProjectDetailView({
  project,
  sessions,
  agents,
  requirements,
  requirementStages,
  lastAgentByRequirement,
  contextSources,
  onBack,
  onResumeSession,
  onOpenRequirement,
  onCreateRequirement,
  onOpenPreview,
}: ProjectDetailViewProps) {
  return (
    <div className="project-detail page-scroll">
      <header className="page-header detail-header">
        <button className="back-button" onClick={onBack} type="button">
          <ArrowLeft size={17} /> 返回项目
        </button>
        <button
          className="secondary-button project-settings-entry"
          onClick={() => onOpenPreview("project-settings")}
          type="button"
        >
          <Settings size={15} /> 项目设置
        </button>
        <div className="detail-title-row">
          <div>
            <div className="project-kicker">
              <span style={{ background: project.color }} /> 系统开发项目
            </div>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>
        </div>
        <div className="project-meta-row">
          <span>更新于 {project.updatedAt}</span>
          <span>
            {contextSources.length > 0
              ? "Agent 协作上下文已就绪"
              : "项目上下文尚未连接"}
          </span>
        </div>
      </header>

      {sessions.length > 0 && (
        <RecentAgentWork agents={agents} onResume={onResumeSession} sessions={sessions} />
      )}
      {requirements.length > 0 ? (
        <AgentRequirementList
          agents={agents}
          lastAgentByRequirement={lastAgentByRequirement}
          onOpen={onOpenRequirement}
          requirements={requirements}
          stages={requirementStages}
        />
      ) : (
        <section className="project-empty-state content-section">
          <span><FilePlus2 size={24} /></span>
          <div>
            <p className="eyebrow">从需求开始</p>
            <h2>还没有需求</h2>
            <p>创建首个需求后，即可在项目边界内选择 Agent 并连接专属上下文。</p>
          </div>
          <button onClick={onCreateRequirement} type="button">新建需求</button>
        </section>
      )}
    </div>
  );
}
