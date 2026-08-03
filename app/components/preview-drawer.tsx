import {
  Check,
  FileText,
  PanelRightClose,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type Dispatch } from "react";
import {
  productDocuments,
  testCases,
  testReports,
} from "../lib/demo-data";
import { contextualPreviewKinds, type ContextualTool } from "../lib/contextual-tools";
import type {
  AssetItem,
  ContextSource,
  PreviewKind,
  Project,
  ProjectCapabilities,
  ProjectMember,
  ProjectRole,
  ProjectSection,
  Requirement,
  RequirementStage,
} from "../lib/types";
import { ContextSourcesPanel } from "./context-sources-panel";
import { ContextualScenePreview } from "./contextual-scene-preview";
import { CodeWorkbenchPreview } from "./code-workbench-preview";
import { AgentToolPanel, useAgentToolSession } from "./agent-tool-panels";
import { CreateSystemPanel } from "./create-system-panel";
import { MemberManager } from "./member-manager";
import { PreviewErrorState, type PreviewErrorKind } from "./preview-error-state";
import { PrdDocumentSheet } from "./prd-document-sheet";
import { ProjectContextPanel } from "./project-context-panel";
import { ProjectSettingsPanel } from "./project-settings-panel";
import { ProjectInvestmentCard, RequirementInvestmentCard } from "./investment-analysis";
import {
  getPrototypeBrowserUrl,
} from "./prototype-editor";
import { PrototypePreviewShell } from "./prototype-preview-shell";
import { ProductPanel, PrototypeHeaderControls } from "./product-panels";
import { ProductToolSettings, type ProductToolSettingsKind } from "./product-tool-settings";
import type { ProductPackageAction, ProductPackageState } from "../lib/product-package";
import { RequirementBaselinePanel } from "./requirement-baseline";
import type { RequirementBaselineAction, RequirementBaselineState } from "../lib/requirement-baseline";
import {
  clampRightPanelWidthForShell,
  DEFAULT_RIGHT_PANEL_WIDTH,
  getEffectiveRightPanelWidth,
  getRightPanelMaxWidth,
  MOBILE_BREAKPOINT,
  MIN_RIGHT_PANEL_WIDTH,
} from "../lib/layout-preferences";

export interface PreviewDrawerProps {
  preview: PreviewKind | null;
  view: "home" | "projects" | "project-detail" | "project-asset" | "requirement-detail" | "assets" | "profile" | "task";
  sidebarWidth: number;
  width: number;
  tools: ContextualTool[];
  assets: AssetItem[];
  members: ProjectMember[];
  memberRoles: Record<string, ProjectRole[]>;
  requirements: Requirement[];
  requirementStages: Record<string, RequirementStage>;
  sources: ContextSource[];
  selectedProject: Project | null;
  selectedRequirement: Requirement | null;
  selectedAgentId: string;
  productPackage: ProductPackageState;
  onProductPackageAction: Dispatch<ProductPackageAction>;
  requirementBaseline: RequirementBaselineState;
  onRequirementBaselineAction: Dispatch<RequirementBaselineAction>;
  capabilities: ProjectCapabilities;
  currentRoles: ProjectRole[];
  selectedContextIds: string[];
  lockedContextIds: string[];
  selectedAssetId: string | null;
  previewError?: PreviewErrorKind | null;
  explicitPreviewKind?: PreviewKind | null;
  documentDraft?: string;
  onSelect(kind: PreviewKind): void;
  onSaveDocumentDraft?(draft: string): void;
  onToggleContextSource(sourceId: string): void;
  onToggleContextLock(sourceId: string): void;
  onChangeMemberRole(memberId: string, roles: ProjectRole[]): void;
  onSetRequirementStage(requirementId: string, stage: RequirementStage): void;
  onOpenAsset(section: Exclude<ProjectSection, "overview">): void;
  onCreateProject(project: Project): void;
  onOpenSmartAssets(): void;
  onClose(): void;
  onRetryPreview?(): void;
  onWidthChange(width: number): void;
}

