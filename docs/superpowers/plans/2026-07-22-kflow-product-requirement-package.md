# KFlow Product Requirement Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three explicit product work modes with one conversation-first requirement package that supports multi-page versioned prototypes, PRD and project-knowledge editing, delivery checks, and project-wide development/testing visibility after product completion.

**Architecture:** Add one page-owned `ProductPackageSession` hook so the middle conversation and right-side product panels share session-local state. Keep the existing three-column shell and `PreviewDrawer`; replace product-only tool entries and panels without changing office, development, testing, project, or profile behavior. Derive product completion and downstream visibility from the package session instead of adding workflow orchestration.

**Tech Stack:** React 19, TypeScript, Vinext/Vite, Lucide React, CSS, Vitest, Testing Library.

## Global Constraints

- Conversation remains the primary operation surface; the right panel is for evidence, direct adjustment, version review, and confirmation.
- A requirement belongs to one project and inherits that project's knowledge, memory, historical requirements, and historical prototypes.
- Prototype and PRD may be created in either order without an explicit path selector.
- Formal Spec and acceptance criteria require confirmed, conflict-free prototype and PRD content.
- A PRD-only requirement may still be marked product-complete; missing artifacts are warnings, not gates.
- Product completion makes the requirement naturally visible to frontend, backend, and testing Agents in the same project; it does not assign or push work.
- Every confirmed prototype change creates an execution version; rollback creates a new current version and preserves history.
- Demo state is session-local and resets after refresh; no backend, persistence, or Agent orchestration is added.

---

## File Structure

- Create `app/lib/product-package.ts`: product package types, initial demo state, pure selectors, and reducer actions.
- Create `app/hooks/use-product-package-session.ts`: React session hook wrapping the pure reducer.
- Create `app/components/product-package-strip.tsx`: compact middle-column artifact and completion summary.
- Create `app/components/product-panels.tsx`: prototype, PRD, delivery-check, version-history, and project-knowledge panels.
- Modify `app/lib/types.ts`: add product panel preview kinds and remove product-mode dependencies from active UI contracts while preserving legacy task data compatibility.
- Modify `app/lib/contextual-tools.ts`: expose five product tools in the approved order.
- Modify `app/components/composer.tsx`: remove the product mode selector and add selected prototype component context.
- Modify `app/components/task-view.tsx`: render the requirement package strip and pass product context to the composer.
- Modify `app/components/preview-drawer.tsx`: route product tools to the new shared panels.
- Modify `app/page.tsx`: own the product package session, auto-open generated prototype/PRD results, and expose completion visibility to development/testing.
- Modify `app/globals.css`: style the package strip, multi-page prototype, component inspector, versions, conflict handling, and completion confirmation.
- Modify `app/lib/contextual-tools.test.ts`, `app/components/client-demo.test.tsx`, and add `app/lib/product-package.test.ts` for focused behavior coverage.

---

### Task 1: Product Package Domain Model and Tool Mapping

**Files:**
- Create: `app/lib/product-package.ts`
- Create: `app/lib/product-package.test.ts`
- Modify: `app/lib/types.ts`
- Modify: `app/lib/contextual-tools.ts`
- Modify: `app/lib/contextual-tools.test.ts`

**Interfaces:**
- Produces: `ProductPackageState`, `ProductArtifactStatus`, `PrototypePage`, `PrototypeVersion`, `ProductConflict`, `ProductPackageAction`.
- Produces: `createInitialProductPackage(requirementId: string): ProductPackageState`.
- Produces: `productPackageReducer(state, action): ProductPackageState`.
- Produces: `getProductReadiness(state): { complete: boolean; missing: string[]; warnings: string[] }`.
- Produces preview kinds: `prototype`, `prd`, `delivery-check`, `version-history`, `context`.

- [ ] **Step 1: Write focused failing domain tests**

```ts
it("allows PRD-only product completion with warnings", () => {
  const state = createInitialProductPackage("role-permissions");
  const next = productPackageReducer(state, { type: "mark-product-complete" });
  expect(next.productStatus).toBe("complete-incomplete");
  expect(getProductReadiness(next).missing).toEqual([
    "原型",
    "Spec",
    "验收标准",
  ]);
});

it("rolls back by creating a new prototype version", () => {
  const state = createInitialProductPackage("role-permissions");
  const next = productPackageReducer(state, {
    type: "rollback-prototype",
    versionId: "proto-v2",
  });
  expect(next.prototypeVersions.at(-1)?.sourceVersionId).toBe("proto-v2");
  expect(next.prototypeVersions.at(-1)?.version).toBe("V5");
});
```

- [ ] **Step 2: Run the focused tests and confirm the missing model fails**

Run: `npm test -- app/lib/product-package.test.ts app/lib/contextual-tools.test.ts`

Expected: FAIL because `product-package.ts`, the new preview kinds, and the new product tool order do not exist.

- [ ] **Step 3: Implement the model and pure transitions**

Use these exact primary shapes:

