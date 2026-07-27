# KFlow Flexible Layout, Product Design Agent, and Prototype Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a collapsible/resizable three-column shell, merge the three product Agents into one freely switchable Product Design Agent, and add browser-based element-level prototype editing.

**Architecture:** Keep `Page` as the application state coordinator, move reusable layout persistence and prototype editing into focused modules, and preserve the existing workspace components behind a single Product Design workspace router. The standalone prototype route reuses the same editor component as the right drawer, while contextual tools derive from both Agent and product work mode.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS, Vitest, Testing Library, lucide-react.

## Global Constraints

- The client remains Agent-first; do not add a fixed product-to-development-to-test workflow.
- Product work modes are `analysis | prototype | prd` and may be entered or switched in any order.
- Product modes share the same requirement conversation, selected context, and artifacts.
- The expanded right panel defaults to `560px`, has a minimum of `420px`, and never exceeds `70vw`.
- The expanded left navigation remains `248px`; its collapsed width is `64px`.
- Prototype changes are Demo-only front-end state; do not implement design-file persistence or code generation.
- Preserve project-role editing restrictions and keep the task composer at the bottom of the middle column.
- Do not add dependencies.

---

## File Structure

- `app/lib/types.ts`: add product work-mode and prototype element types.
- `app/lib/demo-data.ts`: expose one Product Design Agent and migrate product task/session references.
- `app/lib/demo-state.ts`: store and transition the active product work mode.
- `app/lib/layout-preferences.ts`: own shell constants, width clamping, and storage parsing.
- `app/lib/layout-preferences.test.ts`: verify width and persistence parsing behavior.
- `app/lib/contextual-tools.ts`: resolve Product Design tools from the active product mode.
- `app/lib/contextual-tools.test.ts`: verify product-mode and non-product tool mappings.
- `app/components/sidebar.tsx`: render expanded and collapsed navigation states.
- `app/components/preview-drawer.tsx`: add the resize handle and embed the prototype editor.
- `app/components/product-mode-picker.tsx`: render the three start/switch choices.
- `app/components/workspaces/product-design-workspace.tsx`: route one Product Design Agent to the existing analysis, prototype, and PRD canvases.
- `app/components/workspaces/workspace-router.tsx`: route `product-design` to the unified workspace.
- `app/components/requirement-workspace.tsx`: show the product-mode switcher without creating a new conversation.
- `app/components/prototype-editor.tsx`: reusable selectable, editable, confirmable, undoable prototype surface.
- `app/prototype/page.tsx`: standalone browser preview route.
- `app/page.tsx`: coordinate layout state, product mode, right-panel width, and browser preview URL.
- `app/globals.css`: style collapsed navigation, resize affordance, mode picker, and prototype editor.
- `app/components/client-demo.test.tsx`: cover end-to-end shell, Agent, mode, and preview interactions.
- `app/components/prototype-editor.test.tsx`: cover element selection, draft confirmation, permission, and undo.

---

### Task 1: Unify Product Agent Data and State

**Files:**
- Modify: `app/lib/types.ts`
- Modify: `app/lib/demo-data.ts`
- Modify: `app/lib/demo-state.ts`
- Test: `app/lib/demo-state.test.ts`

**Interfaces:**
- Produces: `ProductWorkMode = "analysis" | "prototype" | "prd"`.
- Produces: `ClientState.productWorkMode` and `{ type: "set-product-work-mode"; mode: ProductWorkMode }`.
- Produces: the sole product Agent ID `product-design`.
- Consumes: existing `Agent`, `RecentTask`, `AgentWorkSession`, and reducer navigation behavior.

- [ ] **Step 1: Write failing reducer and data tests**

Add assertions proving that the research Agent list contains one product Agent, old product IDs are absent, product tasks resume with the correct mode, and changing product mode does not replace messages:

```ts
import { agents } from "./demo-data";

it("exposes one product design Agent", () => {
  expect(agents.filter((agent) => agent.category === "产品").map((agent) => agent.id))
    .toEqual(["product-design"]);
});

it("switches product work mode without changing the conversation", () => {
  const next = clientReducer(initialClientState, {
    type: "set-product-work-mode",
    mode: "prototype",
  });
  expect(next.productWorkMode).toBe("prototype");
  expect(next.requirementMessages).toBe(initialClientState.requirementMessages);
});

it("opens the existing PRD task in product PRD mode", () => {
  const next = clientReducer(initialClientState, { type: "open-task", taskId: "prd-role" });
  expect(next.selectedAgentId).toBe("product-design");
  expect(next.productWorkMode).toBe("prd");
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npm test -- app/lib/demo-state.test.ts`

