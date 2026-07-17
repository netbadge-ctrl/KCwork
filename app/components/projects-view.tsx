import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Boxes,
  FileText,
  FlaskConical,
  GitBranch,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { Project, RecentTask } from "../lib/types";

export interface ProjectsViewProps {
  projects: Project[];
  selectedProjectId: string | null;
  recentTasks: RecentTask[];
  onOpenProject(id: string): void;
  onBack(): void;
  onStartTask(projectId: string): void;
  onOpenTask(task: RecentTask): void;
}

export function ProjectsView({
  projects,
  selectedProjectId,
  recentTasks,
  onOpenProject,
  onBack,
  onStartTask,
  onOpenTask,
}: ProjectsViewProps) {
  const [query, setQuery] = useState("");
  const project = projects.find((item) => item.id === selectedProjectId);

  if (project) {
    const projectTasks = recentTasks.filter(
      (task) => task.projectId === project.id,
    );
    const contextCards = [
      { label: "产品文档", value: "8 份", icon: FileText, note: "PRD、原型与验收标准" },
      { label: "项目记忆", value: "23 条", icon: BookOpen, note: "人工确认的范围与决策" },
      { label: "代码库", value: "3 个", icon: GitBranch, note: "主仓库与依赖服务" },
      { label: "测试资产", value: "42 项", icon: FlaskConical, note: "用例、报告与缺陷" },
    ];

    return (
      <div className="project-detail page-scroll">
        <header className="page-header detail-header">
          <button className="back-button" onClick={onBack} type="button">
            <ArrowLeft size={17} /> 返回项目
          </button>
          <div className="detail-title-row">
            <div>
              <div className="project-kicker">
                <span style={{ background: project.color }} /> 研发项目
              </div>
              <h1>{project.name}</h1>
              <p>{project.description}</p>
            </div>
            <button
              className="primary-button"
              onClick={() => onStartTask(project.id)}
              type="button"
            >
              <Plus size={16} /> 在此项目中新建任务
            </button>
          </div>
          <div className="project-meta-row">
            <span><Users size={15} /> {project.members} 位成员</span>
            <span><Boxes size={15} /> {project.contextCount} 项共享上下文</span>
            <span>更新于 {project.updatedAt}</span>
          </div>
        </header>

        <section className="content-section">
          <div className="section-title">
            <div>
              <p className="eyebrow">跨任务共用</p>
              <h2>共享项目上下文</h2>
            </div>
            <span>Agent 按权限引用，不改变你的工作方式</span>
          </div>
          <div className="context-grid">
            {contextCards.map(({ label, value, note, icon: Icon }) => (
              <button className="context-card" key={label} type="button">
                <span className="context-icon"><Icon size={19} /></span>
                <span className="context-copy">
                  <strong>{label}</strong>
                  <small>{note}</small>
                </span>
                <b>{value}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="content-section">
          <div className="section-title">
            <div>
              <p className="eyebrow">最近活动</p>
              <h2>项目任务</h2>
            </div>
          </div>
          <div className="task-table">
            {projectTasks.map((task) => (
              <button key={task.id} onClick={() => onOpenTask(task)} type="button">
                <span className="task-status-dot" />
                <span><strong>{task.title}</strong><small>{task.time}</small></span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </section>
      </div>
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
        <button className="primary-button" type="button"><Plus size={16} /> 新建项目</button>
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
