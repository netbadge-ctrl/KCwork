import { AlertTriangle, ArrowUp, Bell, Check, CheckCircle2, ChevronDown, CircleCheck, Copy, FileText, GitCompareArrows, History, Laptop, LayoutDashboard, LayoutTemplate, Link2, ListChecks, Monitor, MoreHorizontal, Plus, RotateCcw, Save, Search, Share2, ShieldCheck, SlidersHorizontal, Smartphone, Sparkles, Tablet, Trash2, UserPlus, Users, X } from "lucide-react";
import { useState, type Dispatch } from "react";
import { getProductReadiness, type ProductPackageAction, type ProductPackageState, type PrototypeComponent } from "../lib/product-package";
import { PrdDocumentSheet } from "./prd-document-sheet";
import type { PreviewKind, ProductContextReference, Requirement } from "../lib/types";

export function ProductPanel({
  kind,
  state,
  dispatch,
  canEdit,
  requirement,
  onScopedSend,
  prototypeInspect = true,
  onPrototypeInspectChange = () => undefined,
}: {
  kind: PreviewKind;
  state: ProductPackageState;
  dispatch: Dispatch<ProductPackageAction>;
  canEdit: boolean;
  requirement: Requirement | null;
  onScopedSend(reference: ProductContextReference, text: string): void;
  prototypeInspect?: boolean;
  onPrototypeInspectChange?(value: boolean): void;
}) {
  if (kind === "prototype") return <ProductPrototypePanel {...{ state, dispatch, canEdit, requirement, onScopedSend, prototypeInspect, onPrototypeInspectChange }} />;
  if (kind === "prd") return <ProductPrdPanel {...{ state, dispatch, canEdit, requirement, onScopedSend }} />;
  if (kind === "delivery-check") return <DeliveryCheckPanel {...{ state, dispatch, canEdit, requirement }} />;
  if (kind === "version-history") return <ProductVersionPanel {...{ state, dispatch, canEdit, requirement }} />;
  return null;
}

type Props = { state: ProductPackageState; dispatch: Dispatch<ProductPackageAction>; canEdit: boolean; requirement: Requirement | null; onScopedSend?: (reference: ProductContextReference, text: string) => void; prototypeInspect?: boolean; onPrototypeInspectChange?: (value: boolean) => void };