Expected: FAIL because `productWorkMode`, `set-product-work-mode`, and `product-design` do not exist.

- [ ] **Step 3: Add the mode type and migrate product references**

Add the shared type and optional entry-mode metadata:

```ts
export type ProductWorkMode = "analysis" | "prototype" | "prd";
productWorkMode?: ProductWorkMode;
```

Insert the optional `productWorkMode` property into both `AgentWorkSession` and `RecentTask`.

Replace the three product Agent records with:

```ts
{
  id: "product-design",
  name: "产品设计 Agent",
  shortName: "产",
  mode: "research",
  category: "产品",
  description: "从需求分析、原型设计与审计或 PRD 撰写任一环节开始",
}
```

Map `session-role-prd` and `prd-role` to `agentId: "product-design"` and `productWorkMode: "prd"`; map product-authored messages to `agentId: "product-design"`.

- [ ] **Step 4: Add reducer state and transitions**

Add:

```ts
productWorkMode: ProductWorkMode;
```

to `ClientState`, initialize it to `"prd"`, and add:

```ts
| { type: "set-product-work-mode"; mode: ProductWorkMode }
```

Handle the action without touching messages or context:

```ts
case "set-product-work-mode":
  return { ...state, productWorkMode: action.mode };
```

When opening tasks or sessions, use `task.productWorkMode ?? state.productWorkMode` and `session.productWorkMode ?? state.productWorkMode`. Change research defaults and old fallback IDs to `product-design`. For a product response artifact, derive `analysis → prd`, `prototype → prototype`, and `prd → prd` without introducing stage transitions.

- [ ] **Step 5: Run focused tests and commit**

Run: `npm test -- app/lib/demo-state.test.ts`

Expected: PASS.

```bash
git add app/lib/types.ts app/lib/demo-data.ts app/lib/demo-state.ts app/lib/demo-state.test.ts
git commit -m "feat: unify product design agent state"
```

---

### Task 2: Add Product Work Modes and Contextual Tools

**Files:**
- Create: `app/components/product-mode-picker.tsx`
- Create: `app/components/workspaces/product-design-workspace.tsx`
- Modify: `app/components/workspaces/workspace-router.tsx`
- Modify: `app/components/requirement-workspace.tsx`
- Modify: `app/components/home-view.tsx`
- Modify: `app/lib/contextual-tools.ts`
- Test: `app/lib/contextual-tools.test.ts`
- Test: `app/components/client-demo.test.tsx`

**Interfaces:**
- Consumes: `ProductWorkMode`, `product-design`, and the three existing product workspace components.
- Produces: `ProductModePicker({ value, onChange, variant })`.
- Produces: `ContextualToolContext.productWorkMode?: ProductWorkMode`.
- Produces: `WorkspaceRouterProps.productWorkMode` and `onProductWorkModeChange`.

- [ ] **Step 1: Write failing tool-resolution tests**

Update the test helper to accept `productWorkMode` and assert:

```ts
expect(kinds("product-design", "research", true, false, "analysis"))
  .toEqual(["context", "analysis", "questions", "log"]);
expect(kinds("product-design", "research", true, false, "prototype"))
  .toEqual(["prototype", "components", "interaction", "context"]);
expect(kinds("product-design", "research", true, false, "prd"))
  .toEqual(["prd", "pdf", "analysis", "context"]);
```

- [ ] **Step 2: Run the tool test and verify failure**

Run: `npm test -- app/lib/contextual-tools.test.ts`

Expected: FAIL because `product-design` is not mode-aware.

- [ ] **Step 3: Implement mode-aware contextual tools**

Extend the context interface:

```ts
productWorkMode?: ProductWorkMode;
```

Define `productTools: Record<ProductWorkMode, ContextualTool[]>` using the exact arrays asserted above. In `resolveContextualTools`, choose `productTools[context.productWorkMode ?? "analysis"]` when `agentId === "product-design"`; retain all existing office, development, review, and testing mappings.

