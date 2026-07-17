# KFlow Multi-Requirement Spec Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing KFlow web Demo into a multi-requirement, Spec-driven project workspace with editable members and assets, role-specific Agent workbenches, prototype/PDF previews, development tasks, code Diff, and test evidence.

**Architecture:** Keep the existing reducer-driven single-page Demo and three-column shell. Add focused domain types and deterministic demo data, split the current project and task components into project overview, requirement shell, asset browser, member manager, and Agent workspace components, and use the existing right drawer for contextual previews. All interactions remain frontend-only and reset to deterministic demo data after refresh.

**Tech Stack:** React 19, TypeScript 5.9, vinext/Next-compatible app router, lucide-react, Vitest 4, Testing Library, CSS in `app/globals.css`.

## Global Constraints

- Keep the left navigation items: 新建任务、项目、智能资产、最新任务.
- Keep the center composer fixed at the bottom of task and requirement workspaces.
- Keep the right auxiliary rail collapsed by default.
- Rename the research mode UI copy from “代码开发” to “系统开发”; keep the internal `Mode` value as `research` to avoid unrelated migration work.
- A project can contain multiple requirements; each requirement owns its Spec, prototype, product document, development tasks, code changes, test cases, and report.
- All project members can view all project requirements, progress, code, and test assets; project role controls editing.
- Requirement stages are real and configurable in concept, but any edit-capable member may jump or roll back to any stage.
- Unmet review gates warn and record risk; they do not block a stage change.
- Do not add Agent orchestration or enforce a linear Agent sequence.
- Do not add backend persistence, real Git writes, real PDF conversion, CI execution, or external integrations.
- Preserve all existing office-mode and smart-asset interactions.

---

### Task 1: Domain Model and Deterministic State Transitions

**Files:**
- Modify: `app/lib/types.ts`
- Modify: `app/lib/demo-data.ts`
- Modify: `app/lib/demo-state.ts`
- Test: `app/lib/demo-state.test.ts`

**Interfaces:**
- Produces: `Requirement`, `ProjectMember`, `ProjectAssetSummary`, `ProductDocument`, `DevelopmentTask`, `CodeChange`, `TestCase`, `TestReport`, `RequirementStage`, `ReviewGateStatus`, `ProjectSection`, and expanded `PreviewKind`.
- Produces reducer actions: `select-requirement`, `set-requirement-stage`, `select-project-section`, `select-project-asset`, `set-member-role`, `set-development-task-status`, and `set-document-draft`.
- Later tasks consume `requirements`, `projectMembers`, `productDocuments`, `developmentTasks`, `codeChanges`, `testCases`, and `testReports` from `demo-data.ts`.

- [ ] **Step 1: Write reducer tests for requirement, role, task, and document changes**

Add these cases to `app/lib/demo-state.test.ts`:

```ts
it("selects a requirement and opens its workspace", () => {
  const next = clientReducer(initialClientState, {
    type: "select-requirement",
    requirementId: "role-permissions",
  });

  expect(next.selectedRequirementId).toBe("role-permissions");
  expect(next.view).toBe("requirement-detail");
  expect(next.selectedAgentId).toBe("requirement-analysis");
});

it("moves a requirement to any stage and records skipped-gate risk", () => {
  const next = clientReducer(initialClientState, {
    type: "set-requirement-stage",
    requirementId: "role-permissions",
    stage: "testing",
    reason: "联调窗口提前，先执行核心回归",
  });

  expect(next.requirementStages["role-permissions"]).toBe("testing");
  expect(next.stageRisks["role-permissions"]).toContain("联调窗口提前");
});

it("changes a project member role", () => {
  const next = clientReducer(initialClientState, {
    type: "set-member-role",
    memberId: "member-lin",
    role: "testing",
  });

  expect(next.memberRoles["member-lin"]).toBe("testing");
});

it("marks a development task and saves a document draft", () => {
  const working = clientReducer(initialClientState, {
    type: "set-development-task-status",
    taskId: "dev-role-panel",
    status: "in-progress",
  });
  const saved = clientReducer(working, {
    type: "set-document-draft",
    documentId: "prd-role-permissions",
    draft: "新增：批量调整成员角色时必须二次确认。",
  });

  expect(saved.developmentTaskStatuses["dev-role-panel"]).toBe("in-progress");
  expect(saved.documentDrafts["prd-role-permissions"]).toContain("二次确认");
});
```

- [ ] **Step 2: Run the state tests and verify failure**

Run: `npm test -- app/lib/demo-state.test.ts`

Expected: FAIL because the new action names and state fields do not exist.

- [ ] **Step 3: Define the domain types**

Add the following declarations to `app/lib/types.ts` and extend `ViewId` with `requirement-detail` and `project-asset`:

