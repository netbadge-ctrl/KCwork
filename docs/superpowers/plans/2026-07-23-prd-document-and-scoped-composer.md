# PRD 文档化与右侧发送框对齐主 Composer — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把右侧面板的 PRD 预览统一成整页文档(对齐 PDF 样式),并把右侧"发送到主对话"框视觉对齐主底栏 Composer。

**Architecture:** 新增一个共享的 `PrdDocumentSheet` 组件复用现有 `.pdf-sheet` 美学;两个 PRD 右侧入口(`ProductPrdPanel` 产品设计 PRD 模式、`PrdPreview` 项目资产入口)都改用它。扩充 `prdBody` 种子为完整 5 章文档。重做 `ScopedArtifactComposer` 样式到 `.composer` token,行为不变。范围只限右侧面板,不碰主舞台 `PrdWorkspace`(`PRD 撰写工作台`,测试钉它缺席态)。

**Tech Stack:** React 19 + Next App Router + Vinext, TypeScript, TailwindCSS via `app/globals.css` 原生 CSS, Vitest + Testing Library。

## Global Constraints

- 项目为确定性前端 Demo;`prdBody` 扩充是丰富种子数据,不改 reducer 逻辑。
- 保留 CLAUDE.md 约束:不迁移框架、不改包脚本/构建工具/框架依赖、保持 React 19 + TS + Next App Router + Vinext。
- 改动后跑 `npm test` 与 `npm run build`。
- 只更新"钉死旧占位文本/旧 DOM 结构"的断言,不改测试表达的行为。
- 现有 CSS 变量:`--surface`、`--border`、`--border-strong`、`--accent`、`--accent-soft`、`--text`、`--text-secondary`、`--text-muted`、`--radius-lg`、`--shadow-float`、`--surface-soft`。
- `ProductContextReference` = `{ kind: "prototype" | "prd"; label: string }`(见 `app/lib/types.ts:166`)。
- 主舞台 `PrdWorkspace`(`PRD 撰写工作台` 标题,`app/components/workspaces/prd-workspace.tsx`)本计划**不改动**;测试在多个模式断言它缺席。

---

### Task 1: 扩充 PRD 种子文档内容

**Files:**
- Modify: `app/lib/product-package.ts:136` (`createInitialProductPackage` 的 `prdBody`)

**Interfaces:**
- Produces: 一个完整的 5 章 + 验收标准的 `prdBody` 字符串,后续 `PrdDocumentSheet` 按 `## `/`✓ ` 前缀解析。

**Why first:** 内容是后续渲染的输入;先把真实文档写好,渲染才有意义。不改逻辑,纯种子数据。

- [ ] **Step 1: 定位现有 prdBody**

运行 `grep -n "prdBody:" app/lib/product-package.ts` 确认在 `createInitialProductPackage` 内 `prdBody: "## 1. 背景与目标\n..."`(约 136 行,3 段单句)。

- [ ] **Step 2: 替换为完整 5 章文档**

在 `app/lib/product-package.ts` 的 `createInitialProductPackage` 中,把 `prdBody:` 的值替换为:

```ts
    prdBody: `## 1. 背景与目标
统一企业客户门户中的项目成员与角色管理体验，使产品、研发与测试围绕同一份可追溯规格协作。本次重构聚焦权限边界清晰化与批量操作安全，不调整租户级组织架构与外部身份源。

## 2. 产品范围
覆盖成员列表、角色调整、批量操作、权限校验与审计记录四个能力域。项目管理员可调整成员角色，观察者保持只读，高风险批量操作必须二次确认。范围不包含租户计费权限与跨项目的成员同步。

## 3. 核心方案
成员列表以表格呈现，每行展示姓名、当前角色与操作入口。角色变更通过统一的权限接口完成，权限在下一次操作即时生效。批量调整 2 名及以上成员时弹出影响范围确认弹窗，确认后逐项执行并对失败项支持单独重试。

## 4. 权限规则
项目管理员可管理成员、项目设置与全部资产；产品维护需求、原型与产品文档；研发维护开发任务和代码变更；测试维护用例、报告与缺陷。无权限用户提交角色变更时接口返回 403 并保留原状态，观察者进入编辑入口时展示只读原因与申请权限入口。

