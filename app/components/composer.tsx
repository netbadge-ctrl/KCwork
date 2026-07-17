import {
  ArrowUp,
  FolderOpen,
  Paperclip,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Agent, Mode, Project } from "../lib/types";

export interface ComposerProps {
  mode: Mode;
  agents: Agent[];
  projects: Project[];
  selectedAgentId: string;
  selectedProjectId: string | null;
  onSelectAgent(id: string): void;
  onSelectProject(id: string | null): void;
  onSend(text: string): void;
  variant: "hero" | "task";
}

export function Composer({
  mode,
  agents,
  projects,
  selectedAgentId,
  selectedProjectId,
  onSelectAgent,
  onSelectProject,
  onSend,
  variant,
}: ComposerProps) {
  const [text, setText] = useState("");
  const visibleAgents = useMemo(
    () => agents.filter((agent) => agent.mode === mode || agent.mode === "both"),
    [agents, mode],
  );

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className={`composer ${variant}`}>
      <textarea
        aria-label="任务输入"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={
          mode === "office"
            ? "描述要整理的会议、文档或数据工作…"
            : "描述需求、开发目标或需要分析的问题…"
        }
        value={text}
      />
      <div className="composer-toolbar">
        <div className="composer-controls">
          <button aria-label="添加附件" className="plain-tool" type="button">
            <Paperclip size={16} />
          </button>
          <label className="select-control project-select">
            <FolderOpen size={15} />
            <select
              aria-label="选择项目"
              onChange={(event) => onSelectProject(event.target.value || null)}
              value={selectedProjectId ?? ""}
            >
              <option value="">不关联项目</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className="select-control agent-select">
            <span className="mini-agent" aria-hidden="true">
              {visibleAgents.find((agent) => agent.id === selectedAgentId)
                ?.shortName ?? "智"}
            </span>
            <select
              aria-label="选择 Agent"
              onChange={(event) => onSelectAgent(event.target.value)}
              value={selectedAgentId}
            >
              {visibleAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </label>
          <button className="permission-tool" type="button">
            <ShieldCheck size={15} /> 权限
          </button>
        </div>
        <button aria-label="发送" className="send-button" onClick={submit} type="button">
          <ArrowUp size={17} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