const contextualLabels: Partial<Record<PreviewKind, string>> = {
  prd: "产物预览",
  prototype: "页面预览",
  pdf: "PDF 预览",
  members: "成员管理",
  sources: "本次会话上下文",
  "project-settings": "需求状态与门禁",
  "context-maintenance": "共享上下文",
  "create-system": "新建系统项目",
  "project-repositories": "代码仓库",
  "project-requirements": "产品需求",
  "project-tests": "测试资产",
  asset: "资产详情",
  files: "代码查看",
  diff: "代码差异",
  test: "测试报告",
  "requirement-analysis": "需求分析",
  "acceptance-criteria": "验收标准",
  "prototype-audit": "原型审计",
  "frontend-preview": "页面预览",
  console: "控制台",
  "api-debug": "接口调试",
  "data-model": "数据模型",
  "test-cases": "测试用例",
  "test-run": "执行测试",
  failures: "失败证据",
  defects: "缺陷记录",
  "delivery-check": "产品交付物",
  "version-history": "版本记录",
  "requirement-spec": "需求规格",
  "requirement-acceptance": "需求规格",
  investment: "投入分析",
};

const PROJECT_CONTEXT_PREVIEW_KIND: Partial<Record<PreviewKind, "repositories" | "requirements" | "tests" | "context">> = {
  "project-repositories": "repositories",
  "project-requirements": "requirements",
  "project-tests": "tests",
  "context-maintenance": "context",
};

const fullAgentPanelKinds = new Set<PreviewKind>([
  "requirement-analysis",
  "acceptance-criteria",
  "prototype-audit",
  "frontend-preview",
  "console",
  "api-debug",
  "data-model",
  "test-cases",
  "test-run",
  "failures",
  "defects",
]);