- [ ] **Step 4: Write the failing Product Design UI test**

Add an integration test that enters the role requirement, sees one Product Design Agent, switches from PRD to prototype mode, and retains the same composer:

```ts
test("uses one product Agent with freely switchable work modes", async () => {
  render(<Page />);
  await openRoleRequirement();
  expect(screen.getByLabelText("切换工作台 Agent")).toHaveValue("product-design");
  expect(screen.getByRole("heading", { name: "PRD 撰写工作台" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
  expect(screen.getByRole("heading", { name: "原型设计工作台" })).toBeInTheDocument();
  expect(screen.getByLabelText("任务输入")).toBeInTheDocument();
});
```

- [ ] **Step 5: Implement the picker and unified workspace**

Create a picker with these exact options:

```ts
const productModes = [
  { id: "analysis", label: "需求分析", detail: "澄清范围、依赖与验收边界" },
  { id: "prototype", label: "原型设计与审计", detail: "生成、修改并检查页面交互" },
  { id: "prd", label: "PRD 撰写", detail: "组织产品文档与可测试标准" },
] satisfies Array<{ id: ProductWorkMode; label: string; detail: string }>;
```

`ProductDesignWorkspace` renders `ProductModePicker` and then one of `RequirementAnalysisWorkspace`, `PrototypeWorkspace`, or `PrdWorkspace` according to `productWorkMode`. `WorkspaceRouter` routes only `product-design` through it and removes the three old product Agent branches.

In `RequirementWorkspace`, render the compact picker when the selected Agent is `product-design`. In `HomeView`, selecting the Product Design Agent reveals the start picker near its card; selecting a mode updates state but does not send a task automatically.

- [ ] **Step 6: Wire Page and run focused tests**

Pass `state.productWorkMode` and `dispatch({ type: "set-product-work-mode", mode })` into `HomeView`, `RequirementWorkspace`, `WorkspaceRouter`, and `resolveContextualTools`.

Run: `npm test -- app/lib/contextual-tools.test.ts app/components/client-demo.test.tsx`

Expected: PASS with one product Agent and three freely switchable modes.

- [ ] **Step 7: Commit**

```bash
git add app/components/product-mode-picker.tsx app/components/workspaces/product-design-workspace.tsx app/components/workspaces/workspace-router.tsx app/components/requirement-workspace.tsx app/components/home-view.tsx app/lib/contextual-tools.ts app/lib/contextual-tools.test.ts app/components/client-demo.test.tsx app/page.tsx
git commit -m "feat: add product design work modes"
```

---

### Task 3: Build the Collapsible and Resizable Shell

**Files:**
- Create: `app/lib/layout-preferences.ts`
- Test: `app/lib/layout-preferences.test.ts`
- Modify: `app/components/sidebar.tsx`
- Modify: `app/components/preview-drawer.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `app/components/client-demo.test.tsx`

**Interfaces:**
- Produces: `DEFAULT_RIGHT_PANEL_WIDTH`, `MIN_RIGHT_PANEL_WIDTH`, `clampRightPanelWidth(width, viewportWidth)`.
- Produces: `SidebarProps.collapsed` and `onToggleCollapsed`.
- Produces: `PreviewDrawerProps.width` and `onWidthChange`.
- Consumes: the existing `preview` open/closed state and CSS grid shell.

- [ ] **Step 1: Write failing layout utility tests**

```ts
import {
  clampRightPanelWidth,
  DEFAULT_RIGHT_PANEL_WIDTH,
  MIN_RIGHT_PANEL_WIDTH,
} from "./layout-preferences";

test("clamps the drawer between 420px and 70vw", () => {
  expect(DEFAULT_RIGHT_PANEL_WIDTH).toBe(560);
  expect(MIN_RIGHT_PANEL_WIDTH).toBe(420);
  expect(clampRightPanelWidth(300, 1400)).toBe(420);
  expect(clampRightPanelWidth(1200, 1400)).toBe(980);
  expect(clampRightPanelWidth(620, 1400)).toBe(620);
});
```

- [ ] **Step 2: Run the utility test and verify failure**

Run: `npm test -- app/lib/layout-preferences.test.ts`

Expected: FAIL because the module is missing.

- [ ] **Step 3: Implement exact layout helpers**

```ts
export const EXPANDED_SIDEBAR_WIDTH = 248;
export const COLLAPSED_SIDEBAR_WIDTH = 64;
export const DEFAULT_RIGHT_PANEL_WIDTH = 560;
export const MIN_RIGHT_PANEL_WIDTH = 420;

