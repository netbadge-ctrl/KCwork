# Unified Conversation Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing TaskView conversation page the only requirement Agent workspace and remove the RequirementWorkspace presentation from all user flows.

**Architecture:** Keep `requirement-detail` as an internal state discriminator so requirement-scoped messages, permissions, context, and artifacts continue to work. Render that state through `TaskView`, add the Product Design starting-stage control to its composer, and keep previews in the existing contextual right drawer.

**Tech Stack:** React 19, TypeScript, Vinext, Vitest, Testing Library, CSS.

## Global Constraints

- Do not add another workbench, route, workflow dashboard, or orchestration layer.
- Keep the conversation stream and bottom composer as the center-column structure.
- Keep the resizable right drawer and collapsible left sidebar.
- Run one necessary automated verification and one production build after the complete patch; only rerun a failed command after fixing its actual failure.

---

### Task 1: Add requirement-aware controls to the canonical conversation page

**Files:**
- Modify: `app/components/composer.tsx`
- Modify: `app/components/task-view.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `ProductWorkMode`, `Requirement`, existing `Composer` and `TaskView` props.
- Produces: optional `productWorkMode`, `onProductWorkModeChange`, `projectSelectionLocked`, `requirement`, and `onOpenSettings` props used by `Page`.

- [ ] **Step 1: Extend Composer with a compact Product Design starting-stage selector**

Add optional props and render the selector only for the Product Design Agent:

```tsx
productWorkMode?: ProductWorkMode;
onProductWorkModeChange?(mode: ProductWorkMode): void;

{selectedAgentId === "product-design" && productWorkMode && onProductWorkModeChange && (
  <label className="select-control product-stage-select">
    <Sparkles size={15} />
    <select
      aria-label="产品设计开始环节"
      onChange={(event) => onProductWorkModeChange(event.target.value as ProductWorkMode)}
      value={productWorkMode}
    >
      <option value="analysis">需求分析</option>
      <option value="prototype">原型设计与审计</option>
      <option value="prd">PRD 撰写</option>
    </select>
  </label>
)}
```

- [ ] **Step 2: Extend TaskView without changing its central conversation architecture**

Add requirement metadata and secondary governance actions to the existing header, pass the compact stage selector to `Composer`, and keep artifact clicks routed through `onOpenPreview`:

```tsx
requirement?: Requirement | null;
productWorkMode?: ProductWorkMode;
contextCount?: number;
projectSelectionLocked?: boolean;
onProductWorkModeChange?(mode: ProductWorkMode): void;
onOpenSettings?(): void;
```

The header shows `REQ-032 · Spec v1.4` as secondary text, uses the requirement-scoped context count, and exposes `调整状态与门禁` only inside the existing more menu. No work-mode tab bar or editor canvas is rendered.

- [ ] **Step 3: Add only the compact selector/menu styles needed by TaskView**

Keep the selector visually aligned with existing composer controls and do not add workbench layout styles.

### Task 2: Route every requirement session through TaskView

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/components/client-demo.test.tsx`
- Modify: `app/lib/demo-state.test.ts`

**Interfaces:**
- Consumes: requirement-scoped messages, execution state, selected context count, Product Design mode, project and permission data already held by `Page`.
- Produces: a single rendered `TaskView` branch for both recent tasks and requirement sessions.

- [ ] **Step 1: Update the tests to describe the unified architecture**

Replace expectations for `PRD 撰写工作台`, `原型设计工作台`, and `切换工作台 Agent` with these behaviors:

```tsx
expect(screen.getByRole("heading", { name: "角色与成员权限重构" })).toBeInTheDocument();
expect(screen.queryByText("PRD 撰写工作台")).not.toBeInTheDocument();
expect(screen.queryByText("原型设计工作台")).not.toBeInTheDocument();
expect(screen.getByLabelText("选择 Agent")).toHaveValue("product-design");
await userEvent.selectOptions(screen.getByLabelText("产品设计开始环节"), "prototype");
await userEvent.click(screen.getByRole("button", { name: "页面预览" }));
expect(screen.getByRole("complementary", { name: "页面预览" })).toBeInTheDocument();
```

Update reducer assertions so selecting or resuming a requirement still uses `requirement-detail` internally while the UI contract is the canonical conversation page.

- [ ] **Step 2: Replace the RequirementWorkspace render branch**

Remove its import and render `TaskView` with requirement-scoped data:

```tsx
<TaskView
  task={{
    id: `requirement-${selectedRequirement.id}`,
    title: selectedRequirement.title,
    mode: "research",
    projectId: selectedProject.id,
    requirementId: selectedRequirement.id,
    agentId: selectedAgent.id,
    productWorkMode: state.productWorkMode,
    time: `${selectedRequirement.code} · Spec ${selectedRequirement.specVersion}`,
  }}
  messages={state.requirementMessages[selectedRequirement.id] ?? []}
  execution={state.requirementExecutions[selectedRequirement.id] ?? "idle"}
  requirement={selectedRequirement}
  productWorkMode={state.productWorkMode}
  contextCount={activeSelectedContextIds.length}
  projectSelectionLocked
  onProductWorkModeChange={(mode) => dispatch({ type: "set-product-work-mode", mode })}
  onOpenSettings={() => openPreview("project-settings")}
  {...sharedTaskViewProps}
/>
```

Preserve the current reducer state model so requirement messages, per-requirement Agent memory, permissions, draft guards, contextual tools, and right-drawer scoping are not duplicated.

- [ ] **Step 3: Run the single verification pass**

Run:

```bash
npm test && npm run build
```

Expected: the Vitest suite passes and Vinext produces the production bundle. If either command fails, fix only the reported regression and rerun that failed command.

- [ ] **Step 4: Commit the implementation**

```bash
git add app/page.tsx app/components/composer.tsx app/components/task-view.tsx app/components/client-demo.test.tsx app/lib/demo-state.test.ts app/globals.css docs/superpowers/plans/2026-07-19-unified-conversation-architecture.md
git commit -m "feat: unify requirement agent conversations"
```

### Task 3: Publish the accepted demo

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: the verified production build and current Sites project configuration.
- Produces: an updated `netbadge-ctrl/kcwork-sync` branch and refreshed public Sites deployment.

- [ ] **Step 1: Push the current branch to GitHub**

```bash
git push origin HEAD:feature/kflow-spec-workspace
```

- [ ] **Step 2: Publish through the existing Sites project**

Use the current `.openai/hosting.json` configuration and existing Sites project, then return the deployed URL.
