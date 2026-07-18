# KFlow Agent-first Project Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe the existing KFlow project experience around continuing Agent work or selecting a requirement, while preserving project governance as discoverable secondary controls.

**Architecture:** Keep the reducer-driven single-page Demo and existing three-column shell. Add deterministic Agent session and context-source state, replace the project management-heavy overview with focused Agent work and requirement-entry components, and reuse the right drawer for context inspection and project settings. Existing Agent-specific workspaces remain intact and receive a lighter shared header plus automatic-context controls.

**Tech Stack:** React 19, TypeScript 5.9, vinext/Next-compatible app router, lucide-react, Vitest 4, Testing Library, CSS in `app/globals.css`.

## Global Constraints

- Keep the left navigation items: 新建任务、项目、智能资产、最新任务.
- Keep “日常办公” and “系统开发” as the two home modes.
- Keep the center composer fixed at the bottom of task and requirement workspaces.
- Keep the right auxiliary rail collapsed by default.
- Project members can view all project requirements, progress, code, and tests; project roles control editing.
- Restore the last Agent used for a requirement and allow unrestricted Agent switching.
- Agents select relevant context automatically; users may add, remove, or lock sources.
- Do not add Agent orchestration or enforce an Agent sequence.
- Preserve prototype, PRD, PDF, development task, Diff, code-review, test-case, and report workspaces.
- Preserve requirement stages and review gates, but move their editing controls into secondary surfaces.
- Do not add backend persistence, real Git writes, real PDF conversion, CI execution, or external integrations.

---

### Task 1: Agent Session and Automatic Context State

**Files:**
- Modify: `app/lib/types.ts`
- Modify: `app/lib/demo-data.ts`
- Modify: `app/lib/demo-state.ts`
- Test: `app/lib/demo-state.test.ts`

**Interfaces:**
- Produces: `AgentWorkSession`, `ContextSource`, `ContextSourceKind`.
- Extends: `PreviewKind` with `sources` and `project-settings`.
- Produces data: `agentWorkSessions: AgentWorkSession[]`, `contextSources: ContextSource[]`.
- Produces state: `lastAgentByRequirement`, `selectedContextIds`, `lockedContextIds`.
- Produces actions: `resume-agent-work`, `toggle-context-source`, and `toggle-context-lock`.

- [ ] **Step 1: Write failing reducer tests**

Append to `app/lib/demo-state.test.ts`:

```ts
it("restores the last Agent for a requirement", () => {
  const next = clientReducer(initialClientState, {
    type: "resume-agent-work",
    sessionId: "session-role-prd",
  });

  expect(next.view).toBe("requirement-detail");
  expect(next.selectedRequirementId).toBe("role-permissions");
  expect(next.selectedAgentId).toBe("prd-writer");
});

it("lets a user adjust and lock automatically selected context", () => {
  const removed = clientReducer(initialClientState, {
    type: "toggle-context-source",
    sourceId: "context-role-interview",
  });
  const locked = clientReducer(removed, {
    type: "toggle-context-lock",
    sourceId: "context-role-spec",
  });

  expect(removed.selectedContextIds).not.toContain("context-role-interview");
  expect(locked.lockedContextIds).toContain("context-role-spec");
});

it("opens a requirement with its remembered Agent", () => {
  const next = clientReducer(initialClientState, {
    type: "select-requirement",
    requirementId: "role-permissions",
  });

  expect(next.selectedAgentId).toBe("prd-writer");
});
```

- [ ] **Step 2: Run state tests and verify RED**

Run: `npm test -- app/lib/demo-state.test.ts`

Expected: FAIL because the new actions and context fields are not defined.

- [ ] **Step 3: Add domain types**

Add to `app/lib/types.ts`:

```ts
export type ContextSourceKind =
  | "requirement"
  | "document"
  | "prototype"
  | "memory"
  | "repository"
  | "test";

export interface AgentWorkSession {
  id: string;
  projectId: string;
  requirementId: string;
  agentId: string;
  title: string;
  summary: string;
  pendingAction: string;
  updatedAt: string;
}

export interface ContextSource {
  id: string;
  projectId: string;
  requirementId?: string;
  kind: ContextSourceKind;
  name: string;
  detail: string;
  status: "available" | "syncing" | "unavailable";
  autoSelected: boolean;
}
```

