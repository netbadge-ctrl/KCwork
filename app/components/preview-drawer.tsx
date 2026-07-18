import {
  Braces,
  Check,
  FileText,
  PanelRightClose,
  X,
} from "lucide-react";
import { useEffect } from "react";
import {
  codeChanges,
  productDocuments,
  testCases,
  testReports,
} from "../lib/demo-data";
import { contextualPreviewKinds, type ContextualTool } from "../lib/contextual-tools";
import type {
  ContextSource,
  PreviewKind,
  ProjectCapabilities,
  ProjectMember,
  ProjectRole,
  ProjectSection,
  Requirement,
  RequirementStage,
} from "../lib/types";
import { ContextSourcesPanel } from "./context-sources-panel";
import { ContextualScenePreview } from "./contextual-scene-preview";
import { MemberManager } from "./member-manager";
import { PreviewErrorState, type PreviewErrorKind } from "./preview-error-state";
import { ProjectSettingsPanel } from "./project-settings-panel";

export interface PreviewDrawerProps {
  preview: PreviewKind | null;
  tools: ContextualTool[];
  members: ProjectMember[];
  memberRoles: Record<string, ProjectRole>;
  requirements: Requirement[];
  requirementStages: Record<string, RequirementStage>;
  sources: ContextSource[];
  selectedRequirement: Requirement | null;
  capabilities: ProjectCapabilities;
  currentRole: ProjectRole;
  selectedContextIds: string[];
  lockedContextIds: string[];
  selectedAssetId: string | null;
  previewError?: PreviewErrorKind | null;
  onSelect(kind: PreviewKind): void;
  onToggleContextSource(sourceId: string): void;
  onToggleContextLock(sourceId: string): void;
  onChangeMemberRole(memberId: string, role: ProjectRole): void;
  onSetRequirementStage(requirementId: string, stage: RequirementStage): void;
  onOpenAsset(section: Exclude<ProjectSection, "overview">): void;
  onClose(): void;
  onRetryPreview?(): void;
}

const contextualLabels: Partial<Record<PreviewKind, string>> = {
  prd: "产物预览",
  prototype: "页面预览",
  pdf: "PDF 预览",
  members: "成员管理",
  sources: "自动上下文",
  "project-settings": "项目设置",
  asset: "资产详情",
  diff: "代码差异",
  test: "测试报告",
};

