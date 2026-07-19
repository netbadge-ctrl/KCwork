"use client";

import { useMemo, type MouseEvent } from "react";
import {
  type PrototypeElement,
  type PrototypeElementDraft,
  type PrototypePageName,
  usePrototypeDocumentState,
} from "../lib/prototype-state";

export type { PrototypeElement, PrototypeElementDraft } from "../lib/prototype-state";

export const PROTOTYPE_BROWSER_URL =
  "/prototype?project=customer-portal&requirement=role-permissions&version=V3&inspect=1";

export function getPrototypeBrowserUrl(canEdit: boolean) {
  return canEdit ? PROTOTYPE_BROWSER_URL : `${PROTOTYPE_BROWSER_URL}&readonly=1`;
}

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

const pageDetails: Record<
  Exclude<PrototypePageName, "成员与角色">,
  { heading: string; path: string; detail: string }
> = {
  总览: {
    heading: "项目总览",
    path: "overview",
    detail: "项目关键指标与最近活动预览",
  },
  角色详情: {
    heading: "角色详情",
    path: "roles/product",
    detail: "产品角色的权限范围与成员预览",
  },
  操作审计: {
    heading: "操作审计",
    path: "audit",
    detail: "角色变更与成员操作记录预览",
  },
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
  activePage = "成员与角色",
  canEdit,
  compact = false,
  inspectionEnabled = true,
  requirementId = "role-permissions",
}: {
  activePage?: PrototypePageName;
  canEdit: boolean;
  compact?: boolean;
  inspectionEnabled?: boolean;
  requirementId?: string;
}) {
  const { state, updateState } = usePrototypeDocumentState(requirementId);
  const { elements, selectedId, draft, pendingDiff, undoSnapshot } = state;
  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedId) ?? null,
    [elements, selectedId],
  );
  const elementById = useMemo(
    () => Object.fromEntries(elements.map((element) => [element.id, element])),
    [elements],
  );

  const selectElement = (element: PrototypeElement) => {
    if (!inspectionEnabled) return;
    updateState((current) => ({
      ...current,
      selectedId: element.id,
      draft: { text: element.text, tone: element.tone, instruction: "" },
      pendingDiff: null,
      validationError: null,
    }));
  };

  const clearSelection = () => {
    if (!inspectionEnabled) return;
    updateState((current) => ({
      ...current,
      selectedId: null,
      draft: null,
      pendingDiff: null,
      validationError: null,
    }));
  };

  const clearFromCanvas = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!target.closest("[data-prototype-element]")) clearSelection();
  };

  const updateDraft = (changes: Partial<PrototypeElementDraft>) => {
    updateState((current) => ({
      ...current,
      draft: current.draft ? { ...current.draft, ...changes } : null,
      pendingDiff: null,
      validationError: null,
    }));
  };

  const previewDraft = () => {
    if (!canEdit || !selectedElement || !draft) return;
    const { element: after, understoodInstruction } = interpretDraft(
      selectedElement,
      draft,
    );
    const changed =
      after.text !== selectedElement.text || after.tone !== selectedElement.tone;
    const unsupported = Boolean(draft.instruction.trim()) && !understoodInstruction;
    updateState((current) => ({
      ...current,
      pendingDiff:
        changed && !unsupported
          ? { before: selectedElement, after }
          : null,
      validationError: unsupported
        ? "无法理解这条修改要求，请调整文案、视觉层级或使用支持的描述。"
        : changed
          ? null
          : "未检测到可应用的修改。",
    }));
  };

  const applyDraft = () => {
    if (!canEdit || !pendingDiff) return;
    updateState((current) => ({
      ...current,
      undoSnapshot: current.elements,
      elements: current.elements.map((element) =>
        element.id === pendingDiff.after.id ? pendingDiff.after : element,
      ),
      draft: {
        text: pendingDiff.after.text,
        tone: pendingDiff.after.tone,
        instruction: "",
      },
      pendingDiff: null,
      validationError: null,
    }));
  };

  const undoLastChange = () => {
    if (!canEdit || !undoSnapshot) return;
    updateState((current) => {
      const restoredSelection = undoSnapshot.find(
        (element) => element.id === current.selectedId,
      );
      return {
        ...current,
        elements: undoSnapshot,
        undoSnapshot: null,
        pendingDiff: null,
        validationError: null,
        draft: restoredSelection
          ? {
              text: restoredSelection.text,
              tone: restoredSelection.tone,
              instruction: "",
            }
          : current.draft,
      };
    });
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
        data-interaction-state={element.interactionState}
        data-prototype-element={element.id}
        data-size={element.size}
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

  const renderMemberPage = () => (
    <>
      <div className="prototype-browser-bar">
        <i /><i /><i /><span>portal.local/members</span>
      </div>
      <div className="prototype-editor-app">
        <aside>
          <b>KFlow</b>
          <span>项目总览</span>
          {renderSelector("members-navigation", "prototype-editor-navigation active")}
          <span>操作审计</span>
        </aside>
        <main>
          <p>企业客户门户 V3.2</p>
          <div className="prototype-screen-heading">
            <h3>{renderSelector("members-heading", "prototype-editor-heading")}</h3>
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
    </>
  );

  const renderOtherPage = () => {
    const detail = pageDetails[activePage as Exclude<PrototypePageName, "成员与角色">];
    return (
      <>
        <div className="prototype-browser-bar">
          <i /><i /><i /><span>portal.local/{detail.path}</span>
        </div>
        <div className="prototype-editor-placeholder">
          <b>KFlow</b>
          <div><p>企业客户门户 V3.2</p><h3>{detail.heading}</h3><span>{detail.detail}</span></div>
        </div>
      </>
    );
  };

  return (
    <section
      className={`prototype-editor ${compact ? "compact" : ""}`}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !selectedId || !inspectionEnabled) return;
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
        {activePage === "成员与角色" ? renderMemberPage() : renderOtherPage()}
      </div>

      <aside className="prototype-element-inspector" aria-label="元素检查器">
        <div className="prototype-inspector-heading">
          <div>
            <p className="eyebrow">Inspect</p>
            <h3>{selectedElement?.name ?? "选择页面元素"}</h3>
          </div>
          {selectedElement && inspectionEnabled && (
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
              <span>尺寸：{selectedElement.size}</span>
              <span>交互状态：{selectedElement.interactionState}</span>
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
            {state.validationError && (
              <p className="prototype-change-error" role="alert">
                {state.validationError}
              </p>
            )}
            {pendingDiff && (
              <div className="prototype-change-summary" role="status">
                <strong>确认本次修改</strong>
                {pendingDiff.before.text !== pendingDiff.after.text && (
                  <p>{pendingDiff.before.text} → {pendingDiff.after.text}</p>
                )}
                {pendingDiff.before.tone !== pendingDiff.after.tone && (
                  <p>{toneLabels[pendingDiff.before.tone]} → {toneLabels[pendingDiff.after.tone]}</p>
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
                disabled={!canEdit}
                onClick={undoLastChange}
                type="button"
              >
                撤销本次修改
              </button>
            )}
          </>
        ) : (
          <p className="prototype-inspector-empty">
            {inspectionEnabled
              ? "点击画布中的按钮、输入框、标题、导航或成员行，查看属性并起草修改。"
              : "检查模式已关闭；画布控件按预览方式展示，不会改变当前选择。"}
          </p>
        )}
      </aside>
    </section>
  );
}