```ts
export type RequirementStage =
  | "clarifying"
  | "designing"
  | "ready-for-dev"
  | "developing"
  | "ready-for-test"
  | "testing"
  | "ready-for-release"
  | "done";

export type ReviewGateStatus = "pending" | "approved" | "objected" | "skipped";
export type ProjectRole = "admin" | "product" | "development" | "testing" | "viewer";
export type DeliverableStatus = "draft" | "reviewing" | "confirmed" | "changed";
export type DevelopmentTaskStatus = "not-started" | "in-progress" | "done" | "blocked";
export type ProjectSection = "overview" | "documents" | "memory" | "repositories" | "tests";

export interface ProjectMember {
  id: string;
  projectId: string;
  name: string;
  initials: string;
  role: ProjectRole;
  team: string;
}

export interface Requirement {
  id: string;
  projectId: string;
  code: string;
  title: string;
  summary: string;
  stage: RequirementStage;
  gateStatus: ReviewGateStatus;
  gateLabel: string;
  specVersion: string;
  specCompletion: number;
  owners: { product: string; development: string; testing: string };
  counts: { prototypes: number; documents: number; tasks: number; changes: number; tests: number };
  updatedAt: string;
}

export interface ProjectAssetSummary {
  section: Exclude<ProjectSection, "overview">;
  label: string;
  value: string;
  note: string;
  updatedAt: string;
}

export interface ProductDocument {
  id: string;
  projectId: string;
  requirementId: string;
  title: string;
  kind: "prd" | "prototype";
  status: DeliverableStatus;
  version: string;
  updatedAt: string;
}

export interface DevelopmentTask {
  id: string;
  requirementId: string;
  title: string;
  status: DevelopmentTaskStatus;
  specRef: string;
  repository: string;
  files: number;
}

export interface CodeChange {
  id: string;
  requirementId: string;
  taskId: string;
  file: string;
  additions: number;
  deletions: number;
  rationale: string;
}

export interface TestCase {
  id: string;
  requirementId: string;
  title: string;
  type: "manual" | "automated";
  status: "pending" | "passed" | "failed";
  specRef: string;
}

export interface TestReport {
  id: string;
  requirementId: string;
  title: string;
  passRate: number;
  passed: number;
  failed: number;
  skipped: number;
}
```

Expand `PreviewKind` to:

```ts
export type PreviewKind =
  | "prd"
  | "prototype"
  | "pdf"
  | "diff"
  | "context"
  | "log"
  | "test"
  | "members"
  | "asset";
```

- [ ] **Step 4: Add deterministic project entities**

Populate `app/lib/demo-data.ts` with three `customer-portal` requirements, five members, four asset summaries, two product documents, three development tasks, three code changes, four test cases, and one test report. Use these visible demo requirements:

```ts
export const requirements: Requirement[] = [
  {
    id: "role-permissions",
    projectId: "customer-portal",
    code: "REQ-032",
    title: "角色与成员权限重构",
    summary: "统一租户、项目和资源级操作边界",
    stage: "developing",
    gateStatus: "approved",
    gateLabel: "产品方案已确认",
    specVersion: "v1.4",
    specCompletion: 92,
    owners: { product: "陈楠", development: "林川", testing: "周祺" },
    counts: { prototypes: 3, documents: 2, tasks: 6, changes: 8, tests: 26 },
    updatedAt: "10 分钟前",
  },
  {
    id: "sso-login",
    projectId: "customer-portal",
    code: "REQ-029",
    title: "企业 SSO 登录体验优化",
    summary: "补齐异常反馈、租户选择和登录审计",
    stage: "testing",
    gateStatus: "objected",
    gateLabel: "2 项测试异议",
    specVersion: "v2.1",
    specCompletion: 100,
    owners: { product: "顾言", development: "赵屿", testing: "周祺" },
    counts: { prototypes: 2, documents: 1, tasks: 5, changes: 11, tests: 34 },
    updatedAt: "昨天",
  },
  {
    id: "audit-export",
    projectId: "customer-portal",
    code: "REQ-035",
    title: "权限审计记录导出",
    summary: "支持按成员、操作和时间范围导出审计记录",
    stage: "designing",
    gateStatus: "pending",
    gateLabel: "等待产品评审",
    specVersion: "v0.8",
    specCompletion: 68,
    owners: { product: "陈楠", development: "林川", testing: "待分配" },
    counts: { prototypes: 1, documents: 1, tasks: 0, changes: 0, tests: 6 },
    updatedAt: "2 小时前",
  },
];
```

Use these exact supporting records so later component tests share stable labels:

