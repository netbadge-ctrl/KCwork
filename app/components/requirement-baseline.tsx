import { Check, FileCheck2 } from "lucide-react";
import { useState, type Dispatch } from "react";
import type { RequirementBaselineAction, RequirementBaselineState } from "../lib/requirement-baseline";
import type { PreviewKind, Requirement } from "../lib/types";

export function RequirementBaselineStrip({ state, requirement, onOpen }: { state: RequirementBaselineState; requirement: Requirement | null; onOpen(kind: PreviewKind): void }) {
  const confirmed = state.acceptanceItems.filter((item) => item.confirmed).length;
  const isConfirmed = state.specStatus === "confirmed" && state.acceptanceStatus === "confirmed";
  return <section className="requirement-baseline-strip">
    <div className="baseline-heading"><span>需求公共基线</span><small>{requirement?.code ?? "REQ-032"} · 产品、研发、测试共同维护</small></div>
    <div className="baseline-assets">
      <button onClick={() => onOpen("requirement-spec")} type="button"><FileCheck2 size={15} /><span><b>需求规格 {state.specVersion}</b><small className={isConfirmed ? "confirmed" : "draft"}>{confirmed}/{state.acceptanceItems.length} 条验收标准已确认</small></span></button>
    </div>
    <span className="baseline-shared"><Check size={13} />跨环节共享</span>
  </section>;
}

export function RequirementBaselinePanel({ kind, state, dispatch, canEdit, requirement }: { kind: PreviewKind; state: RequirementBaselineState; dispatch: Dispatch<RequirementBaselineAction>; canEdit: boolean; requirement: Requirement | null }) {
  if (!["requirement-spec", "requirement-acceptance"].includes(kind)) return null;
  return <RequirementSpecificationPanel {...{ state, dispatch, canEdit, requirement }} />;
}

type PanelProps = { state: RequirementBaselineState; dispatch: Dispatch<RequirementBaselineAction>; canEdit: boolean; requirement: Requirement | null };

function RequirementSpecificationPanel({ state, dispatch, canEdit, requirement }: PanelProps) {
  const [section, setSection] = useState<"spec" | "acceptance">("spec");
  const confirmed = state.acceptanceItems.filter((item) => item.confirmed).length;
  const combinedStatus = state.specStatus === "confirmed" && state.acceptanceStatus === "confirmed" ? "confirmed" : "draft";
  return <section className="requirement-baseline-panel combined-specification-panel">
    <div className="baseline-panel-context"><span>需求公共基线</span><b>{requirement?.title ?? "角色与成员权限重构"}</b><small>{requirement?.code ?? "REQ-032"} · 跨环节共同编辑</small></div>
    <header className="baseline-panel-heading"><div><h3>需求规格</h3><p>Spec {state.specVersion} · 验收标准 {state.acceptanceVersion} · 最近更新于 10 分钟前</p></div><span className={combinedStatus}>{combinedStatus === "confirmed" ? "已共同确认" : "待共同确认"}</span></header>
    <div className="baseline-source-row"><span>生成依据</span><button type="button">原型 V4</button><button type="button">PRD V3</button><small>修改对同项目全部 Agent 可见</small></div>
    <nav className="baseline-document-tabs" aria-label="需求规格内容">
      <button className={section === "spec" ? "active" : ""} onClick={() => setSection("spec")} type="button">规格正文 <small>{state.specVersion}</small></button>
      <button className={section === "acceptance" ? "active" : ""} onClick={() => setSection("acceptance")} type="button">验收标准 <small>{confirmed}/{state.acceptanceItems.length}</small></button>
    </nav>
    {section === "spec" ? <>
      <label className="spec-shared-editor combined"><span>规格正文</span><textarea disabled={!canEdit} onChange={(event) => dispatch({ type: "edit-spec", body: event.target.value })} value={state.specBody} /></label>
      <div className="baseline-confirm-row"><div><b>{state.specStatus === "confirmed" ? "规格正文已确认" : "规格正文存在待确认修改"}</b><small>确认后生成新版本，不触发流程流转。</small></div><button disabled={!canEdit || state.specStatus === "confirmed"} onClick={() => dispatch({ type: "confirm-spec" })} type="button">确认正文版本</button></div>
    </> : <>
      <div className="acceptance-summary"><strong>{confirmed}/{state.acceptanceItems.length}</strong><span><b>验收项已确认</b><small>每一项都应可由研发自查、测试验证</small></span></div>
      <div className="acceptance-shared-list">{state.acceptanceItems.map((item) => <article className={item.confirmed ? "confirmed" : ""} key={item.id}><button aria-label={`${item.confirmed ? "取消确认" : "确认"}${item.title}`} disabled={!canEdit} onClick={() => dispatch({ type: "toggle-acceptance", id: item.id })} type="button">{item.confirmed && <Check size={13} />}</button><div><header><b>{item.id.toUpperCase()} · {item.title}</b><span>{item.confirmed ? "已确认" : "待确认"}</span></header><textarea disabled={!canEdit} onChange={(event) => dispatch({ type: "edit-acceptance", id: item.id, detail: event.target.value })} value={item.detail} /></div></article>)}</div>
      <div className="baseline-confirm-row"><button className="secondary" disabled={!canEdit} onClick={() => dispatch({ type: "add-acceptance" })} type="button">添加验收项</button><div><b>确认当前验收标准</b><small>与规格正文共同组成需求规格。</small></div><button disabled={!canEdit} onClick={() => dispatch({ type: "confirm-acceptance" })} type="button">确认验收版本</button></div>
    </>}
  </section>;
}
