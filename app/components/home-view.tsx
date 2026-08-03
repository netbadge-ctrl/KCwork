import { Code2, MessageSquareText } from "lucide-react";
import type { Agent, Mode, Project } from "../lib/types";
import { Composer } from "./composer";

export interface HomeViewProps {
  mode: Mode;
  agents: Agent[];
  projects: Project[];
  selectedAgentId: string;
  selectedProjectId: string | null;
  canEdit: boolean;
  onModeChange(mode: Mode): void;
  onSelectAgent(id: string): void;
  onSelectProject(id: string | null): void;
  onSend(text: string): void;
}

export function HomeView(props: HomeViewProps) {
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
    </div>
  );
}
