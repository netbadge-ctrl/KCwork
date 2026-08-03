import {
  ArrowUp,
  Bug,
  ClipboardCheck,
  Code2,
  Database,
  FileCode2,
  FileText,
  FolderOpen,
  GitCompareArrows,
  Image,
  Link2,
  Mic,
  Plus,
  Layers3,
  ShieldCheck,
  Table2,
  TestTube2,
} from "lucide-react";
import { useMemo, useRef, useState, type ComponentType, type FormEvent } from "react";
import type { Agent, Mode, ProductContextReference, Project } from "../lib/types";

export interface ComposerProps {
  mode: Mode;
  agents: Agent[];
  projects: Project[];
  selectedAgentId: string;
  selectedProjectId: string | null;
  onSelectAgent(id: string): void;
  onSelectProject?(id: string | null): void;
  onSend(text: string, contextReference?: ProductContextReference, attachments?: string[]): void;
  variant: "hero" | "task";
  projectSelectionLocked?: boolean;
  disabled?: boolean;
  selectedProductContext?: ProductContextReference | null;
}

type AttachmentOption = {
  id: string;
  label: string;
  detail: string;
  preview: string;
  icon: ComponentType<{ size?: number }>;
};

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
}: ComposerProps) {
  const [text, setText] = useState("");
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const attachmentOptions: AttachmentOption[] = mode === "office"
    ? [
        { id: "office-doc", label: "上传文档", detail: "Word、PDF、PPT", preview: "办公文档", icon: FileText },
        { id: "office-sheet", label: "上传表格", detail: "Excel、CSV", preview: "数据表格", icon: Table2 },
        { id: "office-audio", label: "会议录音", detail: "转写并提炼结论", preview: "会议录音", icon: Mic },
        { id: "office-knowledge", label: "企业文档", detail: "从知识库选择", preview: "企业知识库资料", icon: Database },
      ]
    : selectedAgentId === "product-design"
      ? [
          { id: "product-research", label: "需求与访谈", detail: "历史讨论与调研记录", preview: "需求访谈记录", icon: FileText },
          { id: "product-prototype", label: "历史原型", detail: "选择已有原型页面", preview: "历史原型页面", icon: Image },
          { id: "product-docs", label: "项目文档", detail: "知识库与项目记忆", preview: "项目知识资料", icon: Database },
        ]
      : selectedAgentId === "testing"
        ? [
            { id: "test-spec", label: "需求规格", detail: "Spec 与验收标准", preview: "需求规格", icon: FileCode2 },
            { id: "test-cases", label: "测试用例", detail: "选择测试集或报告", preview: "角色权限回归测试集", icon: TestTube2 },
            { id: "test-evidence", label: "失败证据", detail: "截图、日志与缺陷", preview: "失败证据与日志", icon: Bug },
          ]
        : [
            { id: "dev-code", label: "代码文件 / 目录", detail: "选择当前仓库内容", preview: "permission-service/", icon: Code2 },
            { id: "dev-diff", label: "Commit / Diff", detail: "比较代码变更范围", preview: "当前分支 Diff", icon: GitCompareArrows },
            { id: "dev-spec", label: "需求规格", detail: "PRD、原型与验收标准", preview: "需求规格与验收标准", icon: FileCode2 },
            { id: "dev-log", label: "日志与报错", detail: "粘贴或上传运行证据", preview: "运行日志与报错", icon: Bug },
          ];
  const commonAttachmentOptions: AttachmentOption[] = [
    { id: "upload", label: "上传本地文件", detail: "一次指令临时使用", preview: "本地文件", icon: FolderOpen },
    { id: "link", label: "添加网页链接", detail: "粘贴可访问地址", preview: "网页链接", icon: Link2 },
    { id: "asset", label: "智能资产", detail: "从项目资产中选择", preview: "项目智能资产", icon: Database },
  ];
  const addAttachment = (label: string) => {
    setAttachments((current) => current.includes(label) ? current : [...current, label]);
    setAttachmentMenuOpen(false);
    setLinkInputOpen(false);
  };
  const submitLink = (event: FormEvent) => {
    event.preventDefault();
    if (!linkDraft.trim()) return;
    addAttachment(`链接：${linkDraft.trim()}`);
    setLinkDraft("");
  };

  const submit = () => {
    if (disabled || !text.trim()) return;
    onSend(text.trim(), activeProductContext ?? undefined, attachments);
    setText("");
    setLockedProductContext(null);
    setAttachments([]);
    setAttachmentMenuOpen(false);
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
          <button aria-expanded={attachmentMenuOpen} aria-label="添加本次指令材料" className="plain-tool" disabled={disabled} onClick={() => setAttachmentMenuOpen((open) => !open)} type="button">
            <Plus size={16} />
          </button>
          {attachmentMenuOpen && <div className="attachment-menu">
            <header><b>添加本次指令材料</b><small>{mode === "office" ? "办公资料" : `${agents.find((agent) => agent.id === selectedAgentId)?.name ?? "系统开发"}资料`}</small></header>
            <div className="attachment-option-list">
              {[...attachmentOptions, ...commonAttachmentOptions].map((option) => {
                const Icon = option.icon;
                if (option.id === "upload") return <button key={option.id} onClick={() => fileInputRef.current?.click()} type="button"><Icon size={14} /><span><b>{option.label}</b><small>{option.detail}</small></span></button>;
                if (option.id === "link") return <button key={option.id} onClick={() => setLinkInputOpen(true)} type="button"><Icon size={14} /><span><b>{option.label}</b><small>{option.detail}</small></span></button>;
                return <button key={option.id} onClick={() => addAttachment(option.preview)} type="button"><Icon size={14} /><span><b>{option.label}</b><small>{option.detail}</small></span></button>;
              })}
            </div>
            {linkInputOpen && <form className="attachment-link-form" onSubmit={submitLink}><input aria-label="网页链接" autoFocus onChange={(event) => setLinkDraft(event.target.value)} placeholder="https://…" value={linkDraft} /><button disabled={!linkDraft.trim()} type="submit">添加</button></form>}
            <p>仅作为本次指令输入，不会自动写入项目上下文。</p>
          </div>}
          <input ref={fileInputRef} hidden multiple onChange={(event) => { Array.from(event.target.files ?? []).forEach((file) => addAttachment(file.name)); event.target.value = ""; }} type="file" />
          {attachments.length > 0 && <div className="composer-attachments" aria-label="本次指令材料">{attachments.map((attachment) => <span key={attachment}>{attachment}<button aria-label={`移除${attachment}`} onClick={() => setAttachments((current) => current.filter((item) => item !== attachment))} type="button">×</button></span>)}</div>}
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
