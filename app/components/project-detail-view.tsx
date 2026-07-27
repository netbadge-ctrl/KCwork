import { ArrowLeft, CheckCircle2, Clock3, FilePlus2, GitBranch, Sparkles } from "lucide-react";
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
  const activeRequirementCount = requirements.filter(
    (requirement) => (requirementStages[requirement.id] ?? requirement.stage) !== "done",
  ).length;
  return (
    <div className="project-detail page-scroll">
      <header className="project-detail-header">
        <button className="back-button" onClick={onBack} type="button">
          <ArrowLeft size={15} /> 全部项目
        </button>
        <div className="project-detail-heading">
          <div className="project-detail-identity">
            <span className="project-detail-mark" style={{ background: project.color }}>
              {project.name.slice(0, 1)}
            </span>
            <div>
              <p className="project-kicker">系统开发项目</p>
              <h1>{project.name}</h1>
              <p>{project.description}</p>
            </div>
          </div>
          <div className="project-detail-facts">
            <span><strong>{activeRequirementCount}</strong><small>进行中需求</small></span>
            <span><strong>{project.repositories?.length ?? 0}</strong><small>代码仓库</small></span>
            <span><strong>{project.members}</strong><small>项目成员</small></span>
          </div>
        </div>
        <div className="project-detail-status">
          <span><Clock3 size={13} />更新于 {project.updatedAt}</span>
          <span className={contextSources.length > 0 ? "ready" : ""}>
            {contextSources.length > 0 ? <CheckCircle2 size={13} /> : <Sparkles size={13} />}
            {contextSources.length > 0
              ? "Agent 协作上下文已就绪"
              : "项目上下文尚未连接"}
          </span>
          <span><GitBranch size={13} />{project.repositories?.join("、") ?? "尚未连接代码库"}</span>
        </div>
      </header>

      {sessions.length > 0 && (
        <RecentAgentWork
          agents={agents}
          onResume={onResumeSession}
          requirements={requirements}
          sessions={sessions}
        />
      )}
      {requirements.length > 0 ? (
        <AgentRequirementList
          agents={agents}
          historicalTotal={project.historicalRequirementCount}
          lastAgentByRequirement={lastAgentByRequirement}
          onCreate={onCreateRequirement}
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
