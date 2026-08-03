import { ArrowRight, Code2, MessageSquareText } from "lucide-react";
import type { Agent, Mode, Project, ProjectRole } from "../lib/types";
import { Composer } from "./composer";

export interface HomeViewProps {
  mode: Mode;
  agents: Agent[];
  projects: Project[];
  selectedAgentId: string;
  selectedProjectId: string | null;
  canEdit: boolean;
  currentRole: ProjectRole;
  onModeChange(mode: Mode): void;
  onSelectAgent(id: string): void;
  onSelectProject(id: string | null): void;
  onSend(text: string): void;
  onOpenProject(id: string): void;
}

export function HomeView(props: HomeViewProps) {
  const visibleAgents = props.agents.filter(
    (agent) => agent.mode === props.mode || agent.mode === "both",
  );

  return (
    <div className="home-view page-scroll">
      <section className="home-hero">
        <p className="eyebrow">企业智能工作空间</p>
        <h1>Hi，今天想推进什么？</h1>
        <p className="hero-subtitle">
          选择一个 Agent 开始任务，项目中的产品、代码与测试上下文会自动连接。
        </p>
        <div className="mode-switch" aria-label="工作场景">
          <button
            className={props.mode === "office" ? "active" : ""}
            onClick={() => props.onModeChange("office")}
            type="button"
          >
            <MessageSquareText size={17} /> 日常办公
          </button>
          <button
            className={props.mode === "research" ? "active" : ""}
            onClick={() => props.onModeChange("research")}
            type="button"
          >
            <Code2 size={17} /> 系统开发
          </button>
        </div>
        {!props.canEdit && props.selectedProjectId && (
          <span className="read-only-notice home-read-only-notice">当前角色仅可查看</span>
        )}
        <Composer {...props} disabled={!props.canEdit} variant="hero" />
      </section>

      <section className="home-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">按需调用</p>
            <h2>{props.mode === "office" ? "办公 Agent" : "系统开发 Agent"}</h2>
          </div>
          <span>每次任务只选择你需要的能力</span>
        </div>
        <div className="agent-card-grid">
          {visibleAgents.map((agent) => (
            <div className="agent-card-slot" key={agent.id}>
              <button
                className={`agent-card ${props.selectedAgentId === agent.id ? "selected" : ""}`}
                onClick={() => props.onSelectAgent(agent.id)}
                type="button"
              >
                <span className="agent-avatar">{agent.shortName}</span>
                <span className="agent-card-copy">
                  <strong>{agent.name}</strong>
                  <small>{agent.description}</small>
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section projects-strip">
        <div className="section-title">
          <div>
            <p className="eyebrow">继续工作</p>
            <h2>最近项目</h2>
          </div>
        </div>
        <div className="project-mini-grid">
          {props.projects.map((project) => (
            <button
              className="project-mini"
              key={project.id}
              onClick={() => props.onOpenProject(project.id)}
              type="button"
            >
              <span className="project-color" style={{ background: project.color }} />
              <span>
                <strong>{project.name}</strong>
                <small>{project.description}</small>
              </span>
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
