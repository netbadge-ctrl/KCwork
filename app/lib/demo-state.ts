import type {
  DevelopmentTaskStatus,
  ExecutionState,
  Message,
  Mode,
  PreviewKind,
  ProjectRole,
  ProjectSection,
  RequirementStage,
  ViewId,
} from "./types";
import {
  agentWorkSessions,
  contextSources,
  developmentTasks,
  projectMembers,
  requirements,
} from "./demo-data";

export interface ClientState {
  view: ViewId;
  mode: Mode;
  selectedAgentId: string;
  lastAgentByRequirement: Record<string, string>;
  selectedContextIds: string[];
  lockedContextIds: string[];
  selectedProjectId: string | null;
  selectedRequirementId: string | null;
  projectSection: ProjectSection;
  selectedAssetId: string | null;
  preview: PreviewKind | null;
  execution: ExecutionState;
  messages: Message[];
  requirementStages: Record<string, RequirementStage>;
  stageRisks: Record<string, string>;
  memberRoles: Record<string, ProjectRole>;
  developmentTaskStatuses: Record<string, DevelopmentTaskStatus>;
  documentDrafts: Record<string, string>;
}

export type ClientAction =
  | { type: "navigate"; view: ViewId }
  | { type: "set-mode"; mode: Mode }
  | { type: "select-agent"; agentId: string }
  | { type: "select-project"; projectId: string | null }
  | { type: "select-requirement"; requirementId: string }
  | { type: "resume-agent-work"; sessionId: string }
  | { type: "toggle-context-source"; sourceId: string }
  | { type: "toggle-context-lock"; sourceId: string }
  | {
      type: "set-requirement-stage";
      requirementId: string;
      stage: RequirementStage;
      reason: string;
    }
  | { type: "select-project-section"; section: ProjectSection }
  | { type: "select-project-asset"; assetId: string | null }
  | { type: "set-member-role"; memberId: string; role: ProjectRole }
  | {
      type: "set-development-task-status";
      taskId: string;
      status: DevelopmentTaskStatus;
    }
  | { type: "set-document-draft"; documentId: string; draft: string }
  | { type: "open-preview"; preview: PreviewKind }
  | { type: "close-preview" }
  | { type: "send-message"; text: string }
  | { type: "advance-execution" }
  | { type: "fail-execution" };

export const initialClientState: ClientState = {
  view: "task",
  mode: "research",
  selectedAgentId: "prd-writer",
  lastAgentByRequirement: Object.fromEntries(
    agentWorkSessions.map((session) => [session.requirementId, session.agentId]),
  ),
  selectedContextIds: contextSources
    .filter((source) => source.autoSelected)
    .map((source) => source.id),
  lockedContextIds: ["context-role-spec"],
  selectedProjectId: "customer-portal",
  selectedRequirementId: null,
  projectSection: "overview",
  selectedAssetId: null,
  preview: null,
  execution: "idle",
  requirementStages: Object.fromEntries(
    requirements.map((requirement) => [requirement.id, requirement.stage]),
  ),
  stageRisks: {},
  memberRoles: Object.fromEntries(
    projectMembers.map((member) => [member.id, member.role]),
  ),
  developmentTaskStatuses: Object.fromEntries(
    developmentTasks.map((task) => [task.id, task.status]),
  ),
  documentDrafts: {},
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
      return {
        ...state,
        selectedAgentId: action.agentId,
        lastAgentByRequirement:
          state.view === "requirement-detail" && state.selectedRequirementId
          ? {
              ...state.lastAgentByRequirement,
              [state.selectedRequirementId]: action.agentId,
            }
          : state.lastAgentByRequirement,
      };
    case "select-project":
      return { ...state, selectedProjectId: action.projectId };
    case "select-requirement":
      return {
        ...state,
        view: "requirement-detail",
        selectedRequirementId: action.requirementId,
        selectedAgentId:
          state.lastAgentByRequirement[action.requirementId] ?? "requirement-analysis",
      };
    case "resume-agent-work": {
      const session = agentWorkSessions.find((item) => item.id === action.sessionId);
      if (!session) return state;
      return {
        ...state,
        view: "requirement-detail",
        selectedProjectId: session.projectId,
        selectedRequirementId: session.requirementId,
        selectedAgentId: session.agentId,
        lastAgentByRequirement: {
          ...state.lastAgentByRequirement,
          [session.requirementId]: session.agentId,
        },
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
    case "set-requirement-stage":
      return {
        ...state,
        requirementStages: {
          ...state.requirementStages,
          [action.requirementId]: action.stage,
        },
        stageRisks: {
          ...state.stageRisks,
          [action.requirementId]: action.reason,
        },
      };
    case "select-project-section":
      return {
        ...state,
        projectSection: action.section,
        selectedAssetId: null,
        view: action.section === "overview" ? "project-detail" : "project-asset",
      };
    case "select-project-asset":
      return { ...state, selectedAssetId: action.assetId };
    case "set-member-role":
      return {
        ...state,
        memberRoles: { ...state.memberRoles, [action.memberId]: action.role },
      };
    case "set-development-task-status":
      return {
        ...state,
        developmentTaskStatuses: {
          ...state.developmentTaskStatuses,
          [action.taskId]: action.status,
        },
      };
    case "set-document-draft":
      return {
        ...state,
        documentDrafts: {
          ...state.documentDrafts,
          [action.documentId]: action.draft,
        },
      };
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