export function PrototypeHeaderControls({ state, dispatch, canEdit, inspect, onInspectChange }: { state: ProductPackageState; dispatch: Dispatch<ProductPackageAction>; canEdit: boolean; inspect: boolean; onInspectChange(value: boolean): void }) {
  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareScope, setShareScope] = useState("project");
  const [copied, setCopied] = useState(false);
  const page = state.pages.find((item) => item.id === state.selectedPageId) ?? state.pages[0];
  const shareLink = `https://prototype.kflow.work/share/req-032/${state.prototypeVersions.at(-1)?.version.toLowerCase() ?? "latest"}`;
  const copyShareLink = async () => {
    try {
      await navigator.clipboard?.writeText(shareLink);
    } finally {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };
  return <div className="prototype-header-controls">
    <div className="prototype-page-menu">
      <div className="prototype-page-title-control">
        <button aria-expanded={isPageMenuOpen} className="prototype-page-trigger" onClick={() => setIsPageMenuOpen((open) => !open)} type="button"><LayoutTemplate size={14} /><span>{page.start && <i>首页</i>}<b>{page.name}</b><small>{state.pages.length} 个页面 · {state.prototypeVersions.at(-1)?.version}</small></span><ChevronDown size={14} /></button>
        <div className="prototype-page-title-actions"><button aria-label="新增页面" disabled={!canEdit} onClick={() => { dispatch({ type: "add-page" }); setIsPageMenuOpen(false); }} title="新增页面" type="button"><Plus size={13} /></button><button aria-label={`复制${page.name}`} disabled={!canEdit} onClick={() => { dispatch({ type: "copy-page", pageId: page.id }); setIsPageMenuOpen(false); }} title="复制当前页面" type="button"><Copy size={13} /></button><button aria-label={`删除${page.name}`} disabled={!canEdit || state.pages.length <= 1} onClick={() => { dispatch({ type: "delete-page", pageId: page.id }); setIsPageMenuOpen(false); }} title="删除当前页面" type="button"><Trash2 size={13} /></button></div>
      </div>
      {isPageMenuOpen && <div className="prototype-page-popover"><header><b>切换页面</b></header>{state.pages.map((item) => <article className={item.id === page.id ? "active" : ""} key={item.id}><button className="page-select-row" onClick={() => { dispatch({ type: "select-page", pageId: item.id }); setIsPageMenuOpen(false); }} type="button"><span>{item.start ? <Monitor size={13} /> : <LayoutTemplate size={13} />}<b>{item.name}</b>{item.changed && <i>本轮</i>}</span><small>{item.route}</small></button></article>)}</div>}
    </div>
    <div className="prototype-toolbar-actions">
      <a href="/prototype?mode=inspect" rel="noreferrer" target="_blank"><Laptop size={14} />浏览器打开</a>
      <button aria-pressed={inspect} className={inspect ? "active" : ""} onClick={() => { onInspectChange(!inspect); if (inspect) dispatch({ type: "select-component", componentId: null }); }} type="button"><Sparkles size={14} />{inspect ? "退出选择" : "组件可选"}</button>
      <div className="prototype-share">
        <button aria-expanded={isShareOpen} className={isShareOpen ? "active" : ""} onClick={() => setIsShareOpen((open) => !open)} type="button"><Share2 size={14} />分享</button>
        {isShareOpen && <div className="prototype-share-popover">
          <header><span><Share2 size={14} /><b>分享当前原型</b></span><button aria-label="关闭分享面板" onClick={() => setIsShareOpen(false)} type="button"><X size={13} /></button></header>
          <p>{page.name} · {state.prototypeVersions.at(-1)?.version}，分享后可直接在线预览。</p>
          <label>访问范围<select onChange={(event) => setShareScope(event.target.value)} value={shareScope}><option value="project">项目成员</option><option value="company">企业内成员</option><option value="invited">仅受邀成员</option></select></label>
          <div className="prototype-share-link"><Link2 size={13} /><input aria-label="原型分享链接" readOnly value={shareLink} /><button onClick={copyShareLink} type="button">{copied ? <><Check size={12} />已复制</> : "复制链接"}</button></div>
          <small>链接固定到当前版本；后续版本不会覆盖此预览。</small>
        </div>}
      </div>
    </div>
  </div>;
}

function ProductContext({ requirement, state }: { requirement: Requirement | null; state: ProductPackageState }) {
  return <div className="product-panel-context"><span>产品设计 Agent</span><b>{requirement?.code ?? "未关联需求"}</b><small>原型 {state.prototypeVersions.at(-1)?.version} · PRD {state.prdVersions.at(-1)?.version}</small></div>;
}