```ts
export const projectMembers: ProjectMember[] = [
  { id: "member-chen", projectId: "customer-portal", name: "陈楠", initials: "陈", role: "admin", team: "产品中心" },
  { id: "member-lin", projectId: "customer-portal", name: "林川", initials: "林", role: "development", team: "前端研发" },
  { id: "member-zhao", projectId: "customer-portal", name: "赵屿", initials: "赵", role: "development", team: "后端研发" },
  { id: "member-zhou", projectId: "customer-portal", name: "周祺", initials: "周", role: "testing", team: "质量保障" },
  { id: "member-gu", projectId: "customer-portal", name: "顾言", initials: "顾", role: "product", team: "产品中心" },
];

export const projectAssetSummaries: ProjectAssetSummary[] = [
  { section: "documents", label: "产品文档", value: "8 份", note: "PRD、原型与验收标准", updatedAt: "10 分钟前" },
  { section: "memory", label: "项目记忆", value: "23 条", note: "人工确认的范围与决策", updatedAt: "昨天" },
  { section: "repositories", label: "代码库", value: "3 个", note: "主仓库与依赖服务", updatedAt: "8 分钟前" },
  { section: "tests", label: "测试资产", value: "42 项", note: "用例、报告与缺陷", updatedAt: "20 分钟前" },
];

export const productDocuments: ProductDocument[] = [
  { id: "prd-role-permissions", projectId: "customer-portal", requirementId: "role-permissions", title: "角色与成员权限 PRD", kind: "prd", status: "changed", version: "v1.4", updatedAt: "10 分钟前" },
  { id: "prototype-role-permissions", projectId: "customer-portal", requirementId: "role-permissions", title: "角色配置交互原型", kind: "prototype", status: "confirmed", version: "V3", updatedAt: "昨天" },
];

export const developmentTasks: DevelopmentTask[] = [
  { id: "dev-role-panel", requirementId: "role-permissions", title: "重构角色面板权限判断", status: "not-started", specRef: "AC-07", repository: "customer-portal", files: 3 },
  { id: "dev-member-batch", requirementId: "role-permissions", title: "增加成员批量角色操作", status: "in-progress", specRef: "US-04", repository: "customer-portal", files: 5 },
  { id: "dev-audit-api", requirementId: "role-permissions", title: "补齐权限变更审计接口", status: "done", specRef: "BR-12", repository: "portal-service", files: 4 },
];

export const codeChanges: CodeChange[] = [
  { id: "change-role-panel", requirementId: "role-permissions", taskId: "dev-role-panel", file: "src/features/roles/RolePanel.tsx", additions: 18, deletions: 6, rationale: "将管理员判断替换为项目权限集合判断" },
  { id: "change-role-hook", requirementId: "role-permissions", taskId: "dev-role-panel", file: "src/features/roles/useRolePermissions.ts", additions: 42, deletions: 0, rationale: "集中计算资源范围与操作权限" },
  { id: "change-role-test", requirementId: "role-permissions", taskId: "dev-role-panel", file: "src/features/roles/RolePanel.test.tsx", additions: 35, deletions: 2, rationale: "覆盖项目管理员和观察者权限" },
];

export const testCases: TestCase[] = [
  { id: "tc-role-edit", requirementId: "role-permissions", title: "项目管理员可以修改成员角色", type: "automated", status: "passed", specRef: "AC-07" },
  { id: "tc-role-viewer", requirementId: "role-permissions", title: "观察者只能查看项目内容", type: "automated", status: "passed", specRef: "AC-09" },
  { id: "tc-role-batch", requirementId: "role-permissions", title: "批量修改角色需要二次确认", type: "manual", status: "failed", specRef: "AC-11" },
  { id: "tc-role-audit", requirementId: "role-permissions", title: "角色变更写入审计记录", type: "automated", status: "pending", specRef: "AC-12" },
];

export const testReports: TestReport[] = [
  { id: "report-role-regression", requirementId: "role-permissions", title: "角色管理回归测试报告", passRate: 92, passed: 23, failed: 2, skipped: 1 },
];
```

- [ ] **Step 5: Implement reducer state and actions**

Add these fields to `ClientState`:

```ts
selectedRequirementId: string | null;
projectSection: ProjectSection;
selectedAssetId: string | null;
requirementStages: Record<string, RequirementStage>;
stageRisks: Record<string, string>;
memberRoles: Record<string, ProjectRole>;
developmentTaskStatuses: Record<string, DevelopmentTaskStatus>;
documentDrafts: Record<string, string>;
```

Initialize them from the visible demo entities, then implement the new actions exactly as pure immutable updates. `select-requirement` must set `view: "requirement-detail"` and `selectedAgentId: "requirement-analysis"`; `select-project-section` must set `view` to `project-detail` for `overview` and `project-asset` for other sections; `set-requirement-stage` must update the stage and store `reason` under the requirement ID.

- [ ] **Step 6: Run state tests**

Run: `npm test -- app/lib/demo-state.test.ts`

Expected: all reducer tests PASS.

- [ ] **Step 7: Commit the domain model**

```bash
git add app/lib/types.ts app/lib/demo-data.ts app/lib/demo-state.ts app/lib/demo-state.test.ts
git commit -m "feat: model multi-requirement project state"
```

---

### Task 2: System Development Copy and Requirement-Centered Project Overview

**Files:**
- Modify: `app/components/home-view.tsx`
- Modify: `app/components/projects-view.tsx`
- Create: `app/components/project-detail-view.tsx`
- Create: `app/components/requirement-list.tsx`
- Modify: `app/page.tsx`
- Test: `app/components/client-demo.test.tsx`

**Interfaces:**
- Consumes: `Requirement`, `ProjectAssetSummary`, `RequirementStage`, `ReviewGateStatus`.
- Produces: `ProjectDetailView` callbacks `onOpenSection(section)`, `onOpenMembers()`, `onOpenRequirement(id)`, and `onSetRequirementStage(id, stage, reason)`.
- Produces: `RequirementList` with direct stage selection and risk badges.