export function clampRightPanelWidth(width: number, viewportWidth: number) {
  return Math.min(
    Math.max(width, MIN_RIGHT_PANEL_WIDTH),
    Math.floor(viewportWidth * 0.7),
  );
}

export function readStoredNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function readStoredBoolean(value: string | null, fallback: boolean) {
  return value === "true" ? true : value === "false" ? false : fallback;
}
```

- [ ] **Step 4: Write failing shell interaction tests**

```ts
test("collapses the left navigation and remembers the state", async () => {
  render(<Page />);
  await userEvent.click(screen.getByRole("button", { name: "收起左侧导航" }));
  expect(screen.getByRole("navigation", { name: "主导航" })).toHaveClass("collapsed");
  expect(localStorage.getItem("kflow.sidebar.collapsed")).toBe("true");
});

test("opens a wider adjustable right panel", async () => {
  render(<Page />);
  await userEvent.click(screen.getByRole("button", { name: "23 项上下文" }));
  expect(screen.getByRole("separator", { name: "调整辅助面板宽度" })).toHaveAttribute("aria-valuenow", "560");
});
```

- [ ] **Step 5: Implement sidebar collapse and panel resize**

In `Page`, hydrate `isSidebarCollapsed` and `rightPanelWidth` from local storage in an effect, persist later changes, and set CSS variables on `.client-shell`:

```tsx
style={{
  "--sidebar-width": `${isSidebarCollapsed ? 64 : 248}px`,
  "--right-panel-width": `${rightPanelWidth}px`,
} as React.CSSProperties}
```

In `Sidebar`, add a `PanelLeftClose` / `PanelLeftOpen` button, apply `collapsed`, retain accessible names and titles, and visually hide text rather than removing navigation semantics.

In `PreviewDrawer`, add a focusable separator before the drawer:

```tsx
<div
  aria-label="调整辅助面板宽度"
  aria-orientation="vertical"
  aria-valuemin={420}
  aria-valuemax={Math.floor(window.innerWidth * 0.7)}
  aria-valuenow={width}
  role="separator"
  tabIndex={0}
/>
```

Pointer movement updates the width through `clampRightPanelWidth`; ArrowLeft grows, ArrowRight shrinks, and double-click restores `560`.

- [ ] **Step 6: Update responsive CSS and run tests**

Use `--right-panel-width` for the open auxiliary region. At narrow sizes, preserve the existing overlay behavior and constrain the width to the viewport. Add `.sidebar.collapsed` rules that center icons and hide `.brand > span`, `.brand small`, `.nav-button` text, task copy, and profile copy without hiding their buttons.

Run: `npm test -- app/lib/layout-preferences.test.ts app/components/client-demo.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/lib/layout-preferences.ts app/lib/layout-preferences.test.ts app/components/sidebar.tsx app/components/preview-drawer.tsx app/page.tsx app/globals.css app/components/client-demo.test.tsx
git commit -m "feat: add flexible three column layout"
```

---

### Task 4: Add Browser Prototype Preview and Element Editing

**Files:**
- Create: `app/components/prototype-editor.tsx`
- Create: `app/components/prototype-editor.test.tsx`
- Create: `app/prototype/page.tsx`
- Modify: `app/components/preview-drawer.tsx`
- Modify: `app/components/workspaces/prototype-workspace.tsx`
- Modify: `app/globals.css`
- Test: `app/components/client-demo.test.tsx`

**Interfaces:**
- Produces: `PrototypeElement` and `PrototypeElementDraft` types.
- Produces: `PrototypeEditor({ canEdit, compact?: boolean })`.
- Produces: browser URL `/prototype?project=customer-portal&requirement=role-permissions&version=V3&inspect=1`.
- Consumes: existing product artifact permissions and prototype document data.

- [ ] **Step 1: Write failing editor behavior tests**

```tsx
test("selects an element, previews a text change, applies it, and undoes it", async () => {
  render(<PrototypeEditor canEdit />);
  await userEvent.click(screen.getByRole("button", { name: "选择添加成员按钮" }));
  expect(screen.getByText("关联 Spec：AC-07")).toBeInTheDocument();
  await userEvent.clear(screen.getByLabelText("元素文案"));
  await userEvent.type(screen.getByLabelText("元素文案"), "邀请成员");
  await userEvent.click(screen.getByRole("button", { name: "预览修改" }));
  expect(screen.getByText(/添加成员 → 邀请成员/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "应用修改" }));
  expect(screen.getByRole("button", { name: "选择邀请成员按钮" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "撤销本次修改" }));
  expect(screen.getByRole("button", { name: "选择添加成员按钮" })).toBeInTheDocument();
});