## 5. 异常处理
部分成员修改失败时明确展示失败对象并允许仅重试失败项；两位管理员同时编辑同一成员时提示数据已更新并支持重新加载。所有角色变更均写入审计记录，包含操作者、时间、原角色与新角色，任何成员均不能查询或修改其他项目的角色数据。

## 6. 验收标准
✓ AC-07 项目管理员可以修改成员角色
✓ AC-09 观察者只能查看项目内容
✓ AC-11 批量修改角色前展示影响范围
✓ AC-12 所有权限变更写入审计记录
`,
```

- [ ] **Step 3: 确认 confirm-prd-revision 追加兼容**

运行 `grep -n "本轮补充" app/lib/product-package.ts` 确认 `confirm-prd-revision` 用 `\n\n## 本轮补充\n${state.prdRevision}` 追加到 `prdBody` 末尾。新 `prdBody` 以换行结尾,追加后仍按行解析,不破坏(此步只读确认,不改)。

- [ ] **Step 4: 跑测试看是否新增失败**

运行 `npm test -- app/components/client-demo.test.tsx 2>&1 | tail -15`。预期:与改动前相同的失败集合(本任务的 `prdBody` 文本无测试钉死,见前期核查:line 401 的 `租户管理员...` 来自任务回复消息而非 `prdBody`)。若有新增失败,记录失败名以备 Task 4 处理。

- [ ] **Step 5: 提交**

```bash
git add app/lib/product-package.ts
git commit -m "feat: expand PRD seed body to full 5-section document"
```

---

### Task 2: 新增 PrdDocumentSheet 共享组件

**Files:**
- Create: `app/components/prd-document-sheet.tsx`
- Test: `app/components/prd-document-sheet.test.tsx`(新建)

**Interfaces:**
- Consumes: 无外部依赖(纯渲染)。输入 props 见 Produces。
- Produces:
  ```ts
  export interface PrdDocumentSheetProps {
    title: string;            // 文档标题
    meta: string;            // 元信息行(如 "REQ-032 · Spec v1.4 · 陈楠")
    body: string;            // markdown-ish: `## ` 标题 / `✓ ` 验收 / 普通行段落
    editable?: boolean;     // 为真渲染 textarea 编辑 body
    onChange?(body: string): void;  // editable 时回写
  }
  export function PrdDocumentSheet(props: PrdDocumentSheetProps): JSX.Element;
  ```
  解析规则:`## ` 开头 → `<h2 id="sec-N">`;连续非空非 `## ` 非 `✓ ` 行 → 合并为 `<p>`(空行分段);`✓ ` 开头 → `<p className="check-line">`。

**Why:** 文档渲染的核心单元,独立可测。

- [ ] **Step 1: 写失败测试**

