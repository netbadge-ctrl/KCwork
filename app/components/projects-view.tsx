import { ArrowRight, Boxes, FileText, GitBranch, Plus, Search, TestTube2, Users } from "lucide-react";
import { useState } from "react";
import type {
  Agent,
  AgentWorkSession,
  ContextSource,
  PreviewKind,
  Project,
  Requirement,
  RequirementStage,
} from "../lib/types";
import { ProjectDetailView } from "./project-detail-view";

export interface ProjectsViewProps {
  projects: Project[];
  selectedProjectId: string | null;
  sessions: AgentWorkSession[];
  agents: Agent[];
  contextSources: ContextSource[];
  requirements: Requirement[];
  requirementStages: Record<string, RequirementStage>;
  lastAgentByRequirement: Record<string, string>;
  onOpenProject(id: string): void;
  onBack(): void;
  onResumeSession(sessionId: string): void;
  onOpenRequirement(id: string): void;
  onCreateRequirement(): void;
  onStartCreateProject(): void;
  onOpenPreview(kind: PreviewKind): void;
}

export function ProjectsView({
  projects,
  selectedProjectId,
  sessions,
  agents,
  contextSources,
  requirements,
  requirementStages,
  lastAgentByRequirement,
  onOpenProject,
  onBack,
  onResumeSession,
  onOpenRequirement,
  onCreateRequirement,
  onStartCreateProject,
  onOpenPreview,
}: ProjectsViewProps) {
  const [query, setQuery] = useState("");
  const project = projects.find((item) => item.id === selectedProjectId);

  if (project) {
    return (
      <ProjectDetailView
        agents={agents}
        contextSources={contextSources.filter((source) => source.projectId === project.id)}
        lastAgentByRequirement={lastAgentByRequirement}
        onBack={onBack}
        onOpenPreview={onOpenPreview}
        onOpenRequirement={onOpenRequirement}
        onCreateRequirement={onCreateRequirement}
        onResumeSession={onResumeSession}
        project={project}
        requirementStages={requirementStages}
        requirements={requirements.filter((requirement) => requirement.projectId === project.id)}
        sessions={sessions.filter((session) => session.projectId === project.id)}
      />
    );
  }

  const filteredProjects = projects.filter((item) =>
    `${item.name}${item.description}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="projects-view page-scroll">
      <header className="page-header">
        <div>
          <p className="eyebrow">工作上下文</p>
          <h1>项目</h1>
          <p>集中管理产品资料、代码、测试资产和团队记忆。</p>
        </div>
        <button className="primary-button" onClick={onStartCreateProject} type="button"><Plus size={16} /> 新建项目</button>
      </header>
      <label className="search-box">
        <Search size={17} />
        <input
          aria-label="搜索项目"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索项目名称或描述"
          value={query}
        />
      </label>
      <div className="project-grid">
        {filteredProjects.map((item) => (
          <article className="project-card" key={item.id}>
            <div className="project-card-top">
              <span className="large-project-mark" style={{ background: item.color }}>
                {item.name.slice(0, 1)}
              </span>
              <span className="project-updated">{item.updatedAt}</span>
            </div>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <div className="project-stats">
              <span><Users size={14} /> {item.members}</span>
              <span><GitBranch size={14} /> {item.repositories?.length ?? 0} 个仓库</span>
              <span><FileText size={14} /> {item.historicalRequirementCount ?? 0} 项需求</span>
              <span><TestTube2 size={14} /> {item.testCaseCount ?? 0} 条用例</span>
              <span><Boxes size={14} /> {item.contextCount} 项上下文</span>
            </div>
            <button
              aria-label={`打开${item.name}`}
              className="open-project"
              onClick={() => onOpenProject(item.id)}
              type="button"
            >
              打开项目 <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
