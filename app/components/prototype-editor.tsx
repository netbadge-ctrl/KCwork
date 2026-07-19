"use client";

import { useMemo, useState, type MouseEvent } from "react";

export const PROTOTYPE_BROWSER_URL =
  "/prototype?project=customer-portal&requirement=role-permissions&version=V3&inspect=1";

export function getPrototypeBrowserUrl(canEdit: boolean) {
  return canEdit ? PROTOTYPE_BROWSER_URL : `${PROTOTYPE_BROWSER_URL}&readonly=1`;
}

export interface PrototypeElement {
  id: string;
  name: string;
  type: "button" | "input" | "heading" | "navigation" | "row";
  text: string;
  tone: "primary" | "secondary" | "neutral";
  spec: string;
  page: string;
}

export interface PrototypeElementDraft {
  text: string;
  tone: PrototypeElement["tone"];
  instruction: string;
}

interface PrototypeElementDiff {
  before: PrototypeElement;
  after: PrototypeElement;
  instruction: string | null;
}

const initialElements: PrototypeElement[] = [
  {
    id: "add-member",
    name: "添加成员按钮",
    type: "button",
    text: "添加成员",
    tone: "primary",
    spec: "AC-07",
    page: "成员与角色",
  },
  {
    id: "member-search",
    name: "成员搜索输入框",
    type: "input",
    text: "搜索成员、邮箱或角色",
    tone: "neutral",
    spec: "US-04",
    page: "成员与角色",
  },
  {
    id: "member-row-lin",
    name: "林川成员行",
    type: "row",
    text: "林川 · 研发",
    tone: "neutral",
    spec: "AC-09",
    page: "成员与角色",
  },
];

const toneLabels: Record<PrototypeElement["tone"], string> = {
  primary: "主要",
  secondary: "次要",
  neutral: "中性",
};

const typeLabels: Record<PrototypeElement["type"], string> = {
  button: "按钮",
  input: "输入框",
  heading: "标题",
  navigation: "导航",
  row: "成员行",
};

