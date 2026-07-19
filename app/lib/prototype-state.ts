"use client";

import { useCallback, useEffect, useState } from "react";

export interface PrototypeElement {
  id: string;
  name: string;
  type: "button" | "input" | "heading" | "navigation" | "row";
  text: string;
  tone: "primary" | "secondary" | "neutral";
  spec: string;
  page: string;
  size: "small" | "medium" | "large";
  interactionState: "default" | "active";
}

export type PrototypePageName = "总览" | "成员与角色" | "角色详情" | "操作审计";

export interface PrototypeElementDraft {
  text: string;
  tone: PrototypeElement["tone"];
  instruction: string;
}

export interface PrototypeElementDiff {
  before: PrototypeElement;
  after: PrototypeElement;
}

export interface PrototypeDocumentState {
  elements: PrototypeElement[];
  selectedId: string | null;
  draft: PrototypeElementDraft | null;
  pendingDiff: PrototypeElementDiff | null;
  undoSnapshot: PrototypeElement[] | null;
  validationError: string | null;
}

const PROTOTYPE_STORAGE_PREFIX = "kflow.prototype.requirement.";
const PROTOTYPE_STATE_EVENT = "kflow:prototype-state";

const initialElements: PrototypeElement[] = [
  {
    id: "members-navigation",
    name: "成员管理导航",
    type: "navigation",
    text: "成员管理",
    tone: "primary",
    spec: "US-04",
    page: "成员与角色",
    size: "medium",
    interactionState: "active",
  },
  {
    id: "members-heading",
    name: "成员与角色管理标题",
    type: "heading",
    text: "成员与角色管理",
    tone: "neutral",
    spec: "US-04",
    page: "成员与角色",
    size: "large",
    interactionState: "default",
  },
  {
    id: "add-member",
    name: "添加成员按钮",
    type: "button",
    text: "添加成员",
    tone: "primary",
    spec: "AC-07",
    page: "成员与角色",
    size: "medium",
    interactionState: "default",
  },
  {
    id: "member-search",
    name: "成员搜索输入框",
    type: "input",
    text: "搜索成员、邮箱或角色",
    tone: "neutral",
    spec: "US-04",
    page: "成员与角色",
    size: "large",
    interactionState: "default",
  },
  {
    id: "member-row-lin",
    name: "林川成员行",
    type: "row",
    text: "林川 · 研发",
    tone: "neutral",
    spec: "AC-09",
    page: "成员与角色",
    size: "large",
    interactionState: "default",
  },
];

function createInitialState(): PrototypeDocumentState {
  return {
    elements: initialElements.map((element) => ({ ...element })),
    selectedId: null,
    draft: null,
    pendingDiff: null,
    undoSnapshot: null,
    validationError: null,
  };
}

function storageKey(requirementId: string) {
  return `${PROTOTYPE_STORAGE_PREFIX}${requirementId}`;
}

function parseState(value: string | null): PrototypeDocumentState {
  if (!value) return createInitialState();
  try {
    const parsed = JSON.parse(value) as Partial<PrototypeDocumentState>;
    if (!Array.isArray(parsed.elements)) return createInitialState();
    const storedElements = new Map(
      parsed.elements.map((element) => [element.id, element]),
    );
    const elements = initialElements.map((element) => ({
      ...element,
      ...storedElements.get(element.id),
    }));
    return {
      elements,
      selectedId:
        typeof parsed.selectedId === "string" ? parsed.selectedId : null,
      draft: parsed.draft ?? null,
      pendingDiff: parsed.pendingDiff ?? null,
      undoSnapshot: Array.isArray(parsed.undoSnapshot)
        ? parsed.undoSnapshot
        : null,
      validationError:
        typeof parsed.validationError === "string"
          ? parsed.validationError
          : null,
    };
  } catch {
    return createInitialState();
  }
}

function readState(requirementId: string) {
  if (typeof window === "undefined" || !window.localStorage) {
    return createInitialState();
  }
  return parseState(window.localStorage.getItem(storageKey(requirementId)));
}

function publishState(requirementId: string, state: PrototypeDocumentState) {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem(storageKey(requirementId), JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent(PROTOTYPE_STATE_EVENT, {
      detail: { requirementId, state },
    }),
  );
}

export function getPrototypeDocumentStatus(state: PrototypeDocumentState) {
  const selected = state.elements.find(
    (element) => element.id === state.selectedId,
  );
  const dirty = Boolean(
    selected &&
      state.draft &&
      (state.draft.text !== selected.text ||
        state.draft.tone !== selected.tone ||
        state.draft.instruction.trim()),
  );
  return { dirty, pending: Boolean(state.pendingDiff) };
}

export function discardPrototypeDraft(requirementId: string) {
  const current = readState(requirementId);
  const selected = current.elements.find(
    (element) => element.id === current.selectedId,
  );
  publishState(requirementId, {
    ...current,
    draft: selected
      ? { text: selected.text, tone: selected.tone, instruction: "" }
      : null,
    pendingDiff: null,
    validationError: null,
  });
}

export function usePrototypeDocumentState(requirementId: string) {
  const [snapshot, setSnapshot] = useState<{
    requirementId: string;
    state: PrototypeDocumentState;
  }>(() => ({ requirementId, state: readState(requirementId) }));
  const state =
    snapshot.requirementId === requirementId
      ? snapshot.state
      : readState(requirementId);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey(requirementId)) return;
      setSnapshot({
        requirementId,
        state: parseState(event.newValue),
      });
    };
    const handleLocalUpdate = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          requirementId: string;
          state: PrototypeDocumentState;
        }>
      ).detail;
      if (detail.requirementId === requirementId) {
        setSnapshot({ requirementId, state: detail.state });
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener(PROTOTYPE_STATE_EVENT, handleLocalUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(PROTOTYPE_STATE_EVENT, handleLocalUpdate);
    };
  }, [requirementId]);

  const updateState = useCallback(
    (
      update: (current: PrototypeDocumentState) => PrototypeDocumentState,
    ) => {
      const next = update(readState(requirementId));
      publishState(requirementId, next);
      setSnapshot({ requirementId, state: next });
    },
    [requirementId],
  );

  return { state, updateState };
}

export function usePrototypeDocumentStatus(requirementId: string | null) {
  const { state } = usePrototypeDocumentState(requirementId ?? "__none__");
  return requirementId
    ? getPrototypeDocumentStatus(state)
    : { dirty: false, pending: false };
}