Add `"sources" | "project-settings"` to the existing `PreviewKind` union in the same file.

- [ ] **Step 4: Add deterministic session and context records**

Add to `app/lib/demo-data.ts`:

```ts
export const agentWorkSessions: AgentWorkSession[] = [
  {
    id: "session-role-prd",
    projectId: "customer-portal",
    requirementId: "role-permissions",
    agentId: "prd-writer",
    title: "角色与成员权限重构",
    summary: "已生成 PRD v1.4，并补充 4 条可测试验收标准",
    pendingAction: "等待确认 PRD 修订",
    updatedAt: "8 分钟前",
  },
  {
    id: "session-sso-test",
    projectId: "customer-portal",
    requirementId: "sso-login",
    agentId: "testing",
    title: "企业 SSO 登录体验优化",
    summary: "核心回归完成，发现 2 项失败用例",
    pendingAction: "等待确认测试结论",
    updatedAt: "昨天",
  },
];

export const contextSources: ContextSource[] = [
  { id: "context-role-spec", projectId: "customer-portal", requirementId: "role-permissions", kind: "requirement", name: "REQ-032 Spec v1.4", detail: "需求、规则与 12 条验收标准", status: "available", autoSelected: true },
  { id: "context-role-interview", projectId: "customer-portal", requirementId: "role-permissions", kind: "document", name: "角色权限访谈纪要", detail: "2026-07-12 · 产品确认", status: "available", autoSelected: true },
  { id: "context-role-prototype", projectId: "customer-portal", requirementId: "role-permissions", kind: "prototype", name: "角色配置原型 V3", detail: "12 个交互热点", status: "available", autoSelected: true },
  { id: "context-project-memory", projectId: "customer-portal", kind: "memory", name: "项目决策记忆", detail: "权限范围与兼容性决策", status: "available", autoSelected: true },
  { id: "context-portal-repo", projectId: "customer-portal", kind: "repository", name: "customer-portal", detail: "main · 8 分钟前同步", status: "available", autoSelected: true },
  { id: "context-role-tests", projectId: "customer-portal", requirementId: "role-permissions", kind: "test", name: "角色管理测试资产", detail: "26 个用例 · 1 份报告", status: "available", autoSelected: true },
];
```

Import `AgentWorkSession` and `ContextSource` at the top of the file.

- [ ] **Step 5: Implement reducer state and actions**

In `app/lib/demo-state.ts`, initialize:

```ts
lastAgentByRequirement: Object.fromEntries(
  agentWorkSessions.map((session) => [session.requirementId, session.agentId]),
),
selectedContextIds: contextSources
  .filter((source) => source.autoSelected)
  .map((source) => source.id),
lockedContextIds: ["context-role-spec"],
```

Add action members:

```ts
| { type: "resume-agent-work"; sessionId: string }
| { type: "toggle-context-source"; sourceId: string }
| { type: "toggle-context-lock"; sourceId: string }
```

Add reducer cases:

```ts
case "resume-agent-work": {
  const session = agentWorkSessions.find((item) => item.id === action.sessionId);
  if (!session) return state;
  return {
    ...state,
    view: "requirement-detail",
    selectedProjectId: session.projectId,
    selectedRequirementId: session.requirementId,
    selectedAgentId: session.agentId,
  };
}
case "toggle-context-source":
  return {
    ...state,
    selectedContextIds: state.selectedContextIds.includes(action.sourceId)
      ? state.selectedContextIds.filter((id) => id !== action.sourceId)
      : [...state.selectedContextIds, action.sourceId],
  };
case "toggle-context-lock":
  return {
    ...state,
    lockedContextIds: state.lockedContextIds.includes(action.sourceId)
      ? state.lockedContextIds.filter((id) => id !== action.sourceId)
      : [...state.lockedContextIds, action.sourceId],
  };
```

Change the `select-requirement` case to set:

```ts
selectedAgentId:
  state.lastAgentByRequirement[action.requirementId] ?? "requirement-analysis",
```

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- app/lib/demo-state.test.ts`

Expected: all reducer tests PASS.

```bash
git add app/lib/types.ts app/lib/demo-data.ts app/lib/demo-state.ts app/lib/demo-state.test.ts
git commit -m "feat: model Agent sessions and automatic context"
```

---

### Task 2: Double-entry Agent Project Workspace

**Files:**
- Create: `app/components/recent-agent-work.tsx`
- Create: `app/components/agent-requirement-list.tsx`
- Create: `app/components/context-connection-bar.tsx`
- Modify: `app/components/project-detail-view.tsx`
- Modify: `app/components/projects-view.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `app/components/client-demo.test.tsx`

**Interfaces:**
- Consumes: `AgentWorkSession[]`, `Requirement[]`, `Agent[]`, `ContextSource[]`.
- Produces callbacks: `onResumeSession(sessionId)`, `onOpenRequirement(requirementId)`, `onOpenContext()`, and `onOpenSettings()`.

- [ ] **Step 1: Write failing project-workspace test**

Add to `app/components/client-demo.test.tsx`:

```tsx
test("centers a project on Agent work and requirement entry", async () => {
  render(<Page />);
  await openCustomerPortal();

  expect(screen.getByRole("heading", { name: "继续 Agent 工作" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "继续 PRD 撰写 Agent 对话" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "从需求开始" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "查看自动上下文来源" })).toBeInTheDocument();
  expect(screen.queryByRole("combobox", { name: "切换 角色与成员权限重构 状态" })).not.toBeInTheDocument();
});

test("continues the latest Agent conversation from the project", async () => {
  render(<Page />);
  await openCustomerPortal();
  await userEvent.click(screen.getByRole("button", { name: "继续 PRD 撰写 Agent 对话" }));

  expect(screen.getByRole("heading", { name: "PRD 撰写工作台" })).toBeInTheDocument();
  expect(screen.getByText("角色与成员权限重构")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run component test and verify RED**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: FAIL because the Agent-first project sections do not exist.

- [ ] **Step 3: Implement focused components**

Create `recent-agent-work.tsx` with this public interface:

```tsx
export interface RecentAgentWorkProps {
  sessions: AgentWorkSession[];
  agents: Agent[];
  onResume(sessionId: string): void;
}
```

Render a section headed `继续 Agent 工作`. Each card must expose the button label `继续 ${agent.name} 对话`, the session title, summary, pending action, and updated time.

Create `agent-requirement-list.tsx` with:

```tsx
export interface AgentRequirementListProps {
  requirements: Requirement[];
  agents: Agent[];
  lastAgentByRequirement: Record<string, string>;
  stages: Record<string, RequirementStage>;
  onOpen(requirementId: string): void;
}
```

Render `从需求开始` and a `恢复${requirement.title}工作区` button per requirement. Show only a compact stage label and the last Agent name; do not render owners, count columns, gate controls, or stage selects.

Create `context-connection-bar.tsx` with:

```tsx
export interface ContextConnectionBarProps {
  sources: ContextSource[];
  selectedIds: string[];
  onOpen(): void;
}
```

Render one button with accessible name `查看自动上下文来源`, grouped kind counts, and `${selectedIds.length} 项已自动选择`.

- [ ] **Step 4: Replace the project-detail hierarchy**

Update `ProjectDetailViewProps` to receive sessions, agents, context sources, selected context IDs, and the new callbacks. Replace the four context cards plus `RequirementList` with:

```tsx
<RecentAgentWork agents={agents} onResume={onResumeSession} sessions={sessions} />
<AgentRequirementList
  agents={agents}
  lastAgentByRequirement={lastAgentByRequirement}
  onOpen={onOpenRequirement}
  requirements={requirements}
  stages={requirementStages}
/>
<ContextConnectionBar
  onOpen={onOpenContext}
  selectedIds={selectedContextIds}
  sources={contextSources}