function ProductPrototypePanel({ state, dispatch, canEdit, onScopedSend, prototypeInspect = true }: Props) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const page = state.pages.find((item) => item.id === state.selectedPageId) ?? state.pages[0];
  const component = page.components.find((item) => item.id === state.selectedComponentId) ?? null;
  const closeInspector = () => {
    setIsInspectorOpen(false);
    dispatch({ type: "set-pending-instruction", instruction: "" });
    dispatch({ type: "select-component", componentId: null });
  };
  return <section className="product-panel prototype-workbench">
    <div className="prototype-workbench-stage">
      <div className="prototype-canvas-column">
        <div className="prototype-canvas-toolbar"><span>{page.route}</span><div><button className="page-start-action" disabled={!canEdit || page.start} onClick={() => dispatch({ type: "set-start-page", pageId: page.id })} type="button">{page.start ? "起始页" : "设为起始页"}</button>{(["desktop", "tablet", "mobile"] as const).map((item) => <button aria-label={item === "desktop" ? "桌面端" : item === "tablet" ? "平板" : "移动端"} className={device === item ? "active" : ""} key={item} onClick={() => setDevice(item)} type="button">{item === "desktop" ? <Monitor size={13} /> : item === "tablet" ? <Tablet size={13} /> : <Smartphone size={13} />}</button>)}</div></div>
        <div className={`product-prototype-canvas ${device}`}>
          <PrototypeDemoPage inspect={prototypeInspect} page={page} selectedComponentId={isInspectorOpen ? component?.id ?? null : null} onSelect={(item) => { if (!prototypeInspect) return; dispatch({ type: "select-component", componentId: item.id }); setIsInspectorOpen(true); dispatch({ type: "set-pending-instruction", instruction: "" }); }} />
        </div>
        <div className="prototype-version-save"><span>{state.prototypeStatus === "draft" ? "有未保存的组件或页面修改" : `当前 ${state.prototypeVersions.at(-1)?.version} · 已确认`}</span><button disabled={!canEdit || state.prototypeStatus !== "draft"} onClick={() => dispatch({ type: "create-prototype-version", title: `更新${page.name}` })} type="button"><Save size={14} />保存为新版本</button></div>
      </div>
      {isInspectorOpen && component && <aside className="prototype-inspector floating">
        <header><span><Sparkles size={15} /><b>编辑所选组件</b></span><button aria-label="关闭组件编辑" onClick={closeInspector} type="button"><X size={15} /></button></header>
        <div className="selected-component-name"><span>{component.type}</span><b>{component.name}</b><small>{component.specRef ?? "暂未关联 Spec"}</small></div>
        <label className="inspector-field-wide">组件文案<input aria-label="组件文案" disabled={!canEdit} onChange={(event) => dispatch({ type: "update-component", patch: { text: event.target.value } })} value={component.text} /></label>
        <label>视觉主色<input disabled={!canEdit} onChange={(event) => dispatch({ type: "update-component", patch: { color: event.target.value } })} type="color" value={component.color} /></label>
        <label>组件状态<select disabled={!canEdit} onChange={(event) => dispatch({ type: "update-component", patch: { state: event.target.value as PrototypeComponent["state"] } })} value={component.state}><option value="default">默认</option><option value="disabled">禁用</option><option value="loading">加载中</option></select></label>
        <label className="inspector-field-wide">交互目标<input disabled={!canEdit} onChange={(event) => dispatch({ type: "update-component", patch: { target: event.target.value } })} value={component.target ?? ""} /></label>
        <ScopedArtifactComposer canEdit={canEdit} label={`原型 ${state.prototypeVersions.at(-1)?.version} / ${page.name} / ${component.name}`} onSend={(text) => { dispatch({ type: "set-pending-instruction", instruction: text }); onScopedSend?.({ kind: "prototype", label: `原型 ${state.prototypeVersions.at(-1)?.version} / ${page.name} / ${component.name}` }, text); }} />
        {state.pendingInstruction && <div className="scoped-change-preview"><b><GitCompareArrows size={13} />Agent 修改建议</b><p>{state.pendingInstruction}</p><footer><button onClick={() => dispatch({ type: "set-pending-instruction", instruction: "" })} type="button"><X size={12} />放弃</button><button onClick={() => { dispatch({ type: "update-component", patch: { text: component.text } }); dispatch({ type: "create-prototype-version", title: `调整${component.name}` }); dispatch({ type: "set-pending-instruction", instruction: "" }); }} type="button"><Check size={12} />应用并生成新版本</button></footer></div>}
      </aside>}
    </div>
  </section>;
}

