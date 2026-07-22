import { AlertTriangle, ArrowUp, Check, CheckCircle2, Copy, FileText, GitCompareArrows, History, Laptop, LayoutTemplate, ListChecks, Monitor, MoreHorizontal, Plus, RotateCcw, Save, Smartphone, Sparkles, Tablet, Trash2, X } from "lucide-react";
import { useState, type Dispatch } from "react";
import { getProductReadiness, type ProductPackageAction, type ProductPackageState, type PrototypeComponent } from "../lib/product-package";
import type { PreviewKind, ProductContextReference, Requirement } from "../lib/types";

export function ProductPanel({
  kind,
  state,
  dispatch,
  canEdit,
  requirement,
  onScopedSend,
}: {
  kind: PreviewKind;
  state: ProductPackageState;
  dispatch: Dispatch<ProductPackageAction>;
  canEdit: boolean;
  requirement: Requirement | null;
  onScopedSend(reference: ProductContextReference, text: string): void;
}) {
  if (kind === "prototype") return <ProductPrototypePanel {...{ state, dispatch, canEdit, requirement, onScopedSend }} />;
  if (kind === "prd") return <ProductPrdPanel {...{ state, dispatch, canEdit, requirement, onScopedSend }} />;
  if (kind === "delivery-check") return <DeliveryCheckPanel {...{ state, dispatch, canEdit, requirement }} />;
  if (kind === "version-history") return <ProductVersionPanel {...{ state, dispatch, canEdit, requirement }} />;
  return null;
}

type Props = { state: ProductPackageState; dispatch: Dispatch<ProductPackageAction>; canEdit: boolean; requirement: Requirement | null; onScopedSend?: (reference: ProductContextReference, text: string) => void };

function ProductContext({ requirement, state }: { requirement: Requirement | null; state: ProductPackageState }) {
  return <div className="product-panel-context"><span>产品设计 Agent</span><b>{requirement?.code ?? "未关联需求"}</b><small>原型 {state.prototypeVersions.at(-1)?.version} · PRD {state.prdVersions.at(-1)?.version}</small></div>;
}