/>
```

Keep one `项目设置` button in the header and remove visible member, new-requirement, asset-count, direct status, and gate-management controls from the primary layout.

- [ ] **Step 5: Wire page state and style the hierarchy**

In `app/page.tsx`, pass project-filtered sessions and context sources. Dispatch `resume-agent-work` from `onResumeSession`. Open preview kind `sources` from `onOpenContext` and `project-settings` from `onOpenSettings`.

Add CSS for `.recent-agent-work`, `.agent-session-grid`, `.agent-session-card`, `.agent-requirement-list`, `.agent-requirement-card`, and `.context-connection-bar`. Recent Agent work must use the strongest visual treatment, requirements the second strongest, and governance text neutral gray.

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: project Agent-first tests PASS; existing project navigation tests remain PASS after updating obsolete assertions to the new labels.

```bash
git add app/components/recent-agent-work.tsx app/components/agent-requirement-list.tsx app/components/context-connection-bar.tsx app/components/project-detail-view.tsx app/components/projects-view.tsx app/components/client-demo.test.tsx app/page.tsx app/globals.css
git commit -m "feat: make projects an Agent-first work launcher"
```

---

### Task 3: Automatic Context Drawer

**Files:**
- Create: `app/components/context-sources-panel.tsx`
- Modify: `app/lib/types.ts`
- Modify: `app/components/preview-drawer.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `app/components/client-demo.test.tsx`

**Interfaces:**
- Consumes the `sources` and `project-settings` preview kinds introduced in Task 1.
- Produces `ContextSourcesPanel` with selection and lock callbacks.

- [ ] **Step 1: Write the failing context interaction test**

Add:

```tsx
test("shows and adjusts Agent-selected context", async () => {
  render(<Page />);
  await openCustomerPortal();
  await userEvent.click(screen.getByRole("button", { name: "查看自动上下文来源" }));

  expect(screen.getByRole("complementary", { name: "自动上下文" })).toBeInTheDocument();
  expect(screen.getByText("本次自动引用 6 项上下文")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("checkbox", { name: "引用角色权限访谈纪要" }));
  expect(screen.getByText("本次自动引用 5 项上下文")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "锁定项目决策记忆" }));
  expect(screen.getByRole("button", { name: "解除锁定项目决策记忆" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: FAIL because the automatic-context drawer is not implemented.

- [ ] **Step 3: Implement `ContextSourcesPanel`**

Use this interface:

```tsx
export interface ContextSourcesPanelProps {
  sources: ContextSource[];
  selectedIds: string[];
  lockedIds: string[];
  onToggle(sourceId: string): void;
  onToggleLock(sourceId: string): void;
}
```

Render the heading `本次自动引用 ${selectedIds.length} 项上下文`. Group records by kind. Each source has a checkbox labeled `引用${source.name}`, status, detail, and a lock button whose accessible name changes between `锁定${source.name}` and `解除锁定${source.name}`.

Unavailable sources remain readable, show `当前不可用`, and disable their checkbox without hiding the record.

- [ ] **Step 4: Wire drawer and state**

Add `sources: "自动上下文"` and `project-settings: "项目设置"` to `contextualLabels`. Extend `PreviewDrawerProps` with context records and callbacks. Render `ContextSourcesPanel` for `preview === "sources"`.

Change project and requirement context buttons to open `sources`, leaving the existing `context` execution-log preview available in the auxiliary rail.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: all context-drawer assertions PASS.

```bash
git add app/components/context-sources-panel.tsx app/components/preview-drawer.tsx app/components/client-demo.test.tsx app/lib/types.ts app/page.tsx app/globals.css
git commit -m "feat: expose adjustable automatic Agent context"
```

---

### Task 4: Lighter Requirement Agent Workspace

**Files:**
- Modify: `app/components/requirement-workspace.tsx`
- Modify: `app/components/composer.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `app/components/client-demo.test.tsx`

**Interfaces:**
- Consumes: selected context IDs and `onOpenContext`.
- Preserves: `WorkspaceRouter`, Agent-specific workspace props, bottom composer behavior.

- [ ] **Step 1: Write failing Agent-first requirement test**

Add:

