import type {
  ExecutionState,
  Message,
  Mode,
  PreviewKind,
  ViewId,
} from "./types";

export interface ClientState {
  view: ViewId;
  mode: Mode;
  selectedAgentId: string;
  selectedProjectId: string | null;
  preview: PreviewKind | null;
  execution: ExecutionState;
  messages: Message[];
}

export type ClientAction =
  | { type: "navigate"; view: ViewId }
  | { type: "set-mode"; mode: Mode }
  | { type: "select-agent"; agentId: string }
  | { type: "select-project"; projectId: string | null }
  | { type: "open-preview"; preview: PreviewKind }
  | { type: "close-preview" }
  | { type: "send-message"; text: string }
  | { type: "advance-execution" }
  | { type: "fail-execution" };

export const initialClientState: ClientState = {
  view: "task",
  mode: "research",
  selectedAgentId: "prd-writer",
  selectedProjectId: "customer-portal",
  preview: null,
  execution: "idle",
  messages: [
    {
      id: "initial-user",
      role: "user",
      text: "根据需求访谈和原型，帮我完善角色管理模块的 PRD，重点补全权限边界和验收标准。",
    },
    {
      id: "initial-agent",
      role: "agent",
      agentId: "prd-writer",
      text: "PRD 已更新。我补充了租户管理员、项目管理员和普通成员三类角色的权限边界，并新增了 12 条可测试的验收标准。",
      artifact: "prd",
    },
  ],
};

const nextExecution: Record<ExecutionState, ExecutionState> = {
  idle: "reading",
  reading: "analyzing",
  analyzing: "generating",
  generating: "done",
  done: "done",
  error: "reading",
};

export function clientReducer(
  state: ClientState,
  action: ClientAction,
): ClientState {
  switch (action.type) {
    case "navigate":
      return { ...state, view: action.view };
    case "set-mode":
      return {
        ...state,
        mode: action.mode,
        selectedAgentId:
          action.mode === "office" ? "meeting-notes" : "prd-writer",
      };
    case "select-agent":
      return { ...state, selectedAgentId: action.agentId };
    case "select-project":
      return { ...state, selectedProjectId: action.projectId };
    case "open-preview":
      return { ...state, preview: action.preview };
    case "close-preview":
      return { ...state, preview: null };
    case "send-message": {
      const text = action.text.trim();
      if (!text) return state;
      return {
        ...state,
        view: "task",
        execution: "reading",
        messages: [
          ...state.messages,
          {
            id: `user-${state.messages.length}`,
            role: "user",
            text,
          },
        ],
      };
    }
    case "advance-execution": {
      const execution = nextExecution[state.execution];
      if (execution !== "done" || state.execution === "done") {
        return { ...state, execution };
      }
      return {
        ...state,
        execution,
        messages: [
          ...state.messages,
          {
            id: `agent-${state.messages.length}`,
            role: "agent",
            agentId: state.selectedAgentId,
            text: "任务已完成。我已结合当前项目上下文整理结果，你可以继续调整或查看产物。",
            artifact:
              state.selectedAgentId === "testing"
                ? "test"
                : state.selectedAgentId.includes("dev")
                  ? "diff"
                  : "prd",
          },
        ],
      };
    }
    case "fail-execution":
      return { ...state, execution: "error" };
  }
}
