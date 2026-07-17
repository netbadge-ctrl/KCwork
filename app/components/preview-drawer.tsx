import {
  Braces,
  Check,
  FileCode2,
  FileText,
  ListTree,
  PanelRightClose,
  ScrollText,
  TestTube2,
  X,
} from "lucide-react";
import { useEffect } from "react";
import type { PreviewKind, ProjectMember, ProjectRole } from "../lib/types";
import { MemberManager } from "./member-manager";

export interface PreviewDrawerProps {
  preview: PreviewKind | null;
  members: ProjectMember[];
  memberRoles: Record<string, ProjectRole>;
  selectedAssetId: string | null;
  onSelect(kind: PreviewKind): void;
  onChangeMemberRole(memberId: string, role: ProjectRole): void;
  onClose(): void;
}

const tools: { kind: PreviewKind; label: string; icon: typeof FileText }[] = [
  { kind: "prd", label: "产物预览", icon: FileText },
  { kind: "diff", label: "代码差异", icon: FileCode2 },
  { kind: "context", label: "引用上下文", icon: ListTree },
  { kind: "log", label: "执行日志", icon: ScrollText },
  { kind: "test", label: "测试报告", icon: TestTube2 },
];

const contextualLabels: Partial<Record<PreviewKind, string>> = {
  prototype: "页面预览",
  pdf: "PDF 预览",
  members: "成员管理",
  asset: "资产详情",
};

export function PreviewDrawer({
  preview,
  members,
  memberRoles,
  selectedAssetId,
  onSelect,
  onChangeMemberRole,
  onClose,
}: PreviewDrawerProps) {
  useEffect(() => {
    if (!preview) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [preview, onClose]);

  return (
    <div className="auxiliary" aria-label="辅助工具">
      {preview && (
        <aside
          className="preview-drawer"
          aria-label={contextualLabels[preview] ?? "产物预览"}
        >
          <header className="drawer-header">
            <div>
              <p className="eyebrow">辅助面板</p>
              <h2>{contextualLabels[preview] ?? tools.find((tool) => tool.kind === preview)?.label}</h2>
            </div>
            <button aria-label="关闭预览" className="icon-button" onClick={onClose} type="button">
              <X size={18} />
            </button>
          </header>
          <div className="drawer-body">
            {preview === "prd" && <PrdPreview />}
            {preview === "diff" && <DiffPreview />}
            {preview === "context" && <ContextPreview />}
            {preview === "log" && <LogPreview />}
            {preview === "test" && <TestPreview />}
            {preview === "members" && (
              <MemberManager
                members={members}
                onChangeRole={onChangeMemberRole}
                roles={memberRoles}
              />
            )}
            {preview === "asset" && <AssetDetail assetId={selectedAssetId} />}
          </div>
        </aside>
      )}
      <aside className="right-rail" aria-label="辅助工具栏">
        {tools.map(({ kind, label, icon: Icon }) => (
          <button
            aria-label={label}
            className={preview === kind ? "active" : ""}
            key={kind}
            onClick={() => onSelect(kind)}
            title={label}
            type="button"
          >
            <Icon size={18} />
          </button>
        ))}
        <button aria-label="收起辅助栏" className="rail-bottom" onClick={onClose} type="button">
          <PanelRightClose size={18} />
        </button>
      </aside>
    </div>
  );
}

function AssetDetail({ assetId }: { assetId: string | null }) {
  return (
    <article className="asset-detail-preview">
      <span className="document-tag">项目资产</span>
      <h3>{assetId ? "资产详情与编辑" : "选择一项资产"}</h3>
      <p>该资产对项目内全部成员可见，并可被产品、研发和测试需求共同引用。</p>
      {assetId && (
        <>
          <div className="asset-detail-field"><b>资产标识</b><span>{assetId}</span></div>
          <div className="asset-detail-field"><b>引用需求</b><span>REQ-032 角色与成员权限重构</span></div>
          <textarea aria-label="编辑资产说明" defaultValue="已确认的项目共享上下文，可供 Agent 按权限引用。" />
          <button className="primary-small" type="button">保存新版本</button>
        </>
      )}
    </article>
  );
}

function PrdPreview() {
  return (
    <article className="document-preview">
      <div className="document-toolbar"><span>角色管理模块 PRD v1.3</span><button type="button">编辑</button></div>
      <div className="document-sheet">
        <span className="document-tag">产品需求文档</span>
        <h1>角色管理与成员权限</h1>
        <p className="document-meta">版本 v1.3 · 陈楠 · 刚刚更新</p>
        <h2>1. 背景与目标</h2>
        <p>为企业客户提供清晰、可控的角色管理能力，支持租户与项目两个权限范围。</p>
        <h2>2. 角色定义</h2>
        <div className="role-table">
          <div><b>租户管理员</b><span>管理企业级成员与全局策略</span></div>
          <div><b>项目管理员</b><span>仅管理当前项目成员与权限</span></div>
          <div><b>普通成员</b><span>访问被授权的项目资源</span></div>
        </div>
        <h2>3. 验收标准</h2>
        {["不同角色只能看到权限内的操作", "移除成员需要二次确认", "权限变更即时写入审计记录"].map((item) => (
          <p className="check-line" key={item}><Check size={14} /> {item}</p>
        ))}
      </div>
    </article>
  );
}

function DiffPreview() {
  return <div className="code-preview"><div className="code-file"><Braces size={16} /> src/features/roles/RolePanel.tsx</div><pre><code><span className="minus">- const canEdit = isAdmin;</span>{"\n"}<span className="plus">+ const canEdit = permissions.includes(&quot;role:write&quot;);</span>{"\n"}<span className="plus">+ const scope = activeProject.id;</span></code></pre></div>;
}

function ContextPreview() {
  return <div className="context-preview"><h3>本次引用 4 项上下文</h3>{["需求访谈纪要 · 7 月 12 日", "角色配置原型 V2", "权限接口文档", "项目决策记录 #18"].map((item) => <div key={item}><Check size={15} /><span>{item}</span></div>)}</div>;
}

function LogPreview() {
  return <div className="log-preview"><p>14:32:04　读取项目上下文</p><p>14:32:05　分析需求与权限模型</p><p>14:32:07　生成 PRD 修订内容</p><p className="success-line">14:32:08　执行完成</p></div>;
}

function TestPreview() {
  return <div className="test-preview"><div className="test-score"><strong>92%</strong><span>测试通过率</span></div><h3>角色管理回归测试</h3><p>通过 23　失败 2　跳过 1</p><div className="test-bar"><span /></div></div>;
}