function PrototypeDemoPage({ page, inspect, selectedComponentId, onSelect }: { page: ProductPackageState["pages"][number]; inspect: boolean; selectedComponentId: string | null; onSelect(component: PrototypeComponent): void }) {
  const title = page.components.find((item) => item.type === "text");
  const editable = page.components.filter((item) => item.type !== "text" && item.type !== "navigation");
  const titleNode = title ? <PrototypeElement component={title} inspect={inspect} selected={selectedComponentId === title.id} onSelect={() => onSelect(title)} /> : <h3>{page.name}</h3>;
  return <div className="prototype-demo-page refined">
    <aside className="prototype-demo-sidebar">
      <div className="prototype-brand"><span>N</span><b>Nimbus</b></div>
      <nav><button type="button"><LayoutDashboard size={14} />概览</button><button className="active" type="button"><Users size={14} />成员与权限</button><button type="button"><ShieldCheck size={14} />安全策略</button><button type="button"><History size={14} />审计日志</button></nav>
      <div className="prototype-team-switch"><span>CP</span><p><b>客户门户</b><small>企业版</small></p></div>
    </aside>
    <section className="prototype-demo-shell">
      <header className="prototype-demo-topbar"><label><Search size={13} /><span>搜索成员、角色或策略</span><kbd>⌘ K</kbd></label><button type="button"><Bell size={14} /></button><span className="prototype-user-avatar">陈</span></header>
      <main className="prototype-demo-content">
        <div className="prototype-demo-heading"><div><small>Workspace / Access control</small>{titleNode}<p>管理成员访问权限、角色策略与高风险变更。</p></div><button className="prototype-invite" type="button"><UserPlus size={13} />邀请成员</button></div>
        <div className="prototype-demo-metrics"><article><span><Users size={14} /></span><p><small>项目成员</small><b>128</b><em>本月 +8</em></p></article><article><span><ShieldCheck size={14} /></span><p><small>自定义角色</small><b>6</b><em>2 个已锁定</em></p></article><article><span><CircleCheck size={14} /></span><p><small>策略覆盖</small><b>96%</b><em>3 项待确认</em></p></article></div>
        <div className="prototype-demo-grid">
          <section className="prototype-member-card"><header><div><b>成员目录</b><small>最近 30 天有活动的成员</small></div><button type="button"><SlidersHorizontal size={12} />筛选</button></header><div className="prototype-member-head"><span>成员</span><span>角色</span><span>状态</span><span /></div>{[["陈楠", "chennan@company.com", "项目管理员", "在线"], ["林川", "linchuan@company.com", "研发成员", "在线"], ["周祺", "zhouqi@company.com", "观察者", "2 小时前"]].map(([name, email, role, status], index) => <div className="prototype-member-row" key={email}><span className={`prototype-member-avatar tone-${index}`}>{name.slice(0, 1)}</span><p><b>{name}</b><small>{email}</small></p><span className="prototype-role-pill">{role}</span><span className={status === "在线" ? "online" : ""}>{status}</span><button type="button"><MoreHorizontal size={13} /></button></div>)}</section>
          <aside className="prototype-policy-card"><header><span><ShieldCheck size={14} /></span><div><b>{page.id === "role-edit" ? "角色配置" : "本轮权限调整"}</b><small>{editable.length ? `${editable.length} 个可编辑组件` : "权限状态概览"}</small></div></header>{editable.length ? <div className="prototype-demo-card">{editable.map((item) => <PrototypeElement component={item} inspect={inspect} key={item.id} selected={selectedComponentId === item.id} onSelect={() => onSelect(item)} />)}</div> : <div className="prototype-policy-summary"><p><Check size={12} />管理员可管理成员</p><p><Check size={12} />观察者保持只读</p><p><Check size={12} />批量操作写入审计</p></div>}<footer><span>更新于 10 分钟前</span><button type="button">查看策略</button></footer></aside>
        </div>
      </main>
    </section>
  </div>;
}

function PrototypeElement({ component, inspect, selected, onSelect }: { component: PrototypeComponent; inspect: boolean; selected: boolean; onSelect(): void }) {
  const className = `prototype-element ${component.type} ${inspect ? "inspectable" : ""} ${selected ? "selected" : ""}`;
  if (component.type === "button") return <button className={className} disabled={component.state === "disabled"} onClick={onSelect} style={{ background: component.color }} type="button">{component.state === "loading" ? "处理中…" : component.text}</button>;
  if (component.type === "input") return <button className={className} onClick={onSelect} type="button"><span>{component.name}</span><b>{component.text}</b></button>;
  if (component.type === "dialog") return <button className={className} onClick={onSelect} type="button"><AlertTriangle size={15} /><span>{component.text}</span><small>取消　确认</small></button>;
  if (component.type === "table") return <button className={className} onClick={onSelect} type="button"><span>{component.text}</span><small>查看　编辑　管理成员</small></button>;
  return <button className={className} onClick={onSelect} type="button">{component.text}</button>;
}

