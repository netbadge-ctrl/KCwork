# KFlow Contextual Rail, Smart Assets, and Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make KFlow’s right rail task-aware, add Skill and plugin assets, and add a Codex-inspired personal workspace.

**Architecture:** A pure contextual-tool resolver owns the mapping from mode, view, Agent, and available evidence to rail actions. Existing drawers remain the rendering surface, while new lightweight preview kinds share one scene-preview component. Smart assets and profile preferences use deterministic client-side demo data and local state.

**Tech Stack:** React 19, TypeScript, lucide-react, Vitest, Testing Library, vinext/Vite, CSS.

## Global Constraints

- The right rail is derived from `mode + view + agent + requirement/task evidence`, defaults collapsed, and shows at most four relevant entries.
- Office work never exposes code Diff, repository, or test-report tools.
- Product-design work never exposes testing unless the active Agent is testing or test evidence already exists.
- Unavailable tools do not render as disabled placeholders.
- Skill and plugin behavior is deterministic local Demo state; no real OAuth or installation.
- The profile page excludes billing, complex security policies, organization audit, and admin-console functions.
- Preserve Agent-first hierarchy, fixed bottom composer, secondary governance, free Agent switching, and all existing project/task flows.

---

### Task 1: Contextual right-rail resolver and scene previews

**Files:**
- Create: `app/lib/contextual-tools.ts`
- Create: `app/lib/contextual-tools.test.ts`
- Create: `app/components/contextual-scene-preview.tsx`
- Modify: `app/lib/types.ts`
- Modify: `app/components/preview-drawer.tsx`
- Modify: `app/page.tsx`
- Modify: `app/components/client-demo.test.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `ContextualTool`, `ContextualToolContext`, and `resolveContextualTools(context): ContextualTool[]`.
- Produces: new contextual `PreviewKind` values `actions`, `chart`, `slides`, `outline`, `export`, `analysis`, `questions`, `components`, `interaction`, `files`, `issues`, and `failures`.
- `PreviewDrawer` consumes `tools: ContextualTool[]`; only those tools appear in the right rail.

- [ ] **Step 1: Write failing resolver tests**

```ts
import { describe, expect, test } from "vitest";
import { resolveContextualTools } from "./contextual-tools";

describe("resolveContextualTools", () => {
  test("keeps office data analysis free of development and test tools", () => {
    const tools = resolveContextualTools({
      mode: "office",
      view: "task",
      agentId: "data-analysis",
      hasExecution: true,
      hasTestEvidence: false,
    });
    expect(tools.map((tool) => tool.kind)).toEqual(["context", "chart", "analysis", "export"]);
    expect(tools.map((tool) => tool.kind)).not.toContain("diff");
    expect(tools.map((tool) => tool.kind)).not.toContain("test");
  });

  test("shows product, development, review, and test-specific rails", () => {
    expect(resolveContextualTools({ mode: "research", view: "requirement-detail", agentId: "prototype", hasExecution: false, hasTestEvidence: false }).map((tool) => tool.kind))
      .toEqual(["prototype", "components", "interaction", "context"]);
    expect(resolveContextualTools({ mode: "research", view: "requirement-detail", agentId: "frontend-dev", hasExecution: true, hasTestEvidence: false }).map((tool) => tool.kind))
      .toEqual(["files", "diff", "log", "context"]);
    expect(resolveContextualTools({ mode: "research", view: "requirement-detail", agentId: "code-review", hasExecution: false, hasTestEvidence: false }).map((tool) => tool.kind))
      .toEqual(["diff", "issues", "analysis", "context"]);
    expect(resolveContextualTools({ mode: "research", view: "requirement-detail", agentId: "testing", hasExecution: true, hasTestEvidence: true }).map((tool) => tool.kind))
      .toEqual(["test", "failures", "log", "context"]);
  });
});
```

- [ ] **Step 2: Run the resolver tests and verify RED**

Run: `npm test -- app/lib/contextual-tools.test.ts`

Expected: FAIL because `contextual-tools.ts` does not exist.

- [ ] **Step 3: Implement the pure resolver**

```ts
export interface ContextualTool {
  kind: PreviewKind;
  label: string;
  icon: LucideIcon;
}

export interface ContextualToolContext {
  mode: Mode;
  view: ViewId;
  agentId: string;
  hasExecution: boolean;
  hasTestEvidence: boolean;
}

