import {
  ArrowUp,
  Check,
  ChevronDown,
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
  productContextOptions?: ProductContextReference[];
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
  productContextOptions = [],
  onClearProductContext,
}: ComposerProps) {
  const [text, setText] = useState("");
  const [lockedProductContext, setLockedProductContext] = useState<ProductContextReference | null>(null);
  const [manualProductContext, setManualProductContext] = useState<ProductContextReference | null>(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const visibleAgents = useMemo(
    () => agents.filter((agent) => agent.mode === mode || agent.mode === "both"),
    [agents, mode],
  );
  const baseProductContext = manualProductContext ?? selectedProductContext;
  const activeProductContext = text.trim()
    ? lockedProductContext ?? baseProductContext
    : baseProductContext;
  const contextChangedWhileTyping = Boolean(
    text.trim() &&
    !manualProductContext &&
    lockedProductContext &&
    selectedProductContext &&
    lockedProductContext.label !== selectedProductContext.label,
  );
  const availableProductContexts = useMemo(() => {
    const seen = new Set<string>();
    return productContextOptions.filter((item) => {
      const key = `${item.kind}:${item.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [productContextOptions]);
  const broaderProductContext = selectedProductContext?.kind === "prototype"
    ? availableProductContexts.find((item) => item.kind === "prototype" && !item.componentId) ?? null
    : selectedProductContext?.kind === "prd"
      ? availableProductContexts.find((item) => item.kind === "prd" && !item.sectionId) ?? null
      : null;

  const submit = () => {
    if (disabled || !text.trim()) return;
    onSend(text.trim(), activeProductContext ?? undefined);
    setText("");
    setLockedProductContext(null);
    setIsContextMenuOpen(false);
  };

  const chooseProductContext = (reference: ProductContextReference | null) => {
    setManualProductContext(reference);
    if (text.trim()) setLockedProductContext(reference ?? selectedProductContext);
    setIsContextMenuOpen(false);
  };

  return (
    <div className={`composer ${variant}`}>
      {activeProductContext && (
        <div className="composer-product-reference">
          <Layers3 size={12} />
          <button aria-expanded={isContextMenuOpen} className="composer-reference-trigger" onClick={() => setIsContextMenuOpen((open) => !open)} type="button">
            <span><small>{manualProductContext ? "手动选择" : text.trim() ? "输入中 · 已锁定" : "自动跟随右栏"}</small>{activeProductContext.label}</span>
            <ChevronDown size={12} />
          </button>
          {contextChangedWhileTyping && <button className="composer-reference-switch" onClick={() => setLockedProductContext(selectedProductContext)} type="button">改用当前右栏</button>}
          {isContextMenuOpen && <div className="composer-reference-menu">
            <header><b>指令作用对象</b><small>每条命令都会保留引用</small></header>
            <button className={!manualProductContext ? "active" : ""} onClick={() => chooseProductContext(null)} type="button"><span><b>跟随右栏</b><small>{selectedProductContext?.label ?? "整个需求"}</small></span>{!manualProductContext && <Check size={13} />}</button>
            {availableProductContexts.map((item) => <button className={manualProductContext?.kind === item.kind && manualProductContext.label === item.label ? "active" : ""} key={`${item.kind}-${item.label}`} onClick={() => chooseProductContext(item)} type="button"><span><b>{item.kind === "requirement" ? "整个需求" : item.kind === "prototype" ? "产品原型" : "需求文档"}</b><small>{item.label}</small></span>{manualProductContext?.kind === item.kind && manualProductContext.label === item.label && <Check size={13} />}</button>)}
            {onClearProductContext && broaderProductContext && selectedProductContext?.label !== broaderProductContext.label && <button className="composer-reference-clear" onClick={() => { onClearProductContext(); chooseProductContext(broaderProductContext); }} type="button"><span><b>清除局部选择</b><small>改为 {broaderProductContext.label}</small></span><X size={13} /></button>}
          </div>}
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