function ProductPrototypePanel({ state, dispatch, canEdit, requirement, onScopedSend }: Props) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [inspect, setInspect] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [pendingInstruction, setPendingInstruction] = useState("");
  const page = state.pages.find((item) => item.id === state.selectedPageId) ?? state.pages[0];
  const component = page.components.find((item) => item.id === state.selectedComponentId) ?? null;
  const closeInspector = () => {
    setIsInspectorOpen(false);
    setPendingInstruction("");
    dispatch({ type: "select-component", componentId: null });
  };
  return <section className="product-panel prototype-workbench">
    <ProductContext requirement={requirement} state={state} />
    <div className="prototype-command-bar">
      <div><b>{requirement?.title ?? "当前需求"}</b><span>{state.pages.length} 个页面 · 最新 {state.prototypeVersions.at(-1)?.version}</span></div>
      <label className="prototype-page-select"><LayoutTemplate size={14} /><select aria-label="选择原型页面" onChange={(event) => { dispatch({ type: "select-page", pageId: event.target.value }); setIsInspectorOpen(false); }} value={page.id}>{state.pages.map((item) => <option key={item.id} value={item.id}>{item.start ? "首页 · " : ""}{item.name}{item.changed ? " · 本轮修改" : ""}</option>)}</select></label>
      <div className="prototype-page-actions"><button aria-label="新增页面" disabled={!canEdit} onClick={() => { dispatch({ type: "add-page" }); setIsInspectorOpen(false); }} title="新增页面" type="button"><Plus size={14} /></button><button aria-label="复制当前页面" disabled={!canEdit} onClick={() => { dispatch({ type: "copy-page", pageId: page.id }); setIsInspectorOpen(false); }} title="复制页面" type="button"><Copy size={14} /></button><button aria-label="删除当前页面" disabled={!canEdit || state.pages.length <= 1} onClick={() => { dispatch({ type: "delete-page", pageId: page.id }); setIsInspectorOpen(false); }} title="删除页面" type="button"><Trash2 size={14} /></button></div>
      <a href="/prototype?mode=inspect" rel="noreferrer" target="_blank"><Laptop size={14} />浏览器打开</a>
      <button className={inspect ? "active" : ""} onClick={() => { setInspect(!inspect); if (inspect) closeInspector(); }} type="button"><Sparkles size={14} />{inspect ? "可选组件" : "开启组件选择"}</button>
    </div>
    <div className="prototype-workbench-stage">
      <div className="prototype-canvas-column">
        <div className="prototype-canvas-toolbar"><span>{page.route}</span><div><button className="page-start-action" disabled={!canEdit || page.start} onClick={() => dispatch({ type: "set-start-page", pageId: page.id })} type="button">{page.start ? "起始页" : "设为起始页"}</button>{(["desktop", "tablet", "mobile"] as const).map((item) => <button aria-label={item === "desktop" ? "桌面端" : item === "tablet" ? "平板" : "移动端"} className={device === item ? "active" : ""} key={item} onClick={() => setDevice(item)} type="button">{item === "desktop" ? <Monitor size={13} /> : item === "tablet" ? <Tablet size={13} /> : <Smartphone size={13} />}</button>)}</div></div>
        <div className={`product-prototype-canvas ${device}`}>
          <div className="prototype-demo-page">
            <aside><b>KFlow</b><span>概览</span><span className="active">成员与角色</span><span>审计记录</span></aside>
            <main><small>企业客户门户 / 权限设置</small><h3>{page.name}</h3><p>管理项目成员角色及其可访问范围。</p><div className="prototype-demo-card">
              {page.components.length ? page.components.map((item) => <PrototypeElement component={item} inspect={inspect} key={item.id} selected={isInspectorOpen && component?.id === item.id} onSelect={() => { if (!inspect) return; dispatch({ type: "select-component", componentId: item.id }); setIsInspectorOpen(true); setPendingInstruction(""); }} />) : <div className="empty-prototype-page">新页面尚未添加组件<br /><button type="button">让 Agent 生成页面内容</button></div>}
            </div></main>
          </div>
        </div>
        <div className="prototype-version-save"><span>{state.prototypeStatus === "draft" ? "有未保存的组件或页面修改" : `当前 ${state.prototypeVersions.at(-1)?.version} · 已确认`}</span><button disabled={!canEdit || state.prototypeStatus !== "draft"} onClick={() => dispatch({ type: "create-prototype-version", title: `更新${page.name}` })} type="button"><Save size={14} />保存为新版本</button></div>
      </div>
      {isInspectorOpen && component && <aside className="prototype-inspector floating">
        <header><span><Sparkles size={15} /><b>编辑所选组件</b></span><button aria-label="关闭组件编辑" onClick={closeInspector} type="button"><X size={15} /></button></header>
        <div className="selected-component-name"><span>{component.type}</span><b>{component.name}</b><small>{component.specRef ?? "暂未关联 Spec"}</small></div>
        <label>组件文案<input aria-label="组件文案" disabled={!canEdit} onChange={(event) => dispatch({ type: "update-component", patch: { text: event.target.value } })} value={component.text} /></label>
        <label>视觉主色<input disabled={!canEdit} onChange={(event) => dispatch({ type: "update-component", patch: { color: event.target.value } })} type="color" value={component.color} /></label>
        <label>组件状态<select disabled={!canEdit} onChange={(event) => dispatch({ type: "update-component", patch: { state: event.target.value as PrototypeComponent["state"] } })} value={component.state}><option value="default">默认</option><option value="disabled">禁用</option><option value="loading">加载中</option></select></label>
        <label>交互目标<input disabled={!canEdit} onChange={(event) => dispatch({ type: "update-component", patch: { target: event.target.value } })} value={component.target ?? ""} /></label>
        <ScopedArtifactComposer canEdit={canEdit} label={`原型 ${state.prototypeVersions.at(-1)?.version} / ${page.name} / ${component.name}`} onSend={(text) => { setPendingInstruction(text); onScopedSend?.({ kind: "prototype", label: `原型 ${state.prototypeVersions.at(-1)?.version} / ${page.name} / ${component.name}` }, text); }} />
        {pendingInstruction && <div className="scoped-change-preview"><b><GitCompareArrows size={13} />Agent 修改建议</b><p>{pendingInstruction}</p><footer><button onClick={() => setPendingInstruction("")} type="button"><X size={12} />放弃</button><button onClick={() => { dispatch({ type: "update-component", patch: { text: component.text } }); dispatch({ type: "create-prototype-version", title: `调整${component.name}` }); setPendingInstruction(""); }} type="button"><Check size={12} />应用并生成新版本</button></footer></div>}
      </aside>}
    </div>
  </section>;
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
    <div className="prd-editor-layout">
      <nav><b>文档目录</b>{sections.map((item) => <button className={item === selectedSection ? "active" : ""} key={item} onClick={() => setSelectedSection(item)} type="button">{item}</button>)}<div><small>实际引用</small><span>企业产品规范库</span><span>权限域项目记忆</span><span>历史需求 REQ-019</span></div></nav>
      <div className="prd-document-editor"><span className="document-tag">PRD {state.prdVersions.at(-1)?.version}</span>{editing ? <textarea aria-label="PRD 正文" onChange={(event) => dispatch({ type: "set-prd-body", body: event.target.value })} value={state.prdBody} /> : state.prdBody.split("\n").map((line, index) => line.startsWith("##") ? <h4 key={`${line}-${index}`}>{line.replace("## ", "")}</h4> : <p key={`${line}-${index}`}>{line}</p>)}</div>
    </div>
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
  return <div className="scoped-artifact-composer"><header><div><Sparkles size={15} /><span><b>发送到主对话</b><small>右侧只提供精准引用，不创建新会话</small></span></div><em>{label}</em></header><div><textarea disabled={!canEdit} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} placeholder="描述针对当前选择的修改…" value={text} /><button aria-label="发送到主对话" disabled={!canEdit || !text.trim()} onClick={submit} type="button"><ArrowUp size={15} /></button></div></div>;
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