创建 `app/components/prd-document-sheet.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { PrdDocumentSheet } from "./prd-document-sheet";

describe("PrdDocumentSheet", () => {
  test("renders sections as headings and paragraphs", () => {
    render(<PrdDocumentSheet title="角色与成员权限重构" meta="REQ-032 · Spec v1.4" body={`## 1. 背景与目标\n统一权限体验。\n\n## 2. 产品范围\n覆盖成员列表。`} />);
    expect(screen.getByRole("heading", { name: "1. 背景与目标" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "2. 产品范围" })).toBeInTheDocument();
    expect(screen.getByText("统一权限体验。")).toBeInTheDocument();
    expect(screen.getByText("覆盖成员列表。")).toBeInTheDocument();
  });

  test("renders acceptance lines as check items", () => {
    render(<PrdDocumentSheet title="t" meta="m" body={`## 6. 验收标准\n✓ AC-07 项目管理员可以修改成员角色`} />);
    const item = screen.getByText("AC-07 项目管理员可以修改成员角色");
    expect(item.closest(".check-line")).not.toBeNull();
  });

  test("renders an editable textarea when editable", () => {
    render(<PrdDocumentSheet title="t" meta="m" body="## 1. x\ny" editable />);
    expect(screen.getByLabelText("PRD 正文")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

运行 `npx vitest run app/components/prd-document-sheet.test.tsx 2>&1 | tail -15`。预期:FAIL "Cannot find module './prd-document-sheet'"。

- [ ] **Step 3: 写实现**

创建 `app/components/prd-document-sheet.tsx`:

```tsx
import { Check } from "lucide-react";

export interface PrdDocumentSheetProps {
  title: string;
  meta: string;
  body: string;
  editable?: boolean;
  onChange?(body: string): void;
}

export function PrdDocumentSheet({ title, meta, body, editable, onChange }: PrdDocumentSheetProps) {
  if (editable) {
    return (
      <div className="prd-document-editor">
        <textarea
          aria-label="PRD 正文"
          onChange={(event) => onChange?.(event.target.value)}
          value={body}
        />
      </div>
    );
  }
  const blocks: React.ReactNode[] = [];
  let paragraph: string[] = [];
  let key = 0;
  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(<p key={`p-${key++}`}>{paragraph.join(" ")}</p>);
    paragraph = [];
  };
  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push(<h2 key={`h-${key++}`} id={`sec-${key}`}>{line.replace("## ", "")}</h2>);
    } else if (line.startsWith("✓ ")) {
      flushParagraph();
      blocks.push(<p className="check-line" key={`c-${key++}`}><Check size={14} />{line.replace("✓ ", "")}</p>);
    } else if (line === "") {
      flushParagraph();
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();
  return (
    <div className="pdf-sheet prd-sheet">
      <span className="document-tag">产品需求文档</span>
      <h1>{title}</h1>
      <p className="document-meta">{meta}</p>
      {blocks}
      <div className="pdf-page-number">{title.length > 0 ? "1 / 1" : ""}</div>
    </div>
  );
}
```

- [ ] **Step 4: 跑测试确认通过**

运行 `npx vitest run app/components/prd-document-sheet.test.tsx 2>&1 | tail -15`。预期:PASS 3 个。

- [ ] **Step 5: 提交**

```bash
git add app/components/prd-document-sheet.tsx app/components/prd-document-sheet.test.tsx
git commit -m "feat: add PrdDocumentSheet full-page document renderer"
```

---

### Task 3: 接入 ProductPrdPanel 与 PrdPreview

**Files:**
- Modify: `app/components/product-panels.tsx:145` (`ProductPrdPanel`)
- Modify: `app/components/preview-drawer.tsx:326`(传 `productPackage` 给 `PrdPreview`)、`app/components/preview-drawer.tsx:589` (`PrdPreview`)
- Test: `app/components/client-demo.test.tsx`(只更新因结构变化失败的断言)

**Interfaces:**
- Consumes: `PrdDocumentSheet`(Task 2)、`ProductPackageState`(`state.prdBody`、`state.prdVersions`)、`Requirement`。
- Produces: 两个右侧 PRD 入口用同一文档渲染。

- [ ] **Step 1: 改 ProductPrdPanel 用文档页**

在 `app/components/product-panels.tsx` 顶部加导入:

```tsx
import { PrdDocumentSheet } from "./prd-document-sheet";
```

替换 `ProductPrdPanel` 函数体(约 145-157 行)为:

```tsx
function ProductPrdPanel({ state, dispatch, canEdit, requirement, onScopedSend }: Props) {
  const [editing, setEditing] = useState(false);
  const sections = ["1. 背景与目标", "2. 产品范围", "3. 核心方案", "4. 权限规则", "5. 异常处理"];
  const [selectedSection, setSelectedSection] = useState(sections[2]);
  return <section className="product-panel prd-workbench">
    <ProductContext requirement={requirement} state={state} />
    <div className="product-panel-heading"><div><span>产品需求文档</span><h3>{requirement?.title ?? "角色与成员权限重构"}</h3><p>PRD {state.prdVersions.at(-1)?.version} · 关联原型 {state.prototypeVersions.at(-1)?.version} · 引用 {state.knowledgeIds.length} 项项目知识</p></div><button disabled={!canEdit} onClick={() => setEditing(!editing)} type="button">{editing ? "完成编辑" : "直接编辑"}</button></div>
    <div className="prd-anchor-strip">{sections.map((item) => <button className={item === selectedSection ? "active" : ""} key={item} onClick={() => setSelectedSection(item)} type="button">{item}</button>)}</div>
    <PrdDocumentSheet title={requirement?.title ?? "角色与成员权限重构"} meta={`${requirement?.code ?? ""} · Spec ${requirement?.specVersion ?? ""} · PRD ${state.prdVersions.at(-1)?.version ?? ""}`} body={state.prdBody} editable={editing} onChange={(body) => dispatch({ type: "set-prd-body", body })} />
    <div className="prd-natural-revision"><ScopedArtifactComposer canEdit={canEdit} label={`PRD ${state.prdVersions.at(-1)?.version} / ${selectedSection}`} onSend={(text) => { dispatch({ type: "set-prd-revision", revision: text }); onScopedSend?.({ kind: "prd", label: `PRD ${state.prdVersions.at(-1)?.version} / ${selectedSection}` }, text); }} />{state.prdRevision && <div className="prd-revision-preview"><b><GitCompareArrows size={14} />Agent 已生成待确认修订</b><p>将在“{selectedSection}”中补充：{state.prdRevision}</p><footer><button onClick={() => dispatch({ type: "set-prd-revision", revision: "" })} type="button">放弃</button><button onClick={() => dispatch({ type: "confirm-prd-revision" })} type="button">确认并生成新版本</button></footer></div>}</div>
  </section>;
}
```

(移除了 `prd-editor-layout` 左目录与 `prd-document-editor` 内联渲染,改用 `PrdDocumentSheet` + `prd-anchor-strip`;`ScopedArtifactComposer` 与修订预览降为文档下二级条带,逻辑不变。)

- [ ] **Step 2: 给 PrdPreview 传 productPackage 并改用文档页**

在 `app/components/preview-drawer.tsx` 第 326 行 `PrdPreview` 调用处加 `productPackage={productPackage}`:

```tsx
            {preview === "prd" && !isProductPanel && (
              <PrdPreview
                canEdit={capabilities.canEditProductArtifacts}
                documentDraft={documentDraft}
                onSaveDocumentDraft={onSaveDocumentDraft}
                requirement={selectedRequirement}
                productPackage={productPackage}
              />
            )}
```

替换 `PrdPreview` 函数(约 589-667 行)为使用 `PrdDocumentSheet`:

```tsx
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
            <button disabled={!canEdit} onClick={() => onSaveDocumentDraft("")} type="button">确认并保存新版本</button>
          </div>
        )}
      </aside>
    </article>
  );
}
```

在文件顶部加导入 `import { PrdDocumentSheet } from "./prd-document-sheet";`(`ProductPackageState` 已在顶部导入,line 42)。

- [ ] **Step 3: 跑测试,记录新增失败**

运行 `npm test -- app/components/client-demo.test.tsx 2>&1 | grep -E "FAIL|✓|×|Tests " | tail -20`。预期:若干原本 PRD 相关用例可能因 `prd-editor-layout`/`prd-document-editor` 旧 DOM 消失而变化。记录失败用例名。

- [ ] **Step 4: 只更新钉死旧结构的断言**

仅当某个失败用例的断言直接钉死被移除的旧 DOM(如 `.prd-editor-layout`、左侧目录按钮、旧内联 `<h4>`)时,更新该断言以匹配新文档结构(如改查 `PrdDocumentSheet` 渲染的 `## 1. 背景与目标` heading)。**不改**任何表达行为的断言(`PRD 修改要求`、`生成修订建议`、`未确认的 PRD 修订` dialog、`产品文档` heading、各模式 `PRD 撰写工作台` 缺席断言)。逐个改完跑 `npx vitest run <file> 2>&1 | tail -15` 确认该用例通过。

- [ ] **Step 5: 提交**

```bash
git add app/components/product-panels.tsx app/components/preview-drawer.tsx app/components/client-demo.test.tsx
git commit -m "feat: render PRD preview as full-page document in right panel"
```

---

### Task 4: 重做 ScopedArtifactComposer 对齐主 Composer

**Files:**
- Modify: `app/components/product-panels.tsx:160` (`ScopedArtifactComposer`)
- Modify: `app/globals.css:6211-6222`(`.scoped-artifact-composer` 旧规则)

**Interfaces:**
- Consumes: `ProductContextReference`(标签文案)。CSS token:`.composer`、`.composer-product-reference`、`.send-button`、`.composer-controls`。
- Produces: 视觉与主 Composer 一致的 scoped 发送框,props 不变 `{ canEdit, label, onSend }`。

- [ ] **Step 1: 重写 ScopedArtifactComposer JSX**

替换 `app/components/product-panels.tsx` 的 `ScopedArtifactComposer`(约 160-168 行)为:

```tsx
function ScopedArtifactComposer({ canEdit, label, onSend }: { canEdit: boolean; label: string; onSend(text: string): void }) {
  const [text, setText] = useState("");
  const submit = () => {
    if (!canEdit || !text.trim()) return;
    onSend(text.trim());
    setText("");
  };
  return (
    <div className="composer scoped-composer">
      <div className="composer-product-reference scoped-reference">
        当前引用：{label}
      </div>
      <textarea
        aria-label="精准引用修改要求"
        disabled={!canEdit}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }}
        placeholder="描述针对当前选择的修改…"
        value={text}
      />
      <div className="composer-toolbar">
        <div className="composer-controls">
          <span className="scoped-ref-tag">精准引用</span>
        </div>
        <button aria-label="发送到主对话" className="send-button" disabled={!canEdit || !text.trim()} onClick={submit} type="button">
          <ArrowUp size={15} />
        </button>
      </div>
    </div>
  );
}
```

(复用 `.composer` 容器与 `.composer-toolbar`/`.composer-controls`/`.send-button`;引用 chip 用 `.composer-product-reference`;无项目/Agent 选择器。)

- [ ] **Step 2: 更新 CSS**

在 `app/globals.css` 找到 `.scoped-artifact-composer`(约 6211 行)块,替换为:

```css
.scoped-composer { position: relative; }
.scoped-reference { position: relative; bottom: auto; left: auto; margin-bottom: 6px; }
.scoped-ref-tag { display: inline-flex; align-items: center; height: 26px; padding: 0 9px; color: var(--accent); font-size: 9px; background: var(--accent-soft); border: 1px solid #ddd5ff; border-radius: 8px; }
.scoped-composer textarea { min-height: 48px; padding: 8px 10px; font-size: 11px; line-height: 1.5; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; outline: 0; resize: vertical; }
.scoped-composer textarea:focus { border-color: var(--accent); }
.scoped-composer .composer-toolbar { padding-top: 6px; }
```

并删除旧的 `.scoped-artifact-composer` 全部规则(6211-6222)。`.prd-natural-revision .scoped-artifact-composer` 与 `.prd-natural-revision .scoped-artifact-composer textarea`(约 6252-6253)改为 `.prd-natural-revision .scoped-composer` / `.prd-natural-revision .scoped-composer textarea { min-height: 48px; }`。

- [ ] **Step 3: 跑测试确认无新增失败**

运行 `npm test -- app/components/client-demo.test.tsx 2>&1 | grep -E "FAIL .*PRD\|FAIL .*原型\|Tests " | tail -15`。预期:不新增失败(`ScopedArtifactComposer` 无测试钉其旧 class;行为 `onSend` 不变)。若有新增失败,检查是否某测试按文案 `发送到主对话` 找按钮——新实现保留 `aria-label="发送到主对话"`,应仍命中。

- [ ] **Step 4: 提交**

```bash
git add app/components/product-panels.tsx app/globals.css
git commit -m "style: align scoped composer with main Composer tokens"
```

---

### Task 5: 文档页与锚点条样式 + 全量验证

**Files:**
- Modify: `app/globals.css`(新增 `.prd-sheet`、`.prd-anchor-strip` 样式)
- Verify: `npm test`、`npm run build`、浏览器预览

- [ ] **Step 1: 新增文档页与锚点条 CSS**

在 `app/globals.css` 的 `.pdf-sheet` 附近(约 5697 行后)加:

```css
.prd-sheet { margin: 0; padding: 28px 26px; min-height: auto; }
.prd-sheet h2 { margin-top: 20px; margin-bottom: 6px; font-size: 13px; }
.prd-sheet .check-line { display: flex; align-items: center; gap: 6px; margin: 3px 0; color: var(--text-secondary); font-size: 10px; }
.prd-anchor-strip { display: flex; flex-wrap: wrap; gap: 5px; padding: 6px 0 10px; }
.prd-anchor-strip button { height: 24px; padding: 0 9px; color: var(--text-muted); font-size: 9px; background: var(--surface-soft); border: 1px solid var(--border); border-radius: 7px; }
.prd-anchor-strip button.active { color: var(--accent); background: var(--accent-soft); border-color: #ddd5ff; }
```

- [ ] **Step 2: 跑全量测试**

运行 `npm test 2>&1 | tail -6`。记录失败总数,与改动前(56 失败)对比:目标是不新增 PRD/原型相关失败,理想情况下因文档更完整,行为断言更稳。若仍有,逐一确认是历史失败(与改动前同名)还是新引入。

- [ ] **Step 3: 跑构建**

运行 `npm run build 2>&1 | tail -15`。预期:构建成功(无 TS 报错;`PrdDocumentSheet` 已正确导入导出)。

- [ ] **Step 4: 浏览器预览验证**

dev server 仍在 `http://localhost:3000/`(热更新)。在浏览器:首页 → 选产品设计 → 切到 PRD 工作模式 → 右侧应显示整页文档(5 章 + 验收 check 项 + 章节锚点条 + 下方"通过对话修改"框视觉与主底栏一致)。点"直接编辑"应切 textarea。截图存 `/tmp/prd-doc-preview.png` 确认非空白。

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --window-size=1440,900 --screenshot=/tmp/prd-doc-preview.png http://localhost:3000/ >/dev/null 2>&1
ls -la /tmp/prd-doc-preview.png
```

- [ ] **Step 5: 提交**

```bash
git add app/globals.css
git commit -m "style: add prd document sheet and anchor strip styles"
```

---

## Self-Review

**1. Spec coverage:**
- PRD 整页文档(对齐 PDF 样式) → Task 2(组件)+ Task 3(两个入口接入)+ Task 5(样式)。✓
- 扩充 prdBody 完整内容 → Task 1。✓
- 两个 PRD 入口统一同一套渲染 → Task 3(ProductPrdPanel + PrdPreview 都用 PrdDocumentSheet)。✓
- 移除左侧目录 → 改文档头锚点条 → Task 3 Step1(`prd-anchor-strip`)+ Task 5 样式。✓
- ScopedArtifactComposer 对齐主 Composer(保留精准引用、无项目/Agent 选择器)→ Task 4。✓
- 测试与 build 守则 → Task 5 Step2-3 + 各 Task 的测试步骤。✓
- 不碰主舞台 PrdWorkspace → Global Constraints 明确,Task 均未引用 prd-workspace.tsx。✓

**2. Placeholder scan:** 无 TBD/TODO;所有步骤含具体代码与命令。✓

**3. Type consistency:**
- `PrdDocumentSheetProps` 在 Task 2 定义,Task 3 使用 `{ title, meta, body, editable?, onChange? }` 一致。✓
- `PrdPreview` 新增 `productPackage: ProductPackageState`(Task 3),该类型已在 preview-drawer 顶部导入(line 42),调用处(Task 3 Step2)传 `productPackage={productPackage}` 一致。✓
- `ScopedArtifactComposer` props `{ canEdit, label, onSend }` 在 Task 4 与原签名一致,调用处(105、156)无需改。✓

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-23-prd-document-and-scoped-composer.md`. Two execution options:

1. **Subagent-Driven (recommended)** — 每个 Task 派一个新 subagent,Task 间我做两阶段审查,快速迭代。
2. **Inline Execution** — 在本会话用 executing-plans 批量执行,带检查点审查。

哪种?