export function resolveContextualTools(context: ContextualToolContext): ContextualTool[] {
  const mapped = context.mode === "office"
    ? officeTools[context.agentId] ?? officeTools.default
    : developmentTools[context.agentId] ?? developmentTools.default;
  return mapped
    .filter((tool) => tool.kind !== "log" || context.hasExecution)
    .filter((tool) => tool.kind !== "test" || context.agentId === "testing" || context.hasTestEvidence)
    .slice(0, 4);
}
```

Define explicit mappings for meeting minutes, data analysis, PPT, requirement analysis, prototype, PRD, frontend/backend, code review, and testing using the labels in the approved spec.

- [ ] **Step 4: Run resolver tests and verify GREEN**

Run: `npm test -- app/lib/contextual-tools.test.ts`

Expected: PASS with all mapping tests green.

- [ ] **Step 5: Write failing integration tests for dynamic rail behavior**

```tsx
test("changes the auxiliary rail with office and system-development work", async () => {
  render(<Page />);
  await userEvent.click(screen.getByRole("button", { name: "Q3 经营分析报告 7 月 12 日" }));
  expect(screen.getByRole("button", { name: "图表预览" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "代码差异" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "测试报告" })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "项目" }));
  await userEvent.click(screen.getByRole("button", { name: "打开企业客户门户 V3.2" }));
  await userEvent.click(screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" }));
  await userEvent.selectOptions(screen.getByLabelText("切换 Agent"), "prototype");
  expect(screen.getByRole("button", { name: "页面预览" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "测试报告" })).not.toBeInTheDocument();
});
```

- [ ] **Step 6: Wire the resolver into Page and PreviewDrawer**

Compute `contextualTools` in `app/page.tsx` from current state, selected Agent, current execution, and requirement test evidence. Pass the array into `PreviewDrawer` and render it instead of the fixed module-level `tools` array.

```tsx
const contextualTools = resolveContextualTools({
  mode: state.mode,
  view: state.view,
  agentId: state.selectedAgentId,
  hasExecution: activeExecution !== "idle",
  hasTestEvidence: Boolean(selectedRequirement?.counts.tests),
});
```

Add an effect in `PreviewDrawer` that closes an open contextual preview when its `kind` disappears from the new tool list. Preserve content-triggered previews such as members, settings, assets, sources, prototype, and PDF.

- [ ] **Step 7: Add shared contextual scene content**

`ContextualScenePreview` renders deterministic, scenario-specific summaries for actions, charts, slide outline/preview, export, analysis, questions, components, interactions, changed files, review issues, and failures. It must never mention code or tests in office previews.

- [ ] **Step 8: Run focused and full tests**

Run: `npm test -- app/lib/contextual-tools.test.ts app/components/client-demo.test.tsx`

Expected: PASS, including office/product negative assertions.

- [ ] **Step 9: Commit Task 1**

```bash
git add app/lib/contextual-tools.ts app/lib/contextual-tools.test.ts app/lib/types.ts app/components/contextual-scene-preview.tsx app/components/preview-drawer.tsx app/components/client-demo.test.tsx app/page.tsx app/globals.css
git commit -m "feat: make the auxiliary rail task-aware"
```

---

### Task 2: Skill and plugin smart assets

**Files:**
- Modify: `app/lib/types.ts`
- Modify: `app/lib/demo-data.ts`
- Modify: `app/components/assets-view.tsx`
- Modify: `app/components/client-demo.test.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Extends `AssetKind` with `skill` and `plugin`.
- Extends `AssetItem` with optional `scope`, `trigger`, `capabilities`, and `enabled` fields.
- `AssetsView` owns local enable/disable state and asset-detail expansion.

- [ ] **Step 1: Write failing asset tests**