function ProductPrdPanel({ state, dispatch, canEdit, requirement, onScopedSend }: Props) {
  const [editing, setEditing] = useState(false);
  const sections = ["1. 背景与目标", "2. 产品范围", "3. 核心方案", "4. 权限规则", "5. 异常处理"];
  const [selectedSection, setSelectedSection] = useState(sections[2]);
  return <section className="product-panel prd-workbench">
    <ProductContext requirement={requirement} state={state} />
    <div className="product-panel-heading"><div><span>产品需求文档</span><h3>{requirement?.title ?? "角色与成员权限重构"}</h3><p>PRD {state.prdVersions.at(-1)?.version} · 关联原型 {state.prototypeVersions.at(-1)?.version} · 引用 {state.knowledgeIds.length} 项项目知识</p></div><button disabled={!canEdit} onClick={() => setEditing(!editing)} type="button">{editing ? "完成编辑" : "直接编辑"}</button></div>
    <div className="prd-anchor-strip">{sections.map((item) => <button className={item === selectedSection ? "active" : ""} key={item} onClick={() => setSelectedSection(item)} type="button">{item}</button>)}</div>
    <div className="prd-document-scroll"><PrdDocumentSheet title={requirement?.title ?? "角色与成员权限重构"} meta={`${requirement?.code ?? ""} · Spec ${requirement?.specVersion ?? ""} · PRD ${state.prdVersions.at(-1)?.version ?? ""}`} body={state.prdBody} editable={editing} onChange={(body) => dispatch({ type: "set-prd-body", body })} /></div>
    <div className="prd-natural-revision"><ScopedArtifactComposer canEdit={canEdit} label={`PRD ${state.prdVersions.at(-1)?.version} / ${selectedSection}`} onSend={(text) => { dispatch({ type: "set-prd-revision", revision: text }); onScopedSend?.({ kind: "prd", label: `PRD ${state.prdVersions.at(-1)?.version} / ${selectedSection}` }, text); }} />{state.prdRevision && <div className="prd-revision-preview"><b><GitCompareArrows size={14} />Agent 已生成待确认修订</b><p>将在“{selectedSection}”中补充：{state.prdRevision}</p><footer><button onClick={() => dispatch({ type: "set-prd-revision", revision: "" })} type="button">放弃</button><button onClick={() => dispatch({ type: "confirm-prd-revision" })} type="button">确认并生成新版本</button></footer></div>}</div>
  </section>;
}

function ScopedArtifactComposer({ canEdit, label, onSend }: { canEdit: boolean; label: string; onSend(text: string): void }) {
  const [text, setText] = useState("");
  const submit = () => {
    if (!canEdit || !text.trim()) return;
    onSend(text.trim());
    setText("");
  };
  return (
    <div className="composer scoped-composer">
      <div className="composer-product-reference scoped-reference">
        当前引用：{label}
      </div>
      <textarea
        aria-label="精准引用修改要求"
        disabled={!canEdit}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }}
        placeholder="描述针对当前选择的修改…"
        value={text}
      />
      <div className="composer-toolbar">
        <div className="composer-controls">
          <span className="scoped-ref-tag">精准引用</span>
        </div>
        <button aria-label="发送到主对话" className="send-button" disabled={!canEdit || !text.trim()} onClick={submit} type="button">
          <ArrowUp size={15} />
        </button>
      </div>
    </div>
  );
}