export function PreviewDrawer({
  preview,
  view,
  sidebarWidth,
  width,
  tools,
  assets,
  members,
  memberRoles,
  requirements,
  requirementStages,
  sources,
  selectedProject,
  selectedRequirement,
  selectedAgentId,
  productPackage,
  onProductPackageAction,
  requirementBaseline,
  onRequirementBaselineAction,
  capabilities,
  currentRoles,
  selectedContextIds,
  lockedContextIds,
  selectedAssetId,
  previewError,
  explicitPreviewKind = null,
  documentDraft = "",
  onSelect,
  onSaveDocumentDraft = () => undefined,
  onToggleContextSource,
  onToggleContextLock,
  onChangeMemberRole,
  onSetRequirementStage,
  onOpenAsset,
  onCreateProject,
  onOpenSmartAssets,
  onClose,
  onRetryPreview,
  onWidthChange,
}: PreviewDrawerProps) {
  const selectedTool = tools.find((tool) => tool.kind === preview);
  const agentToolSession = useAgentToolSession();
  const isBackendRuntimeLog = preview === "log" && selectedAgentId === "development";
  const isTestingReport = preview === "test" && selectedAgentId === "testing" && explicitPreviewKind !== "test";
  const isProductPanel = selectedAgentId === "product-design" && ["prototype", "prd", "delivery-check", "version-history"].includes(preview ?? "");
  const drawerTitle = preview === "prototype" && selectedRequirement
    ? `${selectedRequirement.title}-prototype`
    : preview === "prd" && selectedRequirement
      ? `${selectedRequirement.title}-PRD`
      : selectedTool?.label ?? (preview ? contextualLabels[preview] : null) ?? "辅助内容";
  const isRequirementBaselinePanel = ["requirement-spec", "requirement-acceptance"].includes(preview ?? "");
  const [prototypeInspect, setPrototypeInspect] = useState(false);
  const [toolSettingsOpen, setToolSettingsOpen] = useState(false);
  const mainTools = tools.filter((tool) => tool.kind !== "context");
  const contextTools = tools.filter((tool) => tool.kind === "context");
  const [viewportWidth, setViewportWidth] = useState(
    Math.ceil(DEFAULT_RIGHT_PANEL_WIDTH / 0.7),
  );
  const dragStart = useRef<{
    pointerId: number;
    width: number;
    x: number;
  } | null>(null);
  const effectiveWidth = getEffectiveRightPanelWidth(
    width,
    viewportWidth,
    sidebarWidth,
  );
  const maximumWidth =
    viewportWidth <= MOBILE_BREAKPOINT
      ? effectiveWidth
      : getRightPanelMaxWidth(viewportWidth, sidebarWidth);
  const minimumWidth = Math.min(
    maximumWidth,
    ["prototype", "prd"].includes(preview ?? "") ? 620 : MIN_RIGHT_PANEL_WIDTH,
  );

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  useEffect(() => {
    if (!preview) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [preview, onClose]);

  useEffect(() => {
    setToolSettingsOpen(false);
  }, [preview]);

  useEffect(() => {
    if (!preview || !contextualPreviewKinds.has(preview)) return;
    if (explicitPreviewKind === preview) return;
    if (!tools.some((tool) => tool.kind === preview)) onClose();
  }, [explicitPreviewKind, preview, tools, onClose]);

  return (
    <div className="auxiliary" aria-label="辅助工具">
      {preview && (
        <>
          <div
            aria-label="调整辅助面板宽度"
            aria-orientation="vertical"
            aria-valuemax={maximumWidth}
            aria-valuemin={Math.min(minimumWidth, effectiveWidth)}
            aria-valuenow={effectiveWidth}
            className="drawer-resize-handle"
            onDoubleClick={() =>
              onWidthChange(
                clampRightPanelWidthForShell(
                  Math.max(DEFAULT_RIGHT_PANEL_WIDTH, minimumWidth),
                  viewportWidth,
                  sidebarWidth,
                ),
              )
            }
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                return;
              }
              event.preventDefault();
              const delta = event.key === "ArrowLeft" ? 16 : -16;
              onWidthChange(
                clampRightPanelWidthForShell(
                  Math.max(minimumWidth, width + delta),
                  viewportWidth,
                  sidebarWidth,
                ),
              );
            }}
            onLostPointerCapture={() => {
              dragStart.current = null;
            }}
            onPointerDown={(event) => {
              if (event.button !== 0 || event.isPrimary === false) return;
              dragStart.current = {
                pointerId: event.pointerId,
                width,
                x: event.clientX,
              };
              event.currentTarget.setPointerCapture?.(event.pointerId);
              event.preventDefault();
            }}
            onPointerMove={(event) => {
              if (
                !dragStart.current ||
                dragStart.current.pointerId !== event.pointerId
              ) {
                return;
              }
              onWidthChange(
                clampRightPanelWidthForShell(
                  Math.max(minimumWidth, dragStart.current.width + dragStart.current.x - event.clientX),
                  viewportWidth,
                  sidebarWidth,
                ),
              );
            }}
            onPointerUp={(event) => {
              if (dragStart.current?.pointerId !== event.pointerId) return;
              dragStart.current = null;
              event.currentTarget.releasePointerCapture?.(event.pointerId);
            }}
            role="separator"
            tabIndex={0}
          />
          <aside
            className="preview-drawer"
            aria-label={contextualLabels[preview] ?? selectedTool?.label ?? "产物预览"}
          >
          <header className={`drawer-header ${isProductPanel && preview === "prototype" ? "prototype-drawer-header" : ""}`}>
            <div className="drawer-title-group">
              <p className="eyebrow">辅助面板</p>
              <h2>{drawerTitle}</h2>
              {isProductPanel && preview === "prd" && <span className="drawer-artifact-version"><b>PRD {productPackage.prdVersions.at(-1)?.version}</b><small>{selectedRequirement?.code}</small></span>}
              {isProductPanel && preview === "prototype" && <span className="drawer-artifact-version"><b>原型 {productPackage.prototypeVersions.at(-1)?.version}</b><small>{selectedRequirement?.code}</small></span>}
              {isProductPanel && preview === "prototype" && <PrototypeHeaderControls canEdit={capabilities.canEditProductArtifacts} dispatch={onProductPackageAction} inspect={prototypeInspect} onInspectChange={setPrototypeInspect} state={productPackage} />}
            </div>
            <div className="drawer-header-actions">
              {(preview === "prototype" || preview === "prd") && (
                <button
                  aria-label={`${preview === "prototype" ? "原型" : "PRD"}工具设置`}
                  aria-pressed={toolSettingsOpen}
                  className={`icon-button tool-settings-trigger ${toolSettingsOpen ? "active" : ""}`}
                  onClick={() => setToolSettingsOpen((open) => !open)}
                  type="button"
                >
                  <Settings size={16} />
                </button>
              )}
              <button aria-label="关闭预览" className="icon-button" onClick={onClose} type="button">
                <X size={18} />
              </button>
            </div>
          </header>
          {(preview === "prototype" || preview === "prd") && toolSettingsOpen && (
            <ProductToolSettings
              canEdit={capabilities.canEditProductArtifacts}
              kind={preview as ProductToolSettingsKind}
              onClose={() => setToolSettingsOpen(false)}
            />
          )}
          <div className="drawer-body">
            {previewError === preview ? (
              <PreviewErrorState kind={previewError} onRetry={onRetryPreview ?? (() => undefined)} />
            ) : (
              <>
            {preview === "prd" && !isProductPanel && (
              <PrdPreview
                canEdit={capabilities.canEditProductArtifacts}
                documentDraft={documentDraft}
                onSaveDocumentDraft={onSaveDocumentDraft}
                requirement={selectedRequirement}
                productPackage={productPackage}
              />
            )}
            {(preview === "files" || preview === "diff") && (
              <CodeWorkbenchPreview
                agentId={selectedAgentId}
                canEdit={capabilities.canEditDevelopmentArtifacts}
                initialMode={preview === "diff" ? "diff" : "code"}
                requirement={selectedRequirement}
              />
            )}
            {(preview === "context" || preview === "sources") && (
              <ContextSourcesPanel
                canEdit={capabilities.canEditAgentWork}
                lockedIds={lockedContextIds}
                onToggle={onToggleContextSource}
                onToggleLock={onToggleContextLock}
                selectedIds={selectedContextIds}
                sources={sources}
              />
            )}
            {preview === "log" && !isBackendRuntimeLog && <LogPreview requirement={selectedRequirement} />}
            {preview === "test" && !isTestingReport && (
              <TestPreview
                canEdit={capabilities.canEditTestArtifacts}
                requirement={selectedRequirement}
                requirements={requirements}
                selectedAssetId={
                  explicitPreviewKind === "test" ? selectedAssetId : null
                }
              />
            )}
            {preview === "prototype" && !isProductPanel && <PrototypePreview canEdit={capabilities.canEditProductArtifacts} requirement={selectedRequirement} />}
            {preview === "pdf" && <PdfPreview requirement={selectedRequirement} />}
            {preview === "members" && (
              <MemberManager
                canManage={capabilities.canManageMembers}
                members={members}
                onChangeRole={onChangeMemberRole}
                roles={memberRoles}
              />
            )}
            {preview === "investment" && view === "project-detail" && selectedProject && (
              <ProjectInvestmentCard projectId={selectedProject.id} />
            )}
            {preview === "investment" && view === "requirement-detail" && selectedRequirement && (
              <RequirementInvestmentCard requirementId={selectedRequirement.id} />
            )}
            {preview === "project-settings" && (
              <ProjectSettingsPanel
                capabilities={capabilities}
                currentRoles={currentRoles}
                memberRoles={memberRoles}
                members={members}
                onChangeMemberRole={onChangeMemberRole}
                onOpenAsset={onOpenAsset}
                onSetRequirementStage={onSetRequirementStage}
                requirementStages={requirementStages}
                requirements={requirements}
                section="governance"
              />
            )}
            {selectedProject && PROJECT_CONTEXT_PREVIEW_KIND[preview ?? ""] && (
              <ProjectContextPanel kind={PROJECT_CONTEXT_PREVIEW_KIND[preview]} onOpenAsset={onOpenAsset} project={selectedProject} requirements={requirements} sources={sources} />
            )}
            {preview === "create-system" && (
              <CreateSystemPanel
                assets={assets}
                onCreate={onCreateProject}
                onOpenAssets={onOpenSmartAssets}
              />
            )}
            {preview === "asset" && <AssetDetail assetId={selectedAssetId} canEdit={capabilities.canManageAssets} requirement={selectedRequirement} />}
            {isProductPanel && preview && (
              <ProductPanel
                canEdit={capabilities.canEditProductArtifacts}
                dispatch={onProductPackageAction}
                kind={preview}
                requirement={selectedRequirement}
                state={productPackage}
                onPrototypeInspectChange={setPrototypeInspect}
                prototypeInspect={prototypeInspect}
              />
            )}
            {isRequirementBaselinePanel && preview && (
              <RequirementBaselinePanel
                canEdit={capabilities.canEditAgentWork}
                dispatch={onRequirementBaselineAction}
                kind={preview}
                requirement={selectedRequirement}
                state={requirementBaseline}
              />
            )}
            {(fullAgentPanelKinds.has(preview) || isBackendRuntimeLog || isTestingReport) && (
              <AgentToolPanel
                canEdit={capabilities.canEditAgentWork}
                kind={preview}
                requirement={selectedRequirement}
                session={agentToolSession}
              />
            )}
            {preview !== "files" &&
              !fullAgentPanelKinds.has(preview) &&
              !isProductPanel &&
              !isRequirementBaselinePanel &&
              !isBackendRuntimeLog &&
              !isTestingReport && (
                <ContextualScenePreview kind={preview} />
              )}
              </>
            )}
          </div>
          </aside>
        </>
      )}
      <aside className="right-rail" aria-label="辅助工具栏">
        {mainTools.map(({ kind, label, icon: Icon }) => (
          <button
            aria-label={label}
            className={preview === kind ? "active" : ""}
            data-tooltip={label}
            key={kind}
            onClick={() => onSelect(kind)}
            type="button"
          >
            <Icon size={18} />
          </button>
        ))}
        <div className="rail-bottom-group">
          {contextTools.map(({ kind, label, icon: Icon }) => (
            <button
              aria-label={label}
              className={preview === kind ? "active" : ""}
              data-tooltip={label}
              key={kind}
              onClick={() => onSelect(kind)}
              type="button"
            >
              <Icon size={18} />
            </button>
          ))}
          <button aria-label="收起辅助栏" data-tooltip="收起辅助栏" onClick={onClose} type="button">
            <PanelRightClose size={18} />
          </button>
        </div>
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
      <div className="document-toolbar">
        <span>{prototype.title} {prototype.version}</span>
        <div className="prototype-preview-actions">
          <button disabled={!canEdit} type="button">在画布中编辑</button>
          <a href={getPrototypeBrowserUrl(canEdit)} rel="noreferrer" target="_blank">
            在浏览器打开
          </a>
        </div>
      </div>
      <PrototypePreviewShell
        canEdit={canEdit}
        compact
        requirementId={requirement.id}
      />
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
  documentDraft,
  onSaveDocumentDraft,
  productPackage,
}: {
  requirement: Requirement | null;
  canEdit: boolean;
  documentDraft: string;
  onSaveDocumentDraft(draft: string): void;
  productPackage: ProductPackageState;
}) {
  const [request, setRequest] = useState("");
  const document = productDocuments.find(
    (item) => item.requirementId === requirement?.id && item.kind === "prd",
  );
  if (!requirement || !document) {
    return <EmptyPreview message="当前需求暂无 PRD 产物。" />;
  }
  return (
    <article className="document-preview">
      <div className="document-toolbar">
        <span>{document.title} {document.version}</span>
      </div>
      <PrdDocumentSheet
        title={requirement.title}
        meta={`${requirement.code} · 版本 ${document.version} · ${document.updatedAt}`}
        body={productPackage.prdBody}
      />
      <aside className="prd-ai-panel drawer-prd-ai-panel">
        <div><Sparkles size={17} /><strong>通过对话修改</strong></div>
        <p>描述需要修改的章节或规则，Agent 会先生成修订建议。</p>
        <textarea
          aria-label="PRD 修改要求"
          disabled={!canEdit}
          onChange={(event) => setRequest(event.target.value)}
          placeholder="例如：补充批量修改角色时的确认规则"
          value={request}
        />
        <button
          className="primary-small"
          disabled={!canEdit || !request.trim()}
          onClick={() => {
            onSaveDocumentDraft(request.trim());
            setRequest("");
          }}
          type="button"
        >
          生成修订建议
        </button>
        {documentDraft && (
          <div className="revision-proposal">
            <span>修订建议 · 待确认</span>
            <p>{documentDraft}</p>
            <small>影响：权限规则、交互原型、AC-11 测试用例</small>
            <button
              disabled={!canEdit}
              onClick={() => onSaveDocumentDraft("")}
              type="button"
            >
              确认并保存新版本
            </button>
          </div>
        )}
      </aside>
    </article>
  );
}

