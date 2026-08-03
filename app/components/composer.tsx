import {
  ArrowUp,
  FolderOpen,
  Plus,
  Layers3,
  ShieldCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Agent, Mode, ProductContextReference, ProductWorkMode, Project } from "../lib/types";
import { ProductModePicker } from "./product-mode-picker";

export interface ComposerProps {
  mode: Mode;
  agents: Agent[];
  projects: Project[];
  selectedAgentId: string;
  selectedProjectId: string | null;
  onSelectAgent(id: string): void;
  onSelectProject?(id: string | null): void;
  onSend(text: string, contextReference?: ProductContextReference): void;
  variant: "hero" | "task";
  projectSelectionLocked?: boolean;
  disabled?: boolean;
  productWorkMode?: ProductWorkMode;
  onProductWorkModeChange?(mode: ProductWorkMode): void;
  selectedProductContext?: ProductContextReference | null;
  onClearProductContext?(): void;
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
  projectSelectionLocked = false,
  disabled = false,
  productWorkMode,
  onProductWorkModeChange,
  selectedProductContext = null,
  onClearProductContext,
}: ComposerProps) {
  const [text, setText] = useState("");
  const visibleAgents = useMemo(
    () => agents.filter((agent) => agent.mode === mode || agent.mode === "both"),
    [agents, mode],
  );

  const submit = () => {
    if (disabled || !text.trim()) return;
    onSend(text.trim(), selectedProductContext ?? undefined);
    setText("");
  };

  return (
    <div className={`composer ${variant}`}>
      {selectedProductContext && (
        <div className="composer-product-reference">
          <Layers3 size={12} />
          <span><small>当前引用</small>{selectedProductContext.label}</span>
          {onClearProductContext && <button aria-label="移除当前引用" onClick={onClearProductContext} type="button"><X size={12} /></button>}
        </div>
      )}
      <textarea
        aria-label="任务输入"
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={
          selectedProductContext
            ? `描述对「${selectedProductContext.label}」的修改…`
            : mode === "office"
            ? "描述要整理的会议、文档或数据工作…"
            : "描述需求、开发目标或需要分析的问题…"
        }
        value={text}
      />
      <div className="composer-toolbar">
        <div className="composer-controls">
          <button aria-label="添加附件" className="plain-tool" disabled={disabled} type="button">
            <Plus size={16} />
          </button>
          {projectSelectionLocked ? (
            <span className="locked-project-control" aria-label="需求关联项目">
              <FolderOpen size={15} /> 已关联项目：{projects.find((project) => project.id === selectedProjectId)?.name ?? "未找到项目"}
            </span>
          ) : (
            <label className="select-control project-select">
              <FolderOpen size={15} />
              <select
                aria-label="选择项目"
                disabled={disabled}
                onChange={(event) => onSelectProject?.(event.target.value || null)}
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
          )}
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
          {selectedAgentId === "product-design" && productWorkMode && onProductWorkModeChange && (
            <ProductModePicker
              value={productWorkMode}
              onChange={onProductWorkModeChange}
              variant="compact"
            />
          )}
          <button className="permission-tool" disabled={disabled} type="button">
            <ShieldCheck size={15} /> 权限
          </button>
        </div>
        <button aria-label="发送" className="send-button" disabled={disabled || !text.trim()} onClick={submit} type="button">
          <ArrowUp size={17} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
