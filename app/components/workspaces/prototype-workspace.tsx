import {
  Check,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useState } from "react";
import { productDocuments } from "../../lib/demo-data";
import type { WorkspaceRouterProps } from "./workspace-router";
import { WorkspaceEmptyState } from "./workspace-empty-state";

const pages = ["总览", "成员与角色", "角色详情", "操作审计"];

export function PrototypeWorkspace({
  requirement,
  onOpenPreview,
}: WorkspaceRouterProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const prototype = productDocuments.find(
    (item) => item.requirementId === requirement.id && item.kind === "prototype",
  );
  if (!prototype) {
    return (
      <section className="workspace-canvas prototype-workspace">
        <div className="workspace-heading"><div><p className="eyebrow">Prototype</p><h2>原型设计工作台</h2><p>当前工作区只展示 {requirement.code} 的产物。</p></div></div>
        <WorkspaceEmptyState title="当前需求暂无原型产物" detail="可以通过底部对话框要求原型设计 Agent 生成首版页面。" />
      </section>
    );
  }
  return (
    <section className="workspace-canvas prototype-workspace">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Prototype · {prototype.version}</p>
          <h2>原型设计工作台</h2>
          <p>页面结构与交互说明直接引用 {requirement.code} 的用户故事。</p>
        </div>
        <button
          className="primary-small"
          onClick={() => onOpenPreview("prototype")}
          type="button"
        >预览角色配置页面</button>
      </div>

      <div className="prototype-layout">
        <aside className="prototype-page-tree">
          <header><strong>页面</strong><small>4</small></header>
          {pages.map((page) => (
            <button className={page === "成员与角色" ? "active" : ""} key={page} type="button">
              <span>{page}</span><ChevronRight size={14} />
            </button>
          ))}
          <div className="prototype-version-list">
            <small>版本历史</small>
            <span><b>V3</b> 当前版本</span>
            <span><b>V2</b> 产品评审</span>
          </div>
        </aside>

        <div className="prototype-canvas">
          <div className="prototype-toolbar">
            <div>
              <button aria-label="桌面端预览" className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")} type="button"><Monitor size={15} /></button>
              <button aria-label="平板端预览" className={device === "tablet" ? "active" : ""} onClick={() => setDevice("tablet")} type="button"><Tablet size={15} /></button>
              <button aria-label="移动端预览" className={device === "mobile" ? "active" : ""} onClick={() => setDevice("mobile")} type="button"><Smartphone size={15} /></button>
            </div>
            <span>12 个交互热点 · 已同步 Spec</span>
          </div>
          <div className={`prototype-browser ${device}`}>
            <div className="prototype-browser-bar"><i /><i /><i /><span>portal.local/members</span></div>
            <div className="prototype-app-shell">
              <aside><b>KFlow</b><span>项目总览</span><span className="active">成员管理</span><span>操作审计</span></aside>
              <main>
                <p>企业客户门户 V3.2</p>
                <div className="prototype-screen-heading"><h3>成员与角色管理</h3><button type="button">添加成员</button></div>
                <div className="prototype-filter">搜索成员、邮箱或角色 <span>全部角色⌄</span></div>
                {["陈楠 · 项目管理员", "林川 · 研发", "周祺 · 测试"].map((item, index) => (
                  <div className="prototype-member-line" key={item}>
                    <i>{item.slice(0, 1)}</i><span>{item}</span><b>{index === 0 ? "管理全部" : "按角色编辑"}</b><em>•••</em>
                    {index === 1 && <mark>交互 03</mark>}
                  </div>
                ))}
              </main>
            </div>
          </div>
        </div>

        <aside className="prototype-inspector">
          <p className="eyebrow">设计说明</p>
          <h3>成员行操作</h3>
          <div><Check size={14} /><span>按项目角色控制编辑入口</span></div>
          <div><Check size={14} /><span>变更前展示影响范围</span></div>
          <div><Check size={14} /><span>确认后写入操作审计</span></div>
          <small>关联 Spec：US-04、AC-07、AC-12</small>
        </aside>
      </div>
    </section>
  );
}