test("keeps prototype edits read only for viewers", async () => {
  render(<PrototypeEditor canEdit={false} />);
  await userEvent.click(screen.getByRole("button", { name: "选择添加成员按钮" }));
  expect(screen.getByLabelText("元素文案")).toBeDisabled();
  expect(screen.getByRole("button", { name: "应用修改" })).toBeDisabled();
});
```

- [ ] **Step 2: Run the editor test and verify failure**

Run: `npm test -- app/components/prototype-editor.test.tsx`

Expected: FAIL because `PrototypeEditor` does not exist.

- [ ] **Step 3: Implement the reusable editor**

Define the prototype element model:

```ts
export interface PrototypeElement {
  id: string;
  name: string;
  type: "button" | "input" | "heading" | "navigation" | "row";
  text: string;
  tone: "primary" | "secondary" | "neutral";
  spec: string;
}
```

Seed at least `add-member`, `member-search`, and `member-row-lin`. The editor stores committed elements, selected ID, draft text/tone, one pending diff, and one undo snapshot. Clicking an element selects it; Escape or clicking the canvas background clears selection. “预览修改” creates a before/after summary, “应用修改” commits it, and “撤销本次修改” restores the snapshot.

For natural language, provide `aria-label="描述对选中元素的修改"`. Demo interpretation supports the phrases “次要” (tone becomes secondary), “只读” (row text gains “· 只读”), and quoted replacement text; otherwise it creates a visible instruction diff without mutating until confirmation.

- [ ] **Step 4: Add the standalone route and browser-open controls**

Create a client route that reads query parameters with `useSearchParams`, shows the requirement/version header, and renders `<PrototypeEditor canEdit />`.

In both `PrototypeWorkspace` and drawer prototype content, add:

```tsx
<a
  href="/prototype?project=customer-portal&requirement=role-permissions&version=V3&inspect=1"
  rel="noreferrer"
  target="_blank"
>
  在浏览器打开
</a>
```

Keep the action disabled or absent when no prototype document exists. Replace the duplicated private prototype markup in `PreviewDrawer` with `<PrototypeEditor canEdit={canEdit} compact />`.

- [ ] **Step 5: Add integration coverage and styling**

Add a test that opens prototype mode, opens the preview drawer, verifies the browser link target and selects an element. Style selectable hover/selected outlines, inspector fields, change summary, compact drawer layout, and standalone full-page layout. Add reduced-motion handling for hover/selection transitions.

Run: `npm test -- app/components/prototype-editor.test.tsx app/components/client-demo.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/components/prototype-editor.tsx app/components/prototype-editor.test.tsx app/prototype/page.tsx app/components/preview-drawer.tsx app/components/workspaces/prototype-workspace.tsx app/globals.css app/components/client-demo.test.tsx
git commit -m "feat: add editable browser prototype preview"
```

---

### Task 5: Regression Verification and Delivery

**Files:**
- Verify only: no source changes expected

**Interfaces:**
- Consumes: all preceding task outputs.
- Produces: a verified production build with no unrelated worktree changes.

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all tests PASS, including legacy project roles, office task tools, task isolation, and project settings.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit code `0` with no ESLint errors.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: exit code `0`; both `/` and `/prototype` routes are generated successfully.

- [ ] **Step 4: Check repository scope**

Run: `git status --short` and `git diff --check HEAD~4..HEAD`.

Expected: no uncommitted files and no whitespace errors; commits contain only this feature and its documentation.

- [ ] **Step 5: Record the verified commit sequence**

Run: `git log --oneline -5`

Expected: the design-plan commit followed by the four feature commits from Tasks 1–4. If a verification command failed, return to the owning task, make the correction there, rerun that task's focused test, and only then repeat Task 5 from Step 1.
