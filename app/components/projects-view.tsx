import { ArrowRight, Boxes, FileText, GitBranch, Plus, Search, TestTube2, Users } from "lucide-react";
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
  const [systemCode, setSystemCode] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [repositories, setRepositories] = useState("");
  const [requirementSource, setRequirementSource] = useState("");
  const [historicalRequirementCount, setHistoricalRequirementCount] = useState("0");
  const [testSuite, setTestSuite] = useState("");
  const [testCaseCount, setTestCaseCount] = useState("0");
  const [contextAssets, setContextAssets] = useState("");
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
      systemCode: systemCode.trim() || name.toLowerCase().replace(/\s+/g, "-"),
      description: projectDescription.trim() || "新的企业系统开发项目",
      members: 1,
      updatedAt: "刚刚",
      contextCount:
        repositories.split(/[,，\n]/).filter((item) => item.trim()).length +
        contextAssets.split(/[,，\n]/).filter((item) => item.trim()).length +
        Number(Boolean(requirementSource.trim())) +
        Number(Boolean(testSuite.trim())),
      color: "#7c5cff",
      repositories: repositories.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean),
      requirementSource: requirementSource.trim() || "待连接需求空间",
      historicalRequirementCount: Number(historicalRequirementCount) || 0,
      testSuite: testSuite.trim() || "待连接测试资产",
      testCaseCount: Number(testCaseCount) || 0,
      contextAssets: contextAssets.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean),
    });
    setProjectName("");
    setSystemCode("");
    setProjectDescription("");
    setRepositories("");
    setRequirementSource("");
    setHistoricalRequirementCount("0");
    setTestSuite("");
    setTestCaseCount("0");
    setContextAssets("");
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
          className="system-create-form"
          onSubmit={(event) => {
            event.preventDefault();
            createProject();
          }}
        >
          <div className="system-create-heading">
            <div>
              <p className="eyebrow">系统开发上下文</p>
              <strong>新建系统项目</strong>
              <span>把代码、历史需求、测试资产和长期上下文一次连接起来。</span>
            </div>
            <button aria-label="取消新建项目" onClick={() => setIsCreating(false)} type="button">取消</button>
          </div>
          <div className="system-create-grid">
            <label><span>系统名称</span><input aria-label="系统名称" autoFocus onChange={(event) => setProjectName(event.target.value)} placeholder="例如：企业客户门户" value={projectName} /></label>
            <label><span>系统标识</span><input aria-label="系统标识" onChange={(event) => setSystemCode(event.target.value)} placeholder="例如：customer-portal" value={systemCode} /></label>
            <label className="wide"><span>系统说明</span><input aria-label="系统说明" onChange={(event) => setProjectDescription(event.target.value)} placeholder="系统边界、服务对象与核心能力" value={projectDescription} /></label>

            <label className="wide"><span>代码仓库</span><textarea aria-label="代码仓库" onChange={(event) => setRepositories(event.target.value)} placeholder="多个仓库用逗号或换行分隔，例如：portal-web, identity-api, permission-service" value={repositories} /></label>

            <label><span>历史需求空间</span><input aria-label="历史需求空间" onChange={(event) => setRequirementSource(event.target.value)} placeholder="需求平台空间或产品文档库" value={requirementSource} /></label>
            <label><span>累计需求数</span><input aria-label="累计需求数" min="0" onChange={(event) => setHistoricalRequirementCount(event.target.value)} type="number" value={historicalRequirementCount} /></label>

            <label><span>测试资产集</span><input aria-label="测试资产集" onChange={(event) => setTestSuite(event.target.value)} placeholder="测试平台项目或回归测试集" value={testSuite} /></label>
            <label><span>已有测试用例</span><input aria-label="已有测试用例" min="0" onChange={(event) => setTestCaseCount(event.target.value)} type="number" value={testCaseCount} /></label>

            <label className="wide"><span>共享上下文</span><textarea aria-label="共享上下文" onChange={(event) => setContextAssets(event.target.value)} placeholder="知识库、项目记忆、设计规范等，多个项目用逗号或换行分隔" value={contextAssets} /></label>
          </div>
          <div className="system-create-footer">
            <span>创建后，后续每份需求都在这套系统上下文中持续迭代。</span>
            <button className="primary-button" disabled={!projectName.trim()} type="submit">创建系统项目</button>
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
