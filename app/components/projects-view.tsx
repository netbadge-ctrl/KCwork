import { ArrowRight, Boxes, Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import type {
  Agent,
  AgentWorkSession,
  ContextSource,
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
  selectedContextIds: string[];
  requirements: Requirement[];
  requirementStages: Record<string, RequirementStage>;
  lastAgentByRequirement: Record<string, string>;
  onOpenProject(id: string): void;
  onBack(): void;
  onResumeSession(sessionId: string): void;
  onOpenRequirement(id: string): void;
  onOpenContext(): void;
  onCreateRequirement(): void;
  onCreateProject(project: Project): void;
}

export function ProjectsView({
  projects,
  selectedProjectId,
  sessions,
  agents,
  contextSources,
  selectedContextIds,
  requirements,
  requirementStages,
  lastAgentByRequirement,
  onOpenProject,
  onBack,
  onResumeSession,
  onOpenRequirement,
  onOpenContext,
  onCreateRequirement,
  onCreateProject,
}: ProjectsViewProps) {
  const [query, setQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const project = projects.find((item) => item.id === selectedProjectId);

  if (project) {
    return (
      <ProjectDetailView
        agents={agents}
        contextSources={contextSources.filter((source) => source.projectId === project.id)}
        lastAgentByRequirement={lastAgentByRequirement}
        onBack={onBack}
        onOpenContext={onOpenContext}
        onOpenRequirement={onOpenRequirement}
        onCreateRequirement={onCreateRequirement}
        onResumeSession={onResumeSession}
        project={project}
        requirementStages={requirementStages}
        requirements={requirements.filter((requirement) => requirement.projectId === project.id)}
        selectedContextIds={selectedContextIds.filter((id) =>
          contextSources.some((source) => source.projectId === project.id && source.id === id),
        )}
        sessions={sessions.filter((session) => session.projectId === project.id)}
      />
    );
  }

  const filteredProjects = projects.filter((item) =>
    `${item.name}${item.description}`.toLowerCase().includes(query.toLowerCase()),
  );

  const createProject = () => {
    const name = projectName.trim();
    if (!name) return;
    onCreateProject({
      id: `project-${Date.now()}`,
      name,
      description: projectDescription.trim() || "新的企业系统开发项目",
      members: 1,
      updatedAt: "刚刚",
      contextCount: 0,
      color: "#7c5cff",
    });
    setProjectName("");
    setProjectDescription("");
    setIsCreating(false);
  };

  return (
    <div className="projects-view page-scroll">
      <header className="page-header">
        <div>
          <p className="eyebrow">工作上下文</p>
          <h1>项目</h1>
          <p>集中管理产品资料、代码、测试资产和团队记忆。</p>
        </div>
        <button className="primary-button" onClick={() => setIsCreating(true)} type="button"><Plus size={16} /> 新建项目</button>
      </header>
      {isCreating && (
        <form
          className="inline-create-form project-create-form"
          onSubmit={(event) => {
            event.preventDefault();
            createProject();
          }}
        >
          <div>
            <strong>新建项目</strong>
            <span>创建后即可添加需求并连接 Agent 上下文。</span>
          </div>
          <input
            aria-label="项目名称"
            autoFocus
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="项目名称"
            value={projectName}
          />
          <input
            aria-label="项目说明"
            onChange={(event) => setProjectDescription(event.target.value)}
            placeholder="项目说明"
            value={projectDescription}
          />
          <div className="inline-create-actions">
            <button onClick={() => setIsCreating(false)} type="button">取消</button>
            <button className="primary-button" disabled={!projectName.trim()} type="submit">创建</button>
          </div>
        </form>
      )}
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