function DeliveryCheckPanel({ state, dispatch, canEdit, requirement }: Props) {
  const readiness = getProductReadiness(state);
  const artifacts = [["原型", state.prototypeStatus, state.prototypeVersions.at(-1)?.version], ["PRD", state.prdStatus, state.prdVersions.at(-1)?.version]] as const;
  return <section className="product-panel delivery-check-panel">
    <ProductContext requirement={requirement} state={state} />
    <div className="product-panel-heading"><div><span>产品交付检查</span><h3>原型与 PRD 是否已经具备？</h3><p>这里只检查产品交付物；Spec 与验收标准在需求公共基线中共同维护。</p></div><strong>{readiness.complete ? "完整" : `${2 - readiness.missing.length}/2`}</strong></div>
    <div className="delivery-artifact-list">{artifacts.map(([name, status, version]) => <article key={name}>{status === "confirmed" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}<div><b>{name}</b><small>{status === "confirmed" ? `${version} · 内容已确认` : `${version} · 可继续完善`}</small></div><span className={status}>{status === "confirmed" ? "可用" : status === "missing" ? "缺失" : "调整中"}</span></article>)}</div>
    <div className="conflict-section"><header><b>原型与 PRD 一致性</b><span>{state.conflicts.filter((item) => item.status === "open").length} 项待处理</span></header>{state.conflicts.map((item) => <article className={item.status} key={item.id}>{item.status === "resolved" ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}<div><b>{item.title}</b><p><span>原型：{item.prototypeValue}</span><span>PRD：{item.prdValue}</span></p></div>{item.status === "open" ? <div className="conflict-actions"><button disabled={!canEdit} onClick={() => dispatch({ type: "resolve-conflict", conflictId: item.id, resolution: "prototype" })} type="button">以原型为准</button><button disabled={!canEdit} onClick={() => dispatch({ type: "resolve-conflict", conflictId: item.id, resolution: "prd" })} type="button">以 PRD 为准</button><button disabled={!canEdit} onClick={() => dispatch({ type: "resolve-conflict", conflictId: item.id, resolution: "both" })} type="button">同时修订</button></div> : <span>已处理</span>}</article>)}</div>
    <div className={`product-completion-card ${state.productStatus}`}><div><Check size={19} /><span><b>{state.productStatus === "adjusting" ? "产品调整中" : "产品已标记完成"}</b><small>{state.productStatus === "complete-incomplete" ? `仍缺少${readiness.missing.join("、")}，同项目研发与测试已可见` : state.productStatus === "complete" ? "原型与 PRD 已具备，同项目研发与测试已可见" : "可随时完成，缺失项只作为风险提示"}</small></span></div><button disabled={!canEdit} onClick={() => dispatch({ type: state.productStatus === "adjusting" ? "mark-product-complete" : "reopen-product" })} type="button">{state.productStatus === "adjusting" ? "标记需求完成" : "重新进入产品调整"}</button></div>
  </section>;
}

function ProductVersionPanel({ state, dispatch, canEdit, requirement }: Props) {
  const [tab, setTab] = useState<"prototype" | "prd">("prototype");
  const entries = tab === "prototype" ? state.prototypeVersions : state.prdVersions;
  return <section className="product-panel product-version-panel">
    <ProductContext requirement={requirement} state={state} />
    <div className="product-panel-heading"><div><span>版本记录</span><h3>每次执行都有来源，可以比较和恢复</h3><p>回退不会删除后续版本，而是创建一个新的当前版本。</p></div></div>
    <div className="version-tabs"><button className={tab === "prototype" ? "active" : ""} onClick={() => setTab("prototype")} type="button"><LayoutTemplate size={14} />原型版本</button><button className={tab === "prd" ? "active" : ""} onClick={() => setTab("prd")} type="button"><FileText size={14} />PRD 版本</button></div>
    <div className="version-timeline">{[...entries].reverse().map((entry, index) => <article className={index === 0 ? "current" : ""} key={entry.id}><span className="version-node"><History size={15} /></span><div><header><b>{entry.version} · {entry.title}</b>{index === 0 && <span>当前</span>}</header><p>{entry.time} · {tab === "prototype" ? `${"affected" in entry ? entry.affected.join("、") : ""}` : `关联原型 ${"prototypeVersion" in entry ? entry.prototypeVersion : ""}`}</p><div><button type="button">预览</button><button type="button">与当前比较</button>{index > 0 && <button disabled={!canEdit} onClick={() => dispatch(tab === "prototype" ? { type: "rollback-prototype", versionId: entry.id } : { type: "rollback-prd", versionId: entry.id })} type="button"><RotateCcw size={12} />回退到 {entry.version}</button>}</div></div></article>)}</div>
  </section>;
}