```tsx
test("keeps Agent and automatic context primary inside a requirement", async () => {
  render(<Page />);
  await openRoleRequirement();

  expect(screen.getByLabelText("切换工作台 Agent")).toHaveValue("prd-writer");
  expect(screen.getByRole("button", { name: "查看本次 6 项自动上下文" })).toBeInTheDocument();
  expect(screen.getByLabelText("任务输入")).toBeInTheDocument();
  expect(screen.queryByLabelText("切换需求状态")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "更多需求操作" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: FAIL because status editing is still primary and context count is absent.

- [ ] **Step 3: Simplify the shared requirement header**

Remove the visible stage select, gate badge, and owner row from the primary header. Keep project breadcrumb, requirement code, title, Spec version, prominent Agent select, and one `更多需求操作` button.

The menu opened by `更多需求操作` contains:

```tsx
<button type="button" onClick={onOpenSettings}>调整状态与门禁</button>
<button type="button">编辑负责人</button>
<button type="button">归档需求</button>
```

The current stage remains a small noninteractive label beside the Spec version.

- [ ] **Step 4: Add context control above the composer**

Extend `RequirementWorkspaceProps` with:

```ts
selectedContextCount: number;
onOpenContext(): void;
onOpenSettings(): void;
```

Render immediately above `Composer`:

```tsx
<button
  aria-label={`查看本次 ${selectedContextCount} 项自动上下文`}
  className="composer-context-button"
  onClick={onOpenContext}
  type="button"
>
  自动上下文 {selectedContextCount} 项 · 可调整
</button>
```

Keep the existing unsaved-PRD confirmation logic and all `WorkspaceRouter` behavior unchanged.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: Agent-first requirement assertions and all Agent workspace tests PASS.

```bash
git add app/components/requirement-workspace.tsx app/components/composer.tsx app/components/client-demo.test.tsx app/page.tsx app/globals.css
git commit -m "feat: focus requirement workspaces on Agent execution"
```

---

### Task 5: Secondary Project Settings and Governance

**Files:**
- Create: `app/components/project-settings-panel.tsx`
- Modify: `app/components/preview-drawer.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `app/components/client-demo.test.tsx`

**Interfaces:**
- Reuses: `MemberManager`, `RequirementStage`, member-role reducer action, requirement-stage reducer action.
- Produces: one secondary panel for members, roles, status, gate rules, and asset maintenance links.

- [ ] **Step 1: Write failing governance discoverability test**

Add:

```tsx
test("keeps governance editable in secondary project settings", async () => {
  render(<Page />);
  await openCustomerPortal();
  expect(screen.queryByRole("button", { name: "管理成员" })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "项目设置" }));

  expect(screen.getByRole("complementary", { name: "项目设置" })).toBeInTheDocument();
  expect(screen.getByText("当前角色：项目管理员")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "成员与角色" }));
  await userEvent.selectOptions(screen.getByLabelText("修改林川的项目角色"), "testing");
  expect(screen.getByLabelText("修改林川的项目角色")).toHaveValue("testing");
  await userEvent.click(screen.getByRole("button", { name: "需求状态与门禁" }));
  await userEvent.selectOptions(screen.getByLabelText("设置角色与成员权限重构状态"), "testing");
  expect(screen.getByLabelText("设置角色与成员权限重构状态")).toHaveValue("testing");
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: FAIL because project settings do not contain governance controls.

- [ ] **Step 3: Implement `ProjectSettingsPanel`**

Use:

```tsx
export interface ProjectSettingsPanelProps {
  members: ProjectMember[];
  memberRoles: Record<string, ProjectRole>;
  requirements: Requirement[];
  requirementStages: Record<string, RequirementStage>;
  onChangeMemberRole(memberId: string, role: ProjectRole): void;
  onSetRequirementStage(requirementId: string, stage: RequirementStage): void;
  onOpenAsset(section: ProjectSection): void;
}
```

Render `当前角色：项目管理员`, a collapsed-by-default `成员与角色` section containing `MemberManager`, a `需求状态与门禁` section with labeled status selects and read-only gate summaries, and a `上下文维护` section with four asset-management links.

Project settings are secondary: accordions are collapsed until clicked, and the drawer has no additional full-page navigation unless the user selects `管理全部`.

- [ ] **Step 4: Wire project settings into the drawer**

Pass requirements, current stage records, callbacks, and asset navigation into `PreviewDrawer`. Render the panel for `preview === "project-settings"`. Opening an asset link must close settings and dispatch `select-project-section` using the existing asset page.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: settings test and existing member/asset edit tests PASS after updating their navigation path through `项目设置`.

```bash
git add app/components/project-settings-panel.tsx app/components/preview-drawer.tsx app/components/client-demo.test.tsx app/page.tsx app/globals.css
git commit -m "feat: move project governance into secondary settings"
```

---

### Task 6: Regression, Documentation, Build, and Updated Deployment

**Files:**
- Modify: `app/components/client-demo.test.tsx`
- Modify: `README.md`
- Verify: `.openai/hosting.json`

**Interfaces:**
- Consumes all completed Agent-first behavior.
- Produces a tested exact Git commit and a new Sites version for the existing project ID.

- [ ] **Step 1: Add final regression assertions**

Ensure `app/components/client-demo.test.tsx` includes these checks:

```tsx
test("preserves office mode and all Agent-specific evidence workspaces", async () => {
  render(<Page />);
  await userEvent.click(screen.getByRole("button", { name: "新建任务" }));
  await userEvent.click(screen.getByRole("button", { name: "日常办公" }));
  expect(screen.getByRole("button", { name: /会议纪要 Agent/ })).toBeInTheDocument();

  await openRoleRequirement();
  await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "frontend-dev");
  expect(screen.getByRole("heading", { name: "开发工作台" })).toBeInTheDocument();
  await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "testing");
  expect(screen.getByRole("heading", { name: "测试工作台" })).toBeInTheDocument();
});