export function PreviewDrawer({
  preview,
  tools,
  members,
  memberRoles,
  requirements,
  requirementStages,
  sources,
  selectedRequirement,
  capabilities,
  currentRole,
  selectedContextIds,
  lockedContextIds,
  selectedAssetId,
  previewError,
  onSelect,
  onToggleContextSource,
  onToggleContextLock,
  onChangeMemberRole,
  onSetRequirementStage,
  onOpenAsset,
  onClose,
  onRetryPreview,
}: PreviewDrawerProps) {
  const selectedTool = tools.find((tool) => tool.kind === preview);

  useEffect(() => {
    if (!preview) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [preview, onClose]);

  useEffect(() => {
    if (!preview || !contextualPreviewKinds.has(preview)) return;
    if (!tools.some((tool) => tool.kind === preview)) onClose();
  }, [preview, tools, onClose]);

  return (
    <div className="auxiliary" aria-label="辅助工具">
      {preview && (
        <aside
          className="preview-drawer"
          aria-label={contextualLabels[preview] ?? selectedTool?.label ?? "产物预览"}
        >
          <header className="drawer-header">
            <div>
              <p className="eyebrow">辅助面板</p>
              <h2>{selectedTool?.label ?? contextualLabels[preview] ?? "辅助内容"}</h2>
            </div>
            <button aria-label="关闭预览" className="icon-button" onClick={onClose} type="button">
              <X size={18} />
            </button>
          </header>
          <div className="drawer-body">
            {previewError === preview ? (
              <PreviewErrorState kind={previewError} onRetry={onRetryPreview ?? (() => undefined)} />
            ) : (
              <>
            {preview === "prd" && <PrdPreview canEdit={capabilities.canEditProductArtifacts} requirement={selectedRequirement} />}
            {preview === "diff" && <DiffPreview canEdit={capabilities.canEditDevelopmentArtifacts} requirement={selectedRequirement} />}
            {preview === "context" && <ContextPreview selectedIds={selectedContextIds} sources={sources} />}
            {preview === "sources" && (
              <ContextSourcesPanel
                canEdit={capabilities.canEditAgentWork}
                lockedIds={lockedContextIds}
                onToggle={onToggleContextSource}
                onToggleLock={onToggleContextLock}
                selectedIds={selectedContextIds}
                sources={sources}
              />
            )}
            {preview === "log" && <LogPreview requirement={selectedRequirement} />}
            {preview === "test" && <TestPreview canEdit={capabilities.canEditTestArtifacts} requirement={selectedRequirement} />}
            {preview === "prototype" && <PrototypePreview canEdit={capabilities.canEditProductArtifacts} requirement={selectedRequirement} />}
            {preview === "pdf" && <PdfPreview requirement={selectedRequirement} />}
            {preview === "members" && (
              <MemberManager
                canManage={capabilities.canManageMembers}
                members={members}
                onChangeRole={onChangeMemberRole}
                roles={memberRoles}
              />
            )}
            {preview === "project-settings" && (
              <ProjectSettingsPanel
                capabilities={capabilities}
                currentRole={currentRole}
                memberRoles={memberRoles}
                members={members}
                onChangeMemberRole={onChangeMemberRole}
                onOpenAsset={onOpenAsset}
                onSetRequirementStage={onSetRequirementStage}
                requirementStages={requirementStages}
                requirements={requirements}
              />
            )}
            {preview === "asset" && <AssetDetail assetId={selectedAssetId} canEdit={capabilities.canManageAssets} requirement={selectedRequirement} />}
            <ContextualScenePreview kind={preview} />
              </>
            )}
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

function AssetDetail({
  assetId,
  canEdit,
  requirement,
}: {
  assetId: string | null;
  canEdit: boolean;
  requirement: Requirement | null;
}) {
  return (
    <article className="asset-detail-preview">
      <span className="document-tag">项目资产</span>
      <h3>{assetId ? "资产详情与编辑" : "选择一项资产"}</h3>
      <p>该资产对项目内全部成员可见，并可被产品、研发和测试需求共同引用。</p>
      {assetId && (
        <>
          <div className="asset-detail-field"><b>资产标识</b><span>{assetId}</span></div>
          <div className="asset-detail-field"><b>引用需求</b><span>{requirement ? `${requirement.code} ${requirement.title}` : "项目共享资产"}</span></div>
          <textarea aria-label="编辑资产说明" defaultValue="已确认的项目共享上下文，可供 Agent 按权限引用。" disabled={!canEdit} />
          <button className="primary-small" disabled={!canEdit} type="button">保存新版本</button>
        </>
      )}
    </article>
  );
}

function PrototypePreview({
  requirement,
  canEdit,
}: {
  requirement: Requirement | null;
  canEdit: boolean;
}) {
  const prototype = productDocuments.find(
    (document) =>
      document.requirementId === requirement?.id && document.kind === "prototype",
  );
  if (!requirement || !prototype) {
    return <EmptyPreview message="当前需求暂无可预览的原型产物。" />;
  }
  return (
    <article className="prototype-preview-shell">
      <div className="document-toolbar"><span>{prototype.title} {prototype.version}</span><button disabled={!canEdit} type="button">在画布中编辑</button></div>
      <div className="prototype-preview-app">
        <aside><b>KFlow</b><span>项目总览</span><span className="active">成员管理</span><span>操作审计</span></aside>
        <main>
          <p className="eyebrow">企业客户门户 V3.2</p>
          <div className="prototype-screen-heading"><h3>成员与角色预览</h3><button type="button">添加成员</button></div>
          <div className="prototype-filter">搜索成员、邮箱或角色 <span>全部角色⌄</span></div>
          {["陈楠", "林川", "周祺", "顾言"].map((name, index) => (
            <div className="prototype-member-line" key={name}><i>{name.slice(0, 1)}</i><span>{name}<small>{index === 0 ? "项目管理员" : index === 2 ? "测试" : "研发"}</small></span><b>{index === 0 ? "全部权限" : "按角色编辑"}</b><em>•••</em></div>
          ))}
        </main>
      </div>
      <footer>桌面端 · 1440 × 900 · 12 个交互热点</footer>
    </article>
  );
}

function PdfPreview({ requirement }: { requirement: Requirement | null }) {
  const document = productDocuments.find(
    (item) => item.requirementId === requirement?.id && item.kind === "prd",
  );
  if (!requirement || !document) {
    return <EmptyPreview message="当前需求暂无可预览的 PRD PDF。" />;
  }
  return (
    <article className="pdf-preview">
      <div className="document-toolbar"><span>{document.title} {document.version}.pdf</span><button type="button">下载</button></div>
      <div className="pdf-sheet">
        <span className="document-tag">产品需求文档</span>
        <h1>{requirement.title}</h1>
        <p className="document-meta">{requirement.code} · Spec {requirement.specVersion} · 2026-07-17</p>
        <h2>1. 背景与目标</h2>
        <p>统一企业客户门户中的项目成员和角色管理体验，使产品、研发和测试围绕同一份可追溯规格协作。</p>
        <h2>2. 角色定义</h2>
        <div className="role-table">
          <div><b>项目管理员</b><span>管理成员、项目设置与全部资产</span></div>
          <div><b>产品</b><span>维护需求、原型与产品文档</span></div>
          <div><b>研发</b><span>维护开发任务和代码变更</span></div>
          <div><b>测试</b><span>维护测试用例、报告与缺陷</span></div>
        </div>
        <h2>3. 验收标准</h2>
        {["角色变更前展示影响范围", "所有变更写入审计记录", "项目成员可查看全部研发上下文"].map((item) => <p className="check-line" key={item}><Check size={14} />{item}</p>)}
        <div className="pdf-page-number">1 / 4</div>
      </div>
    </article>
  );
}

function PrdPreview({
  requirement,
  canEdit,
}: {
  requirement: Requirement | null;
  canEdit: boolean;
}) {
  const document = productDocuments.find(
    (item) => item.requirementId === requirement?.id && item.kind === "prd",
  );
  if (!requirement || !document) {
    return <EmptyPreview message="当前需求暂无 PRD 产物。" />;
  }
  return (
    <article className="document-preview">
      <div className="document-toolbar"><span>{document.title} {document.version}</span><button disabled={!canEdit} type="button">编辑</button></div>
      <div className="document-sheet">
        <span className="document-tag">产品需求文档</span>
        <h1>{requirement.title}</h1>
        <p className="document-meta">{requirement.code} · 版本 {document.version} · {document.updatedAt}</p>
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

function DiffPreview({
  requirement,
  canEdit,
}: {
  requirement: Requirement | null;
  canEdit: boolean;
}) {
  const changes = codeChanges.filter(
    (change) => change.requirementId === requirement?.id,
  );
  if (!requirement || changes.length === 0) {
    return <EmptyPreview message="当前需求暂无可审查的代码变更。" />;
  }
  return <div className="diff-layout">
    <div className="diff-rationale"><p className="eyebrow">AI 修改说明</p><h3>把角色编辑权限绑定到项目级权限集合</h3><p>原实现只判断管理员身份，无法区分项目范围。此次修改按 AC-07 引入权限集合，并补充观察者测试。</p><div><span>3 个文件</span><b className="plus-text">+95</b><b className="minus-text">−8</b></div></div>
    <div className="diff-file-list"><b>变更文件</b><button className="active" type="button">RolePanel.tsx <span>+18 −6</span></button><button type="button">useRolePermissions.ts <span>+42</span></button><button type="button">RolePanel.test.tsx <span>+35 −2</span></button></div>
    <div className="code-preview"><div className="code-file"><Braces size={16} /> src/features/roles/RolePanel.tsx</div><pre><code><span className="minus">- const canEdit = isAdmin;</span>{"\n"}<span className="plus">+ const canEdit = permissions.includes(&quot;role:write&quot;);</span>{"\n"}<span className="plus">+ const scope = activeProject.id;</span>{"\n"}{"\n"}<span className="neutral">  return &lt;RoleActions disabled=&#123;!canEdit&#125; /&gt;;</span></code></pre></div>
    <div className="diff-actions"><button disabled={!canEdit} type="button">放弃本次变更</button><button disabled={!canEdit} type="button">继续修改</button><button className="primary-small" disabled={!canEdit} type="button">接受变更</button></div>
  </div>;
}

function ContextPreview({ sources, selectedIds }: { sources: ContextSource[]; selectedIds: string[] }) {
  const selectedSources = sources.filter((source) => selectedIds.includes(source.id));
  return <div className="context-preview"><h3>本次引用 {selectedSources.length} 项上下文</h3>{selectedSources.map((source) => <div key={source.id}><Check size={15} /><span>{source.name} · {source.detail}</span></div>)}</div>;
}

function LogPreview({ requirement }: { requirement: Requirement | null }) {
  if (!requirement) return <EmptyPreview message="选择需求后查看 Agent 执行日志。" />;
  return <div className="log-preview"><p>读取 {requirement.code} 自动上下文</p><p>分析 {requirement.title}</p><p>生成当前 Agent 结果</p><p className="success-line">执行完成 · 结果保留在当前需求</p></div>;
}

function TestPreview({
  requirement,
  canEdit,
}: {
  requirement: Requirement | null;
  canEdit: boolean;
}) {
  const report = testReports.find((item) => item.requirementId === requirement?.id);
  const failedCase = testCases.find(
    (item) => item.requirementId === requirement?.id && item.status === "failed",
  );
  if (!requirement || !report) {
    return <EmptyPreview message="当前需求暂无测试报告。" />;
  }
  return <div className="test-preview"><div className="test-score"><strong>{report.passRate}%</strong><span>测试通过率</span></div><h3>{report.title}</h3><p>通过 {report.passed}　失败 {report.failed}　跳过 {report.skipped}</p><div className="test-bar"><span style={{ width: `${report.passRate}%` }} /></div>{failedCase && <article className="test-failure-detail"><b>失败：{failedCase.title}</b><span>对应 {failedCase.specRef}</span><p>该结果仅属于 {requirement.code}，等待用户确认后再创建修复任务。</p></article>}<button className="primary-small" disabled={!canEdit} type="button">创建修复任务</button></div>;
}

function EmptyPreview({ message }: { message: string }) {
  return <div className="workspace-empty-state compact"><FileText size={22} /><strong>{message}</strong><p>尚未生成的证据不会使用其他需求的数据代替。</p></div>;
}