function LogPreview({ requirement }: { requirement: Requirement | null }) {
  if (!requirement) return <EmptyPreview message="选择需求后查看 Agent 执行日志。" />;
  return <div className="log-preview"><p>读取 {requirement.code} 自动上下文</p><p>分析 {requirement.title}</p><p>生成当前 Agent 结果</p><p className="success-line">执行完成 · 结果保留在当前需求</p></div>;
}

function TestPreview({
  requirement,
  requirements,
  selectedAssetId,
  canEdit,
}: {
  requirement: Requirement | null;
  requirements: Requirement[];
  selectedAssetId: string | null;
  canEdit: boolean;
}) {
  const report = selectedAssetId
    ? testReports.find((item) => item.id === selectedAssetId)
    : testReports.find((item) => item.requirementId === requirement?.id);
  const reportRequirement = report
    ? requirements.find((item) => item.id === report.requirementId) ??
      (requirement?.id === report.requirementId ? requirement : null)
    : null;
  const failedCase = testCases.find(
    (item) =>
      item.requirementId === reportRequirement?.id && item.status === "failed",
  );
  if (!reportRequirement || !report) {
    return <EmptyPreview message="当前需求暂无测试报告。" />;
  }
  return <div className="test-preview"><div className="test-score"><strong>{report.passRate}%</strong><span>测试通过率</span></div><h3>{report.title}</h3><p>通过 {report.passed}　失败 {report.failed}　跳过 {report.skipped}</p><div className="test-bar"><span style={{ width: `${report.passRate}%` }} /></div>{failedCase && <article className="test-failure-detail"><b>失败：{failedCase.title}</b><span>对应 {failedCase.specRef}</span><p>该结果仅属于 {reportRequirement.code}，等待用户确认后再创建修复任务。</p></article>}<button className="primary-small" disabled={!canEdit} type="button">创建修复任务</button></div>;
}

function EmptyPreview({ message }: { message: string }) {
  return <div className="workspace-empty-state compact"><FileText size={22} /><strong>{message}</strong><p>尚未生成的证据不会使用其他需求的数据代替。</p></div>;
}