```tsx
test("shows Skill and plugin assets with useful metadata", async () => {
  render(<Page />);
  await userEvent.click(screen.getByRole("button", { name: "智能资产" }));
  await userEvent.click(screen.getByRole("tab", { name: "Skill" }));
  expect(screen.getByRole("heading", { name: "PRD 专业写作" })).toBeInTheDocument();
  expect(screen.getByText("团队 Skill")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("tab", { name: "插件" }));
  expect(screen.getByRole("heading", { name: "GitHub" })).toBeInTheDocument();
  expect(screen.getByText("代码、Pull Request 与 Issue" )).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the asset test and verify RED**

Run: `npm test -- app/components/client-demo.test.tsx -t "shows Skill and plugin assets"`

Expected: FAIL because the tabs and data do not exist.

- [ ] **Step 3: Add typed deterministic Skill and plugin records**

Add at least three Skills (personal/team/system) and three plugins (GitHub, enterprise collaboration, office documents). Use status, scope, trigger, capabilities, and tool counts that can be displayed without backend calls.

- [ ] **Step 4: Extend AssetsView**

Add Skill and plugin tabs between Agent and knowledge. Skill cards show source scope, trigger, maintainer, and enabled state. Plugin cards show capabilities, connection status, permission summary, and tool count. Add unique `查看…详情` and `启用/停用…` labels.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- app/components/client-demo.test.tsx -t "smart asset|Skill|plugin"`

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add app/lib/types.ts app/lib/demo-data.ts app/components/assets-view.tsx app/components/client-demo.test.tsx app/globals.css
git commit -m "feat: add Skill and plugin smart assets"
```

---

### Task 3: Codex-inspired personal workspace and final regression

**Files:**
- Create: `app/components/profile-view.tsx`
- Modify: `app/lib/types.ts`
- Modify: `app/components/sidebar.tsx`
- Modify: `app/page.tsx`
- Modify: `app/components/client-demo.test.tsx`
- Modify: `app/globals.css`
- Modify: `README.md`

**Interfaces:**
- Extends `ViewId` with `profile`.
- `Sidebar` produces `onOpenProfile(): void` from both the profile block and settings button.
- `ProfileView` owns local preferences for default model, reasoning level, communication style, permission mode, notifications, favorites, and enabled extensions.

- [ ] **Step 1: Write failing personal-page tests**

```tsx
test("opens a Codex-inspired personal workspace from the sidebar profile", async () => {
  render(<Page />);
  await userEvent.click(screen.getByRole("button", { name: "打开陈楠个人页面" }));
  expect(screen.getByRole("heading", { name: "个人设置" })).toBeInTheDocument();
  expect(screen.getByText("账号与企业工作区")).toBeInTheDocument();
  expect(screen.getByText("Agent 偏好")).toBeInTheDocument();
  expect(screen.getByText("Skill 与插件")).toBeInTheDocument();
  expect(screen.getByText("连接与权限")).toBeInTheDocument();
  expect(screen.getByText("通知")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the profile test and verify RED**

Run: `npm test -- app/components/client-demo.test.tsx -t "personal workspace"`

Expected: FAIL because the accessible profile entry and profile view do not exist.

- [ ] **Step 3: Implement ProfileView and sidebar navigation**

Use a compact Codex-style settings layout: profile header, left section index, and one scrollable settings surface. Provide native selects and switches for model, reasoning, communication, permission, and notifications; show personal Skills/plugins and enterprise connections as informative cards.

```tsx
<button aria-label="打开陈楠个人页面" className="profile" onClick={onOpenProfile} type="button">
  <span className="profile-avatar">陈</span>
  <span className="profile-copy"><strong>陈楠</strong><small>研发中心</small></span>
</button>
```

The gear button calls the same handler and uses `aria-label="个人设置"`.

- [ ] **Step 4: Wire the profile view into Page**

Add `profile: "个人设置"` to sidebar navigation labels and render `<ProfileView />` for `state.view === "profile"`. Profile navigation must also go through the existing PRD draft guard.

- [ ] **Step 5: Add final negative regressions**

Assert office tasks contain no code/test rail tools, prototype/PRD contain no test rail tool, development shows files/Diff/log/context, testing shows report/failures/log/context, and switching from testing to prototype closes an open test drawer.

- [ ] **Step 6: Update README**

Replace the fixed-right-rail sentence with task-aware behavior, list Skill/plugin assets, and document the personal workspace.

- [ ] **Step 7: Run complete verification**

Run: `npm test`

Expected: all test files and tests pass.

Run: `npm run lint`

Expected: exit 0 with no lint findings.

Run: `npm run build`

Expected: exit 0 and `Build complete`.

Run: `git diff --check ec0c39bee7b43343271d39376fce4acdec653ad0..HEAD`

Expected: exit 0 with no output.

- [ ] **Step 8: Commit Task 3**

```bash
git add app/components/profile-view.tsx app/lib/types.ts app/components/sidebar.tsx app/page.tsx app/components/client-demo.test.tsx app/globals.css README.md
git commit -m "feat: add personal Agent preferences workspace"
```