- [ ] **Step 1: Replace the old project test with multi-requirement expectations and add the copy test**

Add:

```tsx
test("uses system development copy on the new-task page", async () => {
  render(<Page />);
  await userEvent.click(screen.getByRole("button", { name: "新建任务" }));
  expect(screen.getByRole("button", { name: "系统开发" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "代码开发" })).not.toBeInTheDocument();
});

test("shows clickable project assets and multiple requirements", async () => {
  render(<Page />);
  await userEvent.click(screen.getByRole("button", { name: "项目" }));
  await userEvent.click(screen.getByRole("button", { name: "打开企业客户门户 V3.2" }));

  for (const label of ["产品文档", "项目记忆", "代码库", "测试资产"]) {
    expect(screen.getByRole("button", { name: new RegExp(label) })).toBeInTheDocument();
  }
  expect(screen.getByText("角色与成员权限重构")).toBeInTheDocument();
  expect(screen.getByText("企业 SSO 登录体验优化")).toBeInTheDocument();
  expect(screen.getByText("权限审计记录导出")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the two tests and verify failure**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: FAIL because “系统开发” and the requirement list are absent.

- [ ] **Step 3: Rename the visible mode copy**

In `home-view.tsx`, keep `mode === "research"` logic but render the research button label and heading as “系统开发” and “系统开发 Agent”. Update accessible labels and descriptive copy in the same component.

- [ ] **Step 4: Extract the project detail page**

Move the selected-project branch from `ProjectsView` into `ProjectDetailView`. Render this order without internal tabs:

```tsx
<div className="project-detail page-scroll">
  <ProjectDetailHeader />
  <ProjectAssetCards />
  <RequirementList />
</div>
```

`ProjectDetailHeader` must render the member avatar group, “管理成员”, “新建需求”, shared-context count, updated time, and a “更多项目操作” menu. The menu contains “项目设置”“需求状态配置”“审核规则”; in this frontend Demo each entry opens a compact explanatory panel rather than a persisted configuration backend. `ProjectAssetCards` must render the four summaries as full-card buttons and call `onOpenSection`.

- [ ] **Step 5: Build the requirement list**

Use a desktop table-like list with mobile cards. Each requirement must expose an accessible button named `打开需求 ${requirement.title}` and a select named `切换 ${requirement.title} 状态`. Map stages to these labels:

```ts
export const stageLabels: Record<RequirementStage, string> = {
  clarifying: "需求澄清",
  designing: "方案设计",
  "ready-for-dev": "待开发",
  developing: "开发中",
  "ready-for-test": "待测试",
  testing: "测试中",
  "ready-for-release": "待上线",
  done: "已完成",
};
```

Show the Spec percentage, gate badge, three owners, artifact counts, and updated time. When selecting a different stage, call `onSetRequirementStage` with `"由项目成员直接调整"` as the Demo audit reason.

- [ ] **Step 6: Wire project detail callbacks in `page.tsx`**

Pass requirements filtered by project, derived stages from reducer state, and the four asset summaries. Dispatch the reducer actions rather than adding local component state.

- [ ] **Step 7: Add explicit overview styles**

Append CSS for `.project-member-actions`, `.member-stack`, `.requirement-list`, `.requirement-row`, `.requirement-main`, `.requirement-stage-select`, `.gate-badge`, `.spec-meter`, and `.requirement-counts`. Use 12px radii, 1px `#e7e7eb` borders, `#6f55d9` for active controls, and a stacked card layout below 900px.

- [ ] **Step 8: Run tests and commit**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: project and mode-copy tests PASS.

```bash
git add app/components/home-view.tsx app/components/projects-view.tsx app/components/project-detail-view.tsx app/components/requirement-list.tsx app/page.tsx app/globals.css app/components/client-demo.test.tsx
git commit -m "feat: center projects on multiple requirements"
```

---

### Task 3: Member Manager and Clickable Project Asset Browser

**Files:**
- Create: `app/components/member-manager.tsx`
- Create: `app/components/project-assets-view.tsx`
- Modify: `app/components/preview-drawer.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `app/components/client-demo.test.tsx`

**Interfaces:**
- Consumes: `ProjectMember`, `ProjectRole`, `ProjectSection`, `ProductDocument`, `AssetItem`.
- Produces: `MemberManager({ members, roles, onChangeRole, onClose })`.
- Produces: `ProjectAssetsView({ section, documents, assets, onOpenPreview, onBack })`.

- [ ] **Step 1: Write interaction tests**

Add:

```tsx
test("opens member management and edits a role", async () => {
  render(<Page />);
  await openCustomerPortal();
  await userEvent.click(screen.getByRole("button", { name: "管理成员" }));
  expect(screen.getByRole("complementary", { name: "成员管理" })).toBeInTheDocument();
  await userEvent.selectOptions(screen.getByLabelText("修改林川的项目角色"), "testing");
  expect(screen.getByLabelText("修改林川的项目角色")).toHaveValue("testing");
});