function interpretDraft(
  element: PrototypeElement,
  draft: PrototypeElementDraft,
): { element: PrototypeElement; understoodInstruction: boolean } {
  let text = draft.text;
  let tone = draft.tone;
  let understoodInstruction = false;
  const instruction = draft.instruction.trim();
  const quotedText = instruction.match(/[“"]([^”"]+)[”"]/)?.[1];

  if (instruction.includes("次要")) {
    tone = "secondary";
    understoodInstruction = true;
  }
  if (instruction.includes("只读") && element.type === "row") {
    text = text.includes("· 只读") ? text : `${text} · 只读`;
    understoodInstruction = true;
  }
  if (quotedText) {
    text = quotedText;
    understoodInstruction = true;
  }

  return {
    element: { ...element, text, tone },
    understoodInstruction,
  };
}

export function PrototypeEditor({
  canEdit,
  compact = false,
}: {
  canEdit: boolean;
  compact?: boolean;
}) {
  const [elements, setElements] = useState(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PrototypeElementDraft | null>(null);
  const [pendingDiff, setPendingDiff] = useState<PrototypeElementDiff | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<PrototypeElement[] | null>(null);
  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedId) ?? null,
    [elements, selectedId],
  );
  const elementById = useMemo(
    () => Object.fromEntries(elements.map((element) => [element.id, element])),
    [elements],
  );

  const selectElement = (element: PrototypeElement) => {
    setSelectedId(element.id);
    setDraft({ text: element.text, tone: element.tone, instruction: "" });
    setPendingDiff(null);
  };

  const clearSelection = () => {
    setSelectedId(null);
    setDraft(null);
    setPendingDiff(null);
  };

  const clearFromCanvas = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!target.closest("[data-prototype-element]")) clearSelection();
  };

  const updateDraft = (changes: Partial<PrototypeElementDraft>) => {
    setDraft((current) =>
      current ? { ...current, ...changes } : current,
    );
    setPendingDiff(null);
  };

  const previewDraft = () => {
    if (!canEdit || !selectedElement || !draft) return;
    const { element: after, understoodInstruction } = interpretDraft(
      selectedElement,
      draft,
    );
    setPendingDiff({
      before: selectedElement,
      after,
      instruction:
        draft.instruction.trim() && !understoodInstruction
          ? draft.instruction.trim()
          : null,
    });
  };

  const applyDraft = () => {
    if (!canEdit || !pendingDiff) return;
    setUndoSnapshot(elements);
    setElements((current) =>
      current.map((element) =>
        element.id === pendingDiff.after.id ? pendingDiff.after : element,
      ),
    );
    setDraft({
      text: pendingDiff.after.text,
      tone: pendingDiff.after.tone,
      instruction: "",
    });
    setPendingDiff(null);
  };

  const undoLastChange = () => {
    if (!undoSnapshot) return;
    const restored = undoSnapshot;
    setElements(restored);
    setUndoSnapshot(null);
    setPendingDiff(null);
    const restoredSelection = restored.find(
      (element) => element.id === selectedId,
    );
    if (restoredSelection) {
      setDraft({
        text: restoredSelection.text,
        tone: restoredSelection.tone,
        instruction: "",
      });
    }
  };

  const renderSelector = (id: string, className: string) => {
    const element = elementById[id];
    return (
      <button
        aria-label={
          element.type === "button"
            ? `选择${element.text}按钮`
            : `选择${element.name}`
        }
        aria-pressed={selectedId === element.id}
        className={`${className} prototype-selectable ${selectedId === element.id ? "selected" : ""}`}
        data-prototype-element={element.id}
        onClick={() => selectElement(element)}
        type="button"
      >
        {element.type === "row" ? (
          <>
            <i>林</i>
            <span>{element.text}</span>
            <b>{element.text.includes("只读") ? "只读" : "按角色编辑"}</b>
            <em>•••</em>
          </>
        ) : (
          element.text
        )}
      </button>
    );
  };

  return (
    <section
      className={`prototype-editor ${compact ? "compact" : ""}`}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !selectedId) return;
        event.preventDefault();
        event.stopPropagation();
        clearSelection();
      }}
    >
      <div
        aria-label="原型画布"
        className="prototype-editor-canvas"
        onClick={clearFromCanvas}
        role="application"
        tabIndex={-1}
      >
        <div className="prototype-browser-bar">
          <i />
          <i />
          <i />
          <span>portal.local/members</span>
        </div>
        <div className="prototype-editor-app">
          <aside>
            <b>KFlow</b>
            <span>项目总览</span>
            <span className="active">成员管理</span>
            <span>操作审计</span>
          </aside>
          <main>
            <p>企业客户门户 V3.2</p>
            <div className="prototype-screen-heading">
              <h3>成员与角色管理</h3>
              {renderSelector("add-member", `prototype-element-${elementById["add-member"].tone}`)}
            </div>
            {renderSelector("member-search", "prototype-editor-search")}
            <div className="prototype-editor-member-list">
              <div className="prototype-member-line prototype-static-row">
                <i>陈</i><span>陈楠 · 项目管理员</span><b>管理全部</b><em>•••</em>
              </div>
              {renderSelector("member-row-lin", "prototype-member-line")}
              <div className="prototype-member-line prototype-static-row">
                <i>周</i><span>周祺 · 测试</span><b>按角色编辑</b><em>•••</em>
              </div>
            </div>
          </main>
        </div>
      </div>

      <aside className="prototype-element-inspector" aria-label="元素检查器">
        <div className="prototype-inspector-heading">
          <div>
            <p className="eyebrow">Inspect</p>
            <h3>{selectedElement?.name ?? "选择页面元素"}</h3>
          </div>
          {selectedElement && (
            <button className="text-button" onClick={clearSelection} type="button">
              清除选择
            </button>
          )}
        </div>
        {selectedElement && draft ? (
          <>
            <p className="prototype-spec-link">关联 Spec：{selectedElement.spec}</p>
            <div className="prototype-element-meta">
              <span>元素类型：{typeLabels[selectedElement.type]}</span>
              <span>所属页面：{selectedElement.page}</span>
            </div>
            <label>
              <span>元素文案</span>
              <input
                aria-label="元素文案"
                disabled={!canEdit}
                onChange={(event) => updateDraft({ text: event.target.value })}
                value={draft.text}
              />
            </label>
            <label>
              <span>视觉层级</span>
              <select
                aria-label="视觉层级"
                disabled={!canEdit}
                onChange={(event) =>
                  updateDraft({
                    tone: event.target.value as PrototypeElement["tone"],
                  })
                }
                value={draft.tone}
              >
                <option value="primary">主要</option>
                <option value="secondary">次要</option>
                <option value="neutral">中性</option>
              </select>
            </label>
            <label>
              <span>自然语言修改</span>
              <textarea
                aria-label="描述对选中元素的修改"
                disabled={!canEdit}
                onChange={(event) =>
                  updateDraft({ instruction: event.target.value })
                }
                placeholder="例如：改为次要按钮，或文案改成“邀请成员”"
                value={draft.instruction}
              />
            </label>
            <button
              className="secondary-button prototype-preview-change"
              disabled={!canEdit}
              onClick={previewDraft}
              type="button"
            >
              预览修改
            </button>
            {pendingDiff && (
              <div className="prototype-change-summary" role="status">
                <strong>确认本次修改</strong>
                {pendingDiff.before.text !== pendingDiff.after.text && (
                  <p>{pendingDiff.before.text} → {pendingDiff.after.text}</p>
                )}
                {pendingDiff.before.tone !== pendingDiff.after.tone && (
                  <p>{toneLabels[pendingDiff.before.tone]} → {toneLabels[pendingDiff.after.tone]}</p>
                )}
                {pendingDiff.instruction && (
                  <p>待执行指令：{pendingDiff.instruction}</p>
                )}
              </div>
            )}
            <button
              className="primary-small"
              disabled={!canEdit || !pendingDiff}
              onClick={applyDraft}
              type="button"
            >
              应用修改
            </button>
            {undoSnapshot && (
              <button
                className="text-button prototype-undo"
                onClick={undoLastChange}
                type="button"
              >
                撤销本次修改
              </button>
            )}
          </>
        ) : (
          <p className="prototype-inspector-empty">
            点击画布中的按钮、输入框或成员行，查看属性并起草修改。
          </p>
        )}
      </aside>
    </section>
  );
}