test("closes automatic context and project settings with Escape", async () => {
  render(<Page />);
  await openCustomerPortal();
  await userEvent.click(screen.getByRole("button", { name: "查看自动上下文来源" }));
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("complementary", { name: "自动上下文" })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "项目设置" }));
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("complementary", { name: "项目设置" })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Update README flows**

Replace the project-flow section with:

```md
- 项目工作台：优先继续最近 Agent 对话，或从需求恢复最后使用的 Agent。
- 自动上下文：Agent 按需求和指令自动选择 Spec、文档、原型、记忆、代码和测试来源，用户可增删或锁定。
- 项目治理：成员、角色、状态、门禁和资产维护保留在项目设置与右侧抽屉中。
```

- [ ] **Step 3: Run fresh verification**

Run: `npm test`

Expected: all test files PASS with zero failing assertions.

Run: `npm run lint`

Expected: exit code 0 with no warnings.

Run: `npm run build`

Expected: exit code 0 and `Build complete`. The existing vinext dynamic-route classification notice and Node `module.register()` deprecation warning are acceptable.

Run: `git diff --check`

Expected: no output.

- [ ] **Step 4: Commit the verified Agent-first Demo**

```bash
git add app/components/client-demo.test.tsx README.md
git commit -m "test: verify Agent-first KFlow workspace"
git status --short
git rev-parse HEAD
```

Expected: clean status and one full commit SHA.

- [ ] **Step 5: Save and deploy the existing Sites project**

Read `.openai/hosting.json` and reuse its existing `project_id`. Push the exact tested commit to the configured Sites source branch with a fresh short-lived credential. Package the same source using:

```bash
/Users/landos/.codex/plugins/cache/openai-bundled/sites/0.1.30/scripts/package-site.sh \
  /Users/landos/Documents/Codex/2026-07-17/new-chat/work/client-demo/.worktrees/kflow-spec-workspace \
  /private/tmp/kflow-agent-first-site.tar.gz
```

Save one Sites version using the exact commit SHA and archive. Because the existing site is public, request explicit user approval immediately before calling the public deployment tool unless the current turn already contains that approval. Poll deployment status until `succeeded` or `failed`.

- [ ] **Step 6: Open the successful production URL**

On `succeeded`, refresh the existing in-app browser tab at:

`https://kflow-enterprise-demo-0717-a6c5e.netbadge7777.chatgpt.site/`

Navigate it to `项目 → 企业客户门户 V3.2` so the Agent-first project workbench is the visible deliverable.