test("opens product documents and previews an asset", async () => {
  render(<Page />);
  await openCustomerPortal();
  await userEvent.click(screen.getByRole("button", { name: /产品文档/ }));
  expect(screen.getByRole("heading", { name: "产品文档" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "查看角色与成员权限 PRD" }));
  expect(screen.getByRole("complementary", { name: "产物预览" })).toBeInTheDocument();
});
```

Define this local helper in the test file:

```ts
async function openCustomerPortal() {
  await userEvent.click(screen.getByRole("button", { name: "项目" }));
  await userEvent.click(screen.getByRole("button", { name: "打开企业客户门户 V3.2" }));
}
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: FAIL because the member manager and asset view are absent.

- [ ] **Step 3: Implement the member drawer**

Render each member name, team, initials, and a role select. Use these exact option labels: 项目管理员、产品、研发、测试、观察者. The root aside must be `aria-label="成员管理"`. Role changes call `onChangeRole(member.id, role)` immediately.

- [ ] **Step 4: Implement the asset browser**

Render a header with “返回项目”, section heading, search input, “新建” button, and list rows. Product documents show status, version, associated requirement, update time, “查看” and “编辑”. Project memory shows confirmation and references. Repositories show branch and index time. Test assets show type, requirement, and result.

The view and edit buttons both open the right drawer in this Demo; edit mode shows a toolbar with “保存新版本”.

- [ ] **Step 5: Extend the preview drawer**

Allow `PreviewDrawer` to receive `members`, `memberRoles`, `selectedAssetId`, and `onChangeMemberRole`. Render `MemberManager` when `preview === "members"`, and render a document/asset detail panel when `preview === "asset"`. Keep Escape-to-close behavior.

- [ ] **Step 6: Wire asset navigation and member editing**

In `page.tsx`, dispatch `select-project-section`, `select-project-asset`, `open-preview`, and `set-member-role`. When the user goes back from an asset view, dispatch `select-project-section` with `overview`.

- [ ] **Step 7: Style and verify**

Add `.member-list`, `.member-row`, `.member-role-select`, `.asset-browser`, `.project-asset-row`, `.asset-row-actions`, and mobile layouts. Ensure drawer controls remain usable at 360px width.

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: member and asset interaction tests PASS.

- [ ] **Step 8: Commit**

```bash
git add app/components/member-manager.tsx app/components/project-assets-view.tsx app/components/preview-drawer.tsx app/page.tsx app/globals.css app/components/client-demo.test.tsx
git commit -m "feat: add member and project asset management"
```

---

### Task 4: Shared Requirement Shell and Agent Workspace Router