```ts
export type ProductStatus = "adjusting" | "complete" | "complete-incomplete";
export type ArtifactState = "missing" | "draft" | "confirmed" | "stale";

export interface ProductPackageState {
  requirementId: string;
  productStatus: ProductStatus;
  prototypeStatus: ArtifactState;
  prdStatus: ArtifactState;
  specStatus: ArtifactState;
  acceptanceStatus: ArtifactState;
  pages: PrototypePage[];
  selectedPageId: string;
  selectedComponentId: string | null;
  prototypeVersions: PrototypeVersion[];
  prdVersions: ProductDocumentVersion[];
  conflicts: ProductConflict[];
  knowledgeIds: string[];
  downstreamSnapshots: DownstreamSnapshot[];
}
```

The reducer must support selecting pages/components, updating component properties, adding/copying/renaming/deleting pages, creating prototype versions, non-destructive rollback, confirming PRD, resolving conflicts, generating Spec/acceptance criteria, marking product complete, reopening product work, and creating downstream snapshots.

- [ ] **Step 4: Replace product tool mapping**

```ts
const productTools: ContextualTool[] = [
  tool("prototype", "原型", LayoutTemplate),
  tool("prd", "PRD", FileText),
  tool("delivery-check", "交付检查", ClipboardCheck),
  tool("version-history", "版本记录", History),
  tool("context", "项目知识", Database),
];
```

- [ ] **Step 5: Run focused tests and commit**

Run: `npm test -- app/lib/product-package.test.ts app/lib/contextual-tools.test.ts`

Expected: PASS.

Commit: `git commit -m "feat: add product requirement package model"`

---

### Task 2: Conversation-First Product Package Surface

