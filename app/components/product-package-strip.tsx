import { AlertTriangle, Check, FileText, LayoutTemplate, PackageCheck, RotateCcw, X } from "lucide-react";
import { useState, type Dispatch } from "react";
import { getProductReadiness, type ProductPackageAction, type ProductPackageState } from "../lib/product-package";
import type { PreviewKind } from "../lib/types";

const artifactLabel = {
  missing: "未生成",
  draft: "调整中",
  confirmed: "已确认",
  stale: "需更新",
};

export function ProductPackageStrip({
  state,
  canEdit,
  dispatch,
  onOpen,
}: {
  state: ProductPackageState;
  canEdit: boolean;
  dispatch: Dispatch<ProductPackageAction>;
  onOpen(kind: PreviewKind): void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const readiness = getProductReadiness(state);
  const artifacts = [
    { label: "原型", icon: LayoutTemplate, status: state.prototypeStatus, version: state.prototypeVersions.at(-1)?.version, kind: "prototype" as PreviewKind },
    { label: "PRD", icon: FileText, status: state.prdStatus, version: state.prdVersions.at(-1)?.version, kind: "prd" as PreviewKind },
  ];
  return <>
    <section aria-label="需求包状态" className="product-package-strip">
      <div className="package-strip-heading"><PackageCheck size={16} /><span>产品需求包</span><small>{state.lastChange}</small></div>
      <div className="package-artifacts">
        {artifacts.map(({ label, icon: Icon, status, version, kind }) => <button key={label} onClick={() => onOpen(kind)} type="button"><Icon size={14} /><span><b>{label} {version}</b><small className={status}>{artifactLabel[status]}</small></span></button>)}
      </div>
      <button className={`package-complete-action ${state.productStatus}`} disabled={!canEdit} onClick={() => state.productStatus === "adjusting" ? setShowConfirm(true) : dispatch({ type: "reopen-product" })} type="button">
        {state.productStatus === "adjusting" ? <><Check size={14} />标记需求完成</> : <><RotateCcw size={14} />重新进入产品调整</>}
      </button>
    </section>
    {showConfirm && <div aria-label="确认产品需求完成" aria-modal="true" className="package-confirm-backdrop" role="dialog">
      <div className="package-confirm-dialog">
        <header><div><span className="confirm-icon"><PackageCheck size={19} /></span><div><b>标记产品需求完成</b><small>完成后，同项目研发与测试可看到此需求</small></div></div><button aria-label="关闭" onClick={() => setShowConfirm(false)} type="button"><X size={17} /></button></header>
        <div className="confirm-included"><b>当前需求包</b><div>{artifacts.map((item) => <span className={item.status} key={item.label}>{item.status === "missing" ? <AlertTriangle size={13} /> : <Check size={13} />}{item.label} {item.version ?? "缺失"}</span>)}</div></div>
        {readiness.warnings.length > 0 && <div className="confirm-warning"><AlertTriangle size={16} /><span><b>可以完成，但存在风险</b><small>{readiness.warnings.join("；")}。研发与测试开始时会看到这些信息。</small></span></div>}
        <p>完成仅代表原型与 PRD 已具备。需求级 Spec 和验收标准由项目成员继续共同维护，不触发任务分派。</p>
        <footer><button onClick={() => setShowConfirm(false)} type="button">取消</button><button className="primary" onClick={() => { dispatch({ type: "mark-product-complete" }); setShowConfirm(false); }} type="button">确认完成</button></footer>
      </div>
    </div>}
  </>;
}

export function DownstreamProductContext({
  state,
  agentId,
  dispatch,
}: {
  state: ProductPackageState;
  agentId: string;
  dispatch: Dispatch<ProductPackageAction>;
}) {
  if (state.productStatus === "adjusting") return null;
  const snapshot = state.downstreamSnapshots.find((item) => item.agentId === agentId);
  const currentPrototype = state.prototypeVersions.at(-1)?.version;
  const currentPrd = state.prdVersions.at(-1)?.version;
  const hasUpdate = snapshot && (snapshot.prototypeVersion !== currentPrototype || snapshot.prdVersion !== currentPrd);
  const readiness = getProductReadiness(state);
  return <section className="downstream-product-context">
    <div><span className="ready-dot" /><div><b>产品已完成 · 当前需求可开始</b><small>{readiness.missing.length ? `缺少${readiness.missing.join("、")}` : "需求包内容完整"}</small></div></div>
    {!snapshot ? <button onClick={() => dispatch({ type: "create-downstream-snapshot", agentId })} type="button">使用当前产品上下文</button> : hasUpdate ? <button className="update" onClick={() => dispatch({ type: "create-downstream-snapshot", agentId })} type="button">产品上下文有更新 · 载入新版本</button> : <span className="snapshot-version">已载入 {snapshot.prdVersion ?? "无 PRD"} · {snapshot.prototypeVersion ?? "无原型"}</span>}
  </section>;
}