**Files:**
- Create: `app/components/requirement-workspace.tsx`
- Create: `app/components/workspaces/workspace-router.tsx`
- Create: `app/components/workspaces/requirement-analysis-workspace.tsx`
- Create: `app/components/workspaces/prototype-workspace.tsx`
- Create: `app/components/workspaces/prd-workspace.tsx`
- Create: `app/components/workspaces/development-workspace.tsx`
- Create: `app/components/workspaces/code-review-workspace.tsx`
- Create: `app/components/workspaces/testing-workspace.tsx`
- Modify: `app/components/composer.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `app/components/client-demo.test.tsx`

**Interfaces:**
- Produces: `WorkspaceRouter({ agent, requirement, onOpenPreview, onSetTaskStatus, onSaveDocumentDraft })`.
- Produces: common requirement header with stage, gate, Spec version, owners, and Agent selector.
- Reuses `Composer` with `mode="research"`, selected project, and selected Agent.

- [ ] **Step 1: Write the workspace-routing test**

Add:

```tsx
test("opens a requirement and changes workspace with the selected Agent", async () => {
  render(<Page />);
  await openCustomerPortal();
  await userEvent.click(screen.getByRole("button", { name: "打开需求 角色与成员权限重构" }));
  expect(screen.getByText("Spec v1.4")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "产品需求工作台" })).toBeInTheDocument();

  await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "prototype");
  expect(screen.getByRole("heading", { name: "原型设计工作台" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: FAIL because the requirement view and workspace router do not exist.

- [ ] **Step 3: Implement the requirement shell**

Render a compact header with breadcrumb back to the project, requirement code/title, stage select, gate badge, `Spec ${version}`, owner chips, and Agent select. Render `WorkspaceRouter` in the scrollable center and `Composer` at the bottom.

- [ ] **Step 4: Implement routing by Agent ID**

Use this exact routing:

```ts
if (agent.id === "requirement-analysis") return <RequirementAnalysisWorkspace {...props} />;
if (agent.id === "prototype") return <PrototypeWorkspace {...props} />;
if (agent.id === "prd-writer") return <PrdWorkspace {...props} />;
if (agent.id === "frontend-dev" || agent.id === "backend-dev") return <DevelopmentWorkspace {...props} />;
if (agent.id === "code-review") return <CodeReviewWorkspace {...props} />;
if (agent.id === "testing") return <TestingWorkspace {...props} />;
return <RequirementAnalysisWorkspace {...props} />;
```

Create all six routed workspace components in this task so every route compiles independently. Each component renders its final accessible heading and one role-specific summary card: “产品需求工作台” with Spec completeness, “原型设计工作台” with page count, “PRD 撰写工作台” with document version, “开发工作台” with repository and task count, “代码审查工作台” with issue count, and “测试工作台” with case count. Tasks 5 and 6 enrich these already-functional components.

- [ ] **Step 5: Build the requirements-analysis canvas**

Render editable-looking cards for目标与价值、范围、非范围、用户故事、业务规则、待澄清问题、验收标准. Use “已确认” and “待确认” badges and an “继续澄清” action. No content-editing backend is required.

- [ ] **Step 6: Wire selection and preserve the bottom composer**

`page.tsx` must render `RequirementWorkspace` for `view === "requirement-detail"`, look up the selected requirement and Agent, and keep the existing message/execution behavior for composer submissions.

- [ ] **Step 7: Style, test, and commit**

Add `.requirement-workspace`, `.requirement-header`, `.requirement-toolbar`, `.workspace-canvas`, `.workspace-section-grid`, and `.spec-summary-card`. Keep the composer above mobile safe-area spacing.

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: workspace routing test PASS.

```bash
git add app/components/requirement-workspace.tsx app/components/workspaces/workspace-router.tsx app/components/workspaces/requirement-analysis-workspace.tsx app/components/workspaces/prototype-workspace.tsx app/components/workspaces/prd-workspace.tsx app/components/workspaces/development-workspace.tsx app/components/workspaces/code-review-workspace.tsx app/components/workspaces/testing-workspace.tsx app/components/composer.tsx app/page.tsx app/globals.css app/components/client-demo.test.tsx
git commit -m "feat: add shared requirement Agent workspace"
```

---

### Task 5: Prototype and PRD Workspaces with Natural-Language Revision and PDF Preview

**Files:**
- Modify: `app/components/workspaces/prototype-workspace.tsx`
- Modify: `app/components/workspaces/prd-workspace.tsx`
- Modify: `app/components/preview-drawer.tsx`
- Modify: `app/components/workspaces/workspace-router.tsx`
- Modify: `app/globals.css`
- Test: `app/components/client-demo.test.tsx`

**Interfaces:**
- Prototype workspace opens `prototype` preview.
- PRD workspace consumes `documentDrafts[document.id]`, emits `onSaveDocumentDraft(document.id, text)`, and opens `pdf` preview.
- Preview drawer renders interactive prototype and PDF-like document sheet.

- [ ] **Step 1: Write product-workspace tests**

Add:

```tsx
test("previews the prototype from the prototype Agent", async () => {
  render(<Page />);
  await openRoleRequirement();
  await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "prototype");
  await userEvent.click(screen.getByRole("button", { name: "预览角色配置页面" }));
  expect(screen.getByRole("complementary", { name: "页面预览" })).toBeInTheDocument();
  expect(screen.getByText("成员与角色")).toBeInTheDocument();
});

test("revises a PRD with natural language and opens PDF preview", async () => {
  render(<Page />);
  await openRoleRequirement();
  await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "prd-writer");
  const input = screen.getByLabelText("PRD 修改要求");
  await userEvent.type(input, "增加批量修改角色的二次确认说明");
  await userEvent.click(screen.getByRole("button", { name: "生成修订建议" }));
  expect(screen.getByText(/二次确认说明/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "预览 PDF" }));
  expect(screen.getByRole("complementary", { name: "PDF 预览" })).toBeInTheDocument();
});

test("warns before leaving an unconfirmed PRD revision", async () => {
  const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
  render(<Page />);
  await openRoleRequirement();
  await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "prd-writer");
  await userEvent.type(screen.getByLabelText("PRD 修改要求"), "调整角色批量操作说明");
  await userEvent.click(screen.getByRole("button", { name: "生成修订建议" }));
  await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "prototype");
  expect(confirmSpy).toHaveBeenCalledWith("当前修订尚未确认，是否放弃并切换 Agent？");
  expect(screen.getByRole("heading", { name: "PRD 撰写工作台" })).toBeInTheDocument();
  confirmSpy.mockRestore();
});
```

Import `vi` from Vitest and define:

```ts
async function openRoleRequirement() {
  await openCustomerPortal();
  await userEvent.click(screen.getByRole("button", { name: "打开需求 角色与成员权限重构" }));
}
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: FAIL because product workspaces are absent.

- [ ] **Step 3: Implement the prototype workspace**

Render a page tree with 总览、成员与角色、角色详情、操作审计; a central browser-frame canvas showing “成员与角色”; device buttons 桌面端、平板端、移动端; interaction hotspot badges; version `V3`; and a button named “预览角色配置页面”.

- [ ] **Step 4: Implement the PRD workspace**

Render a document outline, editor sheet with background/roles/flows/acceptance sections, status “已确认 · 有新修订”, revision history, a textarea labeled “PRD 修改要求”, “生成修订建议”, “确认并保存新版本”, and “预览 PDF”. Store the typed request through `set-document-draft` and show it in a purple revision proposal card. While a draft exists, the Agent-change handler calls `window.confirm("当前修订尚未确认，是否放弃并切换 Agent？")`; a false result keeps the PRD Agent selected, and confirming the saved version clears the draft before switching.

- [ ] **Step 5: Add prototype and PDF drawers**

For `prototype`, render a desktop page preview with side navigation, member table, role pills, search, “添加成员”, and row actions. Use `aria-label="页面预览"`.

For `pdf`, render a paginated A4-like sheet with title, metadata, role table, and acceptance criteria plus a toolbar containing `PRD v1.4.pdf` and “下载”. Use `aria-label="PDF 预览"`.

- [ ] **Step 6: Style, test, and commit**

Add explicit CSS for `.prototype-workspace`, `.prototype-page-tree`, `.prototype-canvas`, `.prototype-browser`, `.prd-workspace`, `.document-outline`, `.prd-editor`, `.revision-proposal`, `.prototype-preview-shell`, and `.pdf-sheet`.

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: prototype and PRD tests PASS.

```bash
git add app/components/workspaces/prototype-workspace.tsx app/components/workspaces/prd-workspace.tsx app/components/preview-drawer.tsx app/components/workspaces/workspace-router.tsx app/globals.css app/components/client-demo.test.tsx
git commit -m "feat: add prototype and PRD workspaces"
```

---

### Task 6: Development, Code Review, and Testing Workspaces

**Files:**
- Modify: `app/components/workspaces/development-workspace.tsx`
- Modify: `app/components/workspaces/code-review-workspace.tsx`
- Modify: `app/components/workspaces/testing-workspace.tsx`
- Modify: `app/components/preview-drawer.tsx`
- Modify: `app/components/workspaces/workspace-router.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `app/components/client-demo.test.tsx`

**Interfaces:**
- Development workspace consumes `DevelopmentTask[]`, `developmentTaskStatuses`, and `CodeChange[]`; emits task status changes and opens `diff`.
- Testing workspace consumes `TestCase[]` and `TestReport`; opens `test`.
- Code review workspace consumes `CodeChange[]`; opens `diff` for the selected issue.

- [ ] **Step 1: Write development and testing tests**

Add:

```tsx
test("marks a development task and opens the code diff", async () => {
  render(<Page />);
  await openRoleRequirement();
  await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "frontend-dev");
  await userEvent.selectOptions(screen.getByLabelText("角色面板任务状态"), "in-progress");
  expect(screen.getByLabelText("角色面板任务状态")).toHaveValue("in-progress");
  await userEvent.click(screen.getByRole("button", { name: "查看角色面板代码差异" }));
  expect(screen.getByRole("complementary", { name: "代码差异" })).toBeInTheDocument();
  expect(screen.getByText("AI 修改说明")).toBeInTheDocument();
});

test("shows Spec-linked test cases and a test report", async () => {
  render(<Page />);
  await openRoleRequirement();
  await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "testing");
  expect(screen.getByText("AC-07")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "查看角色管理测试报告" }));
  expect(screen.getByRole("complementary", { name: "测试报告" })).toBeInTheDocument();
  expect(screen.getByText("92%" )).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: FAIL because development and testing workspaces are absent.

- [ ] **Step 3: Implement the development workspace**

Render a Spec summary, repository/branch/base-commit chips, task list, changed-file summary, implementation log, and test result. Each task row has a status select. The `dev-role-panel` row uses accessible label “角色面板任务状态” and button “查看角色面板代码差异”.

- [ ] **Step 4: Implement the Diff drawer**

Render a file list, additions/deletions counts, unified code block for `src/features/roles/RolePanel.tsx`, Spec reference `AC-07`, “AI 修改说明”, test result, and buttons “接受变更”, “继续修改”, “放弃本次变更”.

- [ ] **Step 5: Implement code review**

Render three issue cards grouped by高风险、建议、已通过. Each issue shows file, line, requirement coverage, explanation, and “查看 Diff”.

- [ ] **Step 6: Implement testing workspace and report**

Render test cases with type, status and Spec reference; a summary for passed/failed/skipped; defects; and a button named “查看角色管理测试报告”. The test drawer renders 92% pass rate, 23 passed, 2 failed, 1 skipped, coverage bars, failure details, and report metadata.

- [ ] **Step 7: Wire actions, style, and verify**

Dispatch `set-development-task-status` from `page.tsx`. Add `.development-workspace`, `.dev-task-list`, `.dev-task-row`, `.change-summary`, `.review-issue`, `.testing-workspace`, `.test-case-table`, and `.report-metrics` styles.

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: development, review, and testing tests PASS.

- [ ] **Step 8: Commit**

```bash
git add app/components/workspaces/development-workspace.tsx app/components/workspaces/code-review-workspace.tsx app/components/workspaces/testing-workspace.tsx app/components/preview-drawer.tsx app/components/workspaces/workspace-router.tsx app/page.tsx app/globals.css app/components/client-demo.test.tsx
git commit -m "feat: add development and testing evidence workspaces"
```

---

### Task 7: Regression, Accessibility, Responsive Layout, and Production Build

**Files:**
- Modify: `app/components/client-demo.test.tsx`
- Create: `app/components/preview-error-state.tsx`
- Create: `app/components/preview-error-state.test.tsx`
- Modify: `app/components/preview-drawer.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes all completed UI and reducer behavior.
- Produces a verified production build with no new runtime dependency.

- [ ] **Step 1: Add regression and accessibility assertions**

Add tests that verify:

```tsx
test("keeps the three product regions and office mode", async () => {
  render(<Page />);
  expect(screen.getByRole("navigation", { name: "主导航" })).toBeInTheDocument();
  expect(screen.getByRole("main")).toBeInTheDocument();
  expect(screen.getByLabelText("辅助工具")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "新建任务" }));
  await userEvent.click(screen.getByRole("button", { name: "日常办公" }));
  expect(screen.getByRole("button", { name: /会议纪要 Agent/ })).toBeInTheDocument();
});

test("closes every contextual drawer with Escape", async () => {
  render(<Page />);
  await openCustomerPortal();
  await userEvent.click(screen.getByRole("button", { name: "管理成员" }));
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("complementary", { name: "成员管理" })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the complete test suite**

Run: `npm test`

Expected: all test files PASS with no failing assertions.

- [ ] **Step 3: Finish responsive behavior**

At widths below 1100px, reduce left navigation width and drawer width. Below 760px, make project requirements and asset rows cards, hide secondary requirement counts, and overlay the right drawer above the center. Keep all primary buttons, selects, and the bottom composer reachable without horizontal page scrolling.

- [ ] **Step 4: Verify explicit failure and permission states**

Create this reusable state and render it from `PreviewDrawer` when an optional `previewError` prop matches the active preview:

```tsx
const labels = {
  pdf: "PDF 生成失败",
  diff: "代码比较失败",
  test: "测试执行失败",
} as const;

export function PreviewErrorState({
  kind,
  onRetry,
}: {
  kind: keyof typeof labels;
  onRetry(): void;
}) {
  return (
    <div className="preview-error" role="alert">
      <strong>{labels[kind]}</strong>
      <p>其他项目内容仍可继续查看和编辑。</p>
      <button onClick={onRetry} type="button">重试</button>
    </div>
  );
}
```

Test `PreviewErrorState` with `kind="pdf"`, assert the alert text, click “重试”, and assert a Vitest mock was called once. In viewer-role examples, render “当前角色仅可查看” and disable edit buttons without hiding readable content.

- [ ] **Step 5: Update metadata and README**

Change metadata descriptions to “面向企业系统开发与日常办公的任务对话式智能工作客户端 Demo”. Document the clickable project, requirement, Agent workspace, and preview flows in `README.md`.

- [ ] **Step 6: Run lint and production build**

Run: `npm run lint`

Expected: exit code 0 with no ESLint errors.

Run: `npm run build`

Expected: exit code 0 and “Build complete”. The existing vinext dynamic-route classification notice is acceptable.

- [ ] **Step 7: Commit verified implementation**

```bash
git add app/components/client-demo.test.tsx app/components/preview-error-state.tsx app/components/preview-error-state.test.tsx app/components/preview-drawer.tsx app/globals.css app/layout.tsx README.md
git commit -m "test: verify Spec workspace demo"
```

---

### Task 8: Save and Deploy the Updated Private Site Version

**Files:**
- Verify: `.openai/hosting.json`
- Package: generated Sites archive outside the repository

**Interfaces:**
- Consumes the exact tested Git commit and existing Sites `project_id`.
- Produces a new saved Sites version and a successful private production deployment URL.

- [ ] **Step 1: Confirm a clean exact source state**

Run: `git status --short`

Expected: no output.

Run: `git rev-parse HEAD`

Expected: one full commit SHA; use this exact value for source push and version save.

- [ ] **Step 2: Push the validated commit**

Reuse the existing Sites project and request a fresh short-lived source credential. Push `HEAD` to the configured source branch using a per-command `Authorization: Bearer` HTTP header; do not persist the credential in Git configuration or a remote URL.

Expected: the configured branch points to the exact SHA from Step 1.

- [ ] **Step 3: Package the site**

Run:

```bash
/Users/landos/.codex/plugins/cache/openai-bundled/sites/0.1.30/scripts/package-site.sh \
  /Users/landos/Documents/Codex/2026-07-17/new-chat/work/client-demo \
  /private/tmp/kflow-spec-workspace-site.tar.gz
```

Expected: `/private/tmp/kflow-spec-workspace-site.tar.gz` is returned.

- [ ] **Step 4: Save and privately deploy the version**

Call the Sites version-save tool with the exact commit SHA and archive, then call private deployment for the saved version. Poll deployment status until `succeeded` or `failed`.

Expected: `succeeded` and a production URL for the existing KFlow site.

- [ ] **Step 5: Open the deployed URL in the in-app browser**

Navigate the deliverable browser tab to the exact successful production URL and keep that tab as the final deliverable.
