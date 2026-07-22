import { Check, FileCheck2, ListChecks } from "lucide-react";
import type { Dispatch } from "react";
import type { RequirementBaselineAction, RequirementBaselineState } from "../lib/requirement-baseline";
import type { PreviewKind, Requirement } from "../lib/types";

export function RequirementBaselineStrip({ state, requirement, onOpen }: { state: RequirementBaselineState; requirement: Requirement | null; onOpen(kind: PreviewKind): void }) {
  const confirmed = state.acceptanceItems.filter((item) => item.confirmed).length;
  return <section className="requirement-baseline-strip">
    <div className="baseline-heading"><span>需求公共基线</span><small>{requirement?.code ?? "REQ-032"} · 产品、研发、测试共同维护</small></div>
    <div className="baseline-assets">
      <button onClick={() => onOpen("requirement-spec")} type="button"><FileCheck2 size={15} /><span><b>Spec {state.specVersion}</b><small className={state.specStatus}>{state.specStatus === "confirmed" ? "已确认" : "有待确认修改"}</small></span></button>
      <button onClick={() => onOpen("requirement-acceptance")} type="button"><ListChecks size={15} /><span><b>验收标准 {confirmed}/{state.acceptanceItems.length}</b><small className={state.acceptanceStatus}>{state.acceptanceStatus === "confirmed" ? "已共同确认" : "待共同确认"}</small></span></button>
    </div>
    <span className="baseline-shared"><Check size={13} />跨环节共享</span>
  </section>;
}

export function RequirementBaselinePanel({ kind, state, dispatch, canEdit, requirement }: { kind: PreviewKind; state: RequirementBaselineState; dispatch: Dispatch<RequirementBaselineAction>; canEdit: boolean; requirement: Requirement | null }) {
  if (kind === "requirement-spec") return <SpecPanel {...{ state, dispatch, canEdit, requirement }} />;
  if (kind === "requirement-acceptance") return <AcceptancePanel {...{ state, dispatch, canEdit, requirement }} />;
  return null;
}

type PanelProps = { state: RequirementBaselineState; dispatch: Dispatch<RequirementBaselineAction>; canEdit: boolean; requirement: Requirement | null };

function SharedHeader({ title, version, status, requirement }: { title: string; version: string; status: string; requirement: Requirement | null }) {
  return <><div className="baseline-panel-context"><span>需求公共基线</span><b>{requirement?.code ?? "REQ-032"} · {requirement?.title ?? "角色与成员权限重构"}</b><small>产品、研发、测试共同编辑</small></div><header className="baseline-panel-heading"><div><h3>{title}</h3><p>{version} · 最近更新于 10 分钟前 · 修改对同项目所有 Agent 可见</p></div><span className={status}>{status === "confirmed" ? "已确认" : "待确认"}</span></header></>;
}

function SpecPanel({ state, dispatch, canEdit, requirement }: PanelProps) {
  return <section className="requirement-baseline-panel">
    <SharedHeader requirement={requirement} status={state.specStatus} title="需求 Spec" version={state.specVersion} />
    <div className="baseline-source-row"><span>来源</span><button type="button">原型 V4</button><button type="button">PRD V3</button><small>共同基线不归属于单一 Agent</small></div>
    <label className="spec-shared-editor"><span>Spec 正文</span><textarea disabled={!canEdit} onChange={(event) => dispatch({ type: "edit-spec", body: event.target.value })} value={state.specBody} /></label>
    <div className="baseline-confirm-row"><div><b>{state.specStatus === "confirmed" ? "当前版本已确认" : "存在尚未确认的修改"}</b><small>确认后生成新版本，研发与测试无需重新接收或流转。</small></div><button disabled={!canEdit || state.specStatus === "confirmed"} onClick={() => dispatch({ type: "confirm-spec" })} type="button">确认并生成新版本</button></div>
  </section>;
}

function AcceptancePanel({ state, dispatch, canEdit, requirement }: PanelProps) {
  const confirmed = state.acceptanceItems.filter((item) => item.confirmed).length;
  return <section className="requirement-baseline-panel">
    <SharedHeader requirement={requirement} status={state.acceptanceStatus} title="验收标准" version={state.acceptanceVersion} />
    <div className="acceptance-summary"><strong>{confirmed}/{state.acceptanceItems.length}</strong><span><b>验收项已确认</b><small>每一项都应可由研发自查、测试验证</small></span></div>
    <div className="acceptance-shared-list">{state.acceptanceItems.map((item) => <article className={item.confirmed ? "confirmed" : ""} key={item.id}><button aria-label={`${item.confirmed ? "取消确认" : "确认"}${item.title}`} disabled={!canEdit} onClick={() => dispatch({ type: "toggle-acceptance", id: item.id })} type="button">{item.confirmed && <Check size={13} />}</button><div><header><b>{item.id.toUpperCase()} · {item.title}</b><span>{item.confirmed ? "已确认" : "待确认"}</span></header><textarea disabled={!canEdit} onChange={(event) => dispatch({ type: "edit-acceptance", id: item.id, detail: event.target.value })} value={item.detail} /></div></article>)}</div>
    <div className="baseline-confirm-row"><button className="secondary" disabled={!canEdit} onClick={() => dispatch({ type: "add-acceptance" })} type="button">添加验收项</button><div><b>共同确认当前版本</b><small>确认操作只生成版本，不触发流程流转。</small></div><button disabled={!canEdit} onClick={() => dispatch({ type: "confirm-acceptance" })} type="button">确认全部并生成新版本</button></div>
  </section>;
}