**Files:**
- Create: `app/hooks/use-product-package-session.ts`
- Create: `app/components/product-package-strip.tsx`
- Modify: `app/components/composer.tsx`
- Modify: `app/components/task-view.tsx`
- Modify: `app/page.tsx`
- Modify: `app/components/client-demo.test.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `ProductPackageState` and `ProductPackageAction` from Task 1.
- Produces: `useProductPackageSession(requirementId)` returning `{ state, dispatch }`.
- Produces: `ProductPackageStripProps` with `state`, `canEdit`, `onOpen(kind)`, and `onMarkComplete()`.
- Adds optional `selectedProductContext?: { pageName: string; componentName: string }` to `ComposerProps`.

- [ ] **Step 1: Add failing UI tests for the unified product surface**

```ts
expect(screen.queryByLabelText("产品设计开始环节")).not.toBeInTheDocument();
expect(screen.getByLabelText("需求包状态")).toHaveTextContent("原型 V4");
expect(screen.getByLabelText("需求包状态")).toHaveTextContent("PRD V3");
expect(screen.getByRole("button", { name: "标记需求完成" })).toBeEnabled();
```

Add a component-context assertion:

```ts
expect(screen.getByText("当前引用：成员列表 / 保存角色按钮")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused UI test and confirm failure**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: FAIL because the product mode selector still exists and the package strip is missing.

- [ ] **Step 3: Implement the page-owned session and package strip**

Initialize one state per requirement in `page.tsx`. Pass the selected requirement package to `TaskView` and `PreviewDrawer`. Render `ProductPackageStrip` only when `selectedAgent.id === "product-design"` and a project requirement is active.

The strip must show four compact artifact indicators and one status action. It must not render a stepper, arrows, mandatory sequence, owner assignment, or workflow timeline.

- [ ] **Step 4: Remove the active product mode selector**

Delete the `product-stage-select` block from `Composer`. Keep `ProductWorkMode` only where legacy demo task data still needs migration compatibility. When a prototype component is selected, render a compact context chip above the composer and include its name in the next user message's visible context.

- [ ] **Step 5: Add completion confirmation behavior**

Clicking “标记需求完成” opens a compact confirmation in the middle surface. For PRD-only readiness, render exactly:

```ts
{
  included: ["PRD V3"],
  missing: ["原型", "Spec", "验收标准"],
  warning: "页面结构、交互细节和可测试条件尚未确认",
}
```

Confirmation dispatches `{ type: "mark-product-complete" }`; it does not select an Agent or assignee.

- [ ] **Step 6: Run the focused UI test and commit**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: PASS for the new product package assertions and existing task navigation assertions.

Commit: `git commit -m "feat: unify product work around requirement package"`

---

### Task 3: Complete Product Right-Side Workbenches

**Files:**
- Create: `app/components/product-panels.tsx`
- Modify: `app/components/preview-drawer.tsx`
- Modify: `app/page.tsx`
- Modify: `app/components/client-demo.test.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `{ state, dispatch }` from `useProductPackageSession`.
- Produces: `ProductPanel({ kind, state, dispatch, canEdit, sources })`.
- Handles preview kinds: `prototype`, `prd`, `delivery-check`, `version-history`, `context`.

- [ ] **Step 1: Add failing interaction tests for prototype and versions**

```ts
await userEvent.click(screen.getByRole("button", { name: "原型" }));
expect(screen.getByRole("navigation", { name: "原型页面" })).toBeInTheDocument();
await userEvent.click(screen.getByRole("button", { name: "成员列表" }));
await userEvent.click(screen.getByRole("button", { name: "保存角色按钮" }));
expect(screen.getByLabelText("组件文案")).toHaveValue("保存角色");

await userEvent.click(screen.getByRole("button", { name: "版本记录" }));
await userEvent.click(screen.getByRole("button", { name: "回退到 V2" }));
expect(screen.getByText("V5 · 从 V2 恢复")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused UI test and confirm failure**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: FAIL because the product-specific panels and interactions do not exist.

- [ ] **Step 3: Implement the multi-page prototype panel**

The panel contains:

- page tree with add, copy, rename, delete, and start-page actions;
- desktop/tablet/mobile preview controls;
- browser-open link using the existing `/prototype` route;
- inspect mode with selectable components;
- component property editor for text, color, state, and interaction target;
- “保存为新版本” action that records command, affected page, component, and timestamp;
- current execution highlight on changed pages/components.

After product Agent execution transitions to `done` for a message containing “原型”, dispatch `create-prototype-version` and call `openPreview("prototype")` once.

- [ ] **Step 4: Implement PRD and project knowledge panels**

PRD supports chapter navigation, direct edit, natural-language revision input, revision diff, confirm/discard, and version rollback. It displays the linked prototype version and the project knowledge sources actually used. The project knowledge panel reuses `ContextSourcesPanel` selection and locking behavior.

- [ ] **Step 5: Implement delivery check and version history**

Delivery check shows:

- four artifact readiness rows;
- conflict rows with “以原型为准”, “以 PRD 为准”, and “同时修订”; 
- Spec and acceptance criteria generation disabled only when prototype/PRD are unconfirmed or conflicts remain;
- product completion confirmation that remains enabled with missing artifacts;
- completion status and “重新进入产品调整” action.

Version history combines product executions but keeps separate prototype and PRD version numbers. Prototype rollback must create a new head version and retain all previous entries.

- [ ] **Step 6: Run focused UI tests and commit**

Run: `npm test -- app/components/client-demo.test.tsx app/lib/product-package.test.ts`

Expected: PASS.

Commit: `git commit -m "feat: add product artifact workbenches"`

---

### Task 4: Development and Testing Visibility, Final Validation, and Documentation

**Files:**
- Modify: `app/components/composer.tsx`
- Modify: `app/page.tsx`
- Modify: `app/components/task-view.tsx`
- Modify: `app/components/client-demo.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: `ProductPackageState.productStatus` and `create-downstream-snapshot` action.
- Produces: same-project requirement choices for `frontend-dev`, `backend-dev`, and `testing`.
- Produces: a downstream context update notice that requires explicit user acceptance.

- [ ] **Step 1: Add failing visibility and snapshot tests**

```ts
expect(screen.queryByRole("option", { name: /角色与成员权限重构/ })).not.toBeInTheDocument();
await markRequirementProductComplete();
await selectAgent("frontend-dev");
expect(screen.getByRole("option", { name: /角色与成员权限重构/ })).toBeInTheDocument();
expect(screen.getByText("缺少原型、Spec、验收标准")).toBeInTheDocument();
```

Add a context update test asserting that a later product version shows “产品上下文已有更新” and remains unchanged until “载入新版本” is clicked.

- [ ] **Step 2: Run the focused UI test and confirm failure**

Run: `npm test -- app/components/client-demo.test.tsx`

Expected: FAIL because Agent-specific requirement visibility and snapshots are not connected.

- [ ] **Step 3: Implement natural same-project visibility**

When `productStatus` is `complete` or `complete-incomplete`, show the requirement in the selected project's development and testing requirement selector. Selecting it creates a snapshot for that Agent with exact artifact versions, knowledge IDs, missing items, conflicts, completion author, and timestamp.

Do not add a product-side receiver selector, assignment action, transfer button, workflow transition, or automatic Agent switch.

- [ ] **Step 4: Implement downstream update notices**

When product versions advance after a downstream snapshot, display the changed artifact versions and one “载入新版本” button. Clicking it replaces only that Agent's snapshot; it does not mutate code, tests, task status, or other Agent snapshots.

- [ ] **Step 5: Update product documentation**

Update `README.md` to describe the requirement package, multi-page prototype, PRD project-knowledge use, product completion visibility, and non-orchestrated downstream context behavior. Link the approved functional specification.

- [ ] **Step 6: Run one final validation and commit**

Run: `npm run build`

Expected: exit code 0 and “Build complete”. Do not add repeated browser QA or extra test passes unless this command reveals a real failure.

Commit: `git commit -m "feat: expose completed product requirements to delivery agents"`

- [ ] **Step 7: Publish the validated commit**

Push `feature/unified-conversation-architecture` to `netbadge-ctrl/KCwork`, then publish the same commit to the existing KFlow Sites project. Confirm the production deployment reaches `succeeded` before reporting completion.

