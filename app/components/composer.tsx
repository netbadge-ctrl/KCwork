import {
  ArrowUp,
  FolderOpen,
  Plus,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Agent, Mode, ProductContextReference, Project } from "../lib/types";

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
  selectedProductContext?: ProductContextReference | null;
  contextCount?: number;
  onOpenContext?(): void;
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
  selectedProductContext = null,
  contextCount,
  onOpenContext,
}: ComposerProps) {
  const [text, setText] = useState("");
  const [lockedProductContext, setLockedProductContext] = useState<ProductContextReference | null>(null);
  const visibleAgents = useMemo(
    () => agents.filter((agent) => agent.mode === mode || agent.mode === "both"),
    [agents, mode],
  );
  const baseProductContext = selectedProductContext;
  const activeProductContext = text.trim()
    ? lockedProductContext ?? baseProductContext
    : baseProductContext;
  const contextChangedWhileTyping = Boolean(
    text.trim() &&
    lockedProductContext &&
    selectedProductContext &&
    lockedProductContext.label !== selectedProductContext.label,
  );
  const actionWords = "修改|更新|补充|完善|生成|同步|写入|调整";
  const prdWords = "PRD|产品文档|需求文档";
  const prototypeWords = "原型|页面|组件";
  const prdTargetScore = (new RegExp(`(?:${actionWords}).{0,12}(?:${prdWords})`, "i").test(text) ? 2 : 0) + (new RegExp(`(?:${prdWords}).{0,8}(?:${actionWords})`, "i").test(text) ? 1 : 0);
  const prototypeTargetScore = (new RegExp(`(?:${actionWords}).{0,12}(?:${prototypeWords})`, "i").test(text) ? 2 : 0) + (new RegExp(`(?:${prototypeWords}).{0,8}(?:${actionWords})`, "i").test(text) ? 1 : 0);
  const languageTarget = prdTargetScore > prototypeTargetScore ? "prd" : prototypeTargetScore > prdTargetScore ? "prototype" : null;
  const languageOverridesContext = languageTarget && activeProductContext && activeProductContext.kind !== languageTarget;
  const showProjectControl = variant === "hero";
  const starterPrompts = mode === "office"
    ? ["整理会议记录并提炼待办", "分析表格数据中的异常", "根据资料生成汇报提纲"]
    : ["梳理一个新需求并形成产品方案", "分析代码库并定位问题影响范围", "根据需求补充测试场景"];

  const submit = () => {
    if (disabled || !text.trim()) return;
    onSend(text.trim(), activeProductContext ?? undefined);
    setText("");
    setLockedProductContext(null);
  };

  return (
    <div className={`composer ${variant}`}>
      {activeProductContext && (
        <div className="composer-product-reference">
          <Layers3 size={12} />
          <span><small>{text.trim() ? "本条指令将基于 · 已锁定" : "Agent 当前会基于 · 自动跟随"}</small><b>{activeProductContext.label}</b></span>
          {languageOverridesContext && <span className="composer-language-route">已识别：将修改 {languageTarget === "prd" ? "PRD" : "原型"}</span>}
          {contextChangedWhileTyping && <button className="composer-reference-switch" onClick={() => setLockedProductContext(selectedProductContext)} type="button">改用当前右栏</button>}
        </div>
      )}
      <textarea
        aria-label="任务输入"
        disabled={disabled}
        onChange={(event) => {
          const nextText = event.target.value;
          if (!text.trim() && nextText.trim()) setLockedProductContext(baseProductContext);
          if (!nextText.trim()) setLockedProductContext(null);
          setText(nextText);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={
          activeProductContext
            ? `描述对「${activeProductContext.label}」的修改…`
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
          {showProjectControl && (projectSelectionLocked ? (
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
          ))}
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
          <button className="permission-tool" disabled={disabled} type="button">
            <ShieldCheck size={15} /> 权限
          </button>
          {variant === "task" && onOpenContext && (
            <button
              aria-label={`查看本次会话引用的 ${contextCount ?? 0} 项上下文`}
              className="composer-context-control"
              onClick={onOpenContext}
              type="button"
            >
              <Layers3 size={14} /> {contextCount ?? 0} 项上下文
            </button>
          )}
        </div>
        <button aria-label="发送" className="send-button" disabled={disabled || !text.trim()} onClick={submit} type="button">
          <ArrowUp size={17} strokeWidth={2.2} />
        </button>
      </div>
      {variant === "hero" && !text.trim() && (
        <div className="starter-prompts" aria-label="任务示例">
          <span>试试这样开始</span>
          {starterPrompts.map((prompt) => (
            <button disabled={disabled} key={prompt} onClick={() => setText(prompt)} type="button">
              {prompt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
