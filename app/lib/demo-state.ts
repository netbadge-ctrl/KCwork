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
  recentTaskMessages,
  recentTasks,
  requirements,
} from "./demo-data";

export interface ClientState {
  view: ViewId;
  mode: Mode;
  selectedAgentId: string;
  lastAgentByRequirement: Record<string, string>;
  selectedContextIdsByRequirement: Record<string, string[]>;
  lockedContextIdsByRequirement: Record<string, string[]>;
  selectedProjectId: string | null;
  selectedRequirementId: string | null;
  projectSection: ProjectSection;
  selectedAssetId: string | null;
  preview: PreviewKind | null;
  selectedTaskId: string;
  taskExecutionsById: Record<string, ExecutionState>;
  taskMessagesById: Record<string, Message[]>;
  requirementExecutions: Record<string, ExecutionState>;
  requirementMessages: Record<string, Message[]>;
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
  | { type: "select-task"; taskId: string }
  | { type: "select-project"; projectId: string | null }
  | { type: "select-requirement"; requirementId: string }
  | { type: "resume-agent-work"; sessionId: string }
  | { type: "toggle-context-source"; requirementId: string; sourceId: string }
  | { type: "toggle-context-lock"; requirementId: string; sourceId: string }
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

function contextIdsForRequirement(requirementId: string) {
  const requirement = requirements.find((item) => item.id === requirementId);
  if (!requirement) return [];
  return contextSources
    .filter(
      (source) =>
        source.projectId === requirement.projectId &&
        (!source.requirementId || source.requirementId === requirementId) &&
        source.autoSelected,
    )
    .map((source) => source.id);
}

const selectedContextIdsByRequirement = Object.fromEntries(
  requirements.map((requirement) => [
    requirement.id,
    contextIdsForRequirement(requirement.id),
  ]),
);

export const initialClientState: ClientState = {
  view: "task",
  mode: "research",
  selectedAgentId: "prd-writer",
  lastAgentByRequirement: Object.fromEntries(
    agentWorkSessions.map((session) => [session.requirementId, session.agentId]),
  ),
  selectedContextIdsByRequirement,
  lockedContextIdsByRequirement: {
    "role-permissions": ["context-role-spec"],
    "sso-login": [],
    "audit-export": [],
  },
  selectedProjectId: "customer-portal",
  selectedRequirementId: "role-permissions",
  projectSection: "overview",
  selectedAssetId: null,
  preview: null,
  selectedTaskId: "prd-role",
  taskExecutionsById: Object.fromEntries(
    recentTasks.map((task) => [task.id, "idle"]),
  ),
  taskMessagesById: Object.fromEntries(
    Object.entries(recentTaskMessages).map(([taskId, messages]) => [
      taskId,
      [...messages],
    ]),
  ),
  requirementExecutions: Object.fromEntries(
    requirements.map((requirement) => [requirement.id, "idle"]),
  ),
  requirementMessages: {
    "role-permissions": [
      {
        id: "role-session-user",
        role: "user",
        text: "补全角色权限边界和可测试验收标准。",
      },
      {
        id: "role-session-agent",
        role: "agent",
        agentId: "prd-writer",
        text: "REQ-032 PRD v1.4 已生成，等待确认本轮修订。",
        artifact: "prd",
      },
    ],
    "sso-login": [
      {
        id: "sso-session-user",
        role: "user",
        text: "执行企业 SSO 登录核心回归。",
      },
      {
        id: "sso-session-agent",
        role: "agent",
        agentId: "testing",
        text: "REQ-029 核心回归完成，31 个通过、2 个失败、1 个跳过。",
        artifact: "test",
      },
    ],
    "audit-export": [],
  },
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
};

const nextExecution: Record<ExecutionState, ExecutionState> = {
  idle: "reading",
  reading: "analyzing",
  analyzing: "generating",
  generating: "done",
  done: "done",
  error: "reading",
};

function canEditRequirementContext(
  state: ClientState,
  requirementId: string,
) {
  const requirement = requirements.find((item) => item.id === requirementId);
  const currentMember = projectMembers.find(
    (member) =>
      member.projectId === requirement?.projectId && member.name === "陈楠",
  );
  if (!currentMember) return false;
  return (state.memberRoles[currentMember.id] ?? currentMember.role) !== "viewer";
}

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
    case "select-task":
      return recentTasks.some((task) => task.id === action.taskId)
        ? { ...state, selectedTaskId: action.taskId }
        : state;
    case "select-project":
      if (!action.projectId) {
        return {
          ...state,
          selectedProjectId: null,
          selectedRequirementId: null,
        };
      }
      {
        const currentRequirement = requirements.find(
          (item) => item.id === state.selectedRequirementId,
        );
        const nextRequirement =
          currentRequirement?.projectId === action.projectId
            ? currentRequirement
            : requirements.find((item) => item.projectId === action.projectId) ?? null;
        return {
          ...state,
          selectedProjectId: action.projectId,
          selectedRequirementId: nextRequirement?.id ?? null,
          selectedAgentId: nextRequirement
            ? state.lastAgentByRequirement[nextRequirement.id] ?? "requirement-analysis"
            : state.selectedAgentId,
        };
      }
    case "select-requirement":
      {
        const requirement = requirements.find(
          (item) => item.id === action.requirementId,
        );
        if (!requirement) return state;
        return {
          ...state,
          view: "requirement-detail",
          selectedProjectId: requirement.projectId,
          selectedRequirementId: requirement.id,
          selectedAgentId:
            state.lastAgentByRequirement[requirement.id] ?? "requirement-analysis",
        };
      }
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
    case "toggle-context-source": {
      if (!canEditRequirementContext(state, action.requirementId)) return state;
      const selectedIds =
        state.selectedContextIdsByRequirement[action.requirementId] ?? [];
      const lockedIds =
        state.lockedContextIdsByRequirement[action.requirementId] ?? [];
      if (lockedIds.includes(action.sourceId)) return state;
      const requirement = requirements.find(
        (item) => item.id === action.requirementId,
      );
      const source = contextSources.find((item) => item.id === action.sourceId);
      if (
        !requirement ||
        !source ||
        source.projectId !== requirement.projectId ||
        (source.requirementId && source.requirementId !== requirement.id)
      ) {
        return state;
      }
      return {
        ...state,
        selectedContextIdsByRequirement: {
          ...state.selectedContextIdsByRequirement,
          [action.requirementId]: selectedIds.includes(action.sourceId)
            ? selectedIds.filter((id) => id !== action.sourceId)
            : [...selectedIds, action.sourceId],
        },
      };
    }
    case "toggle-context-lock": {
      if (!canEditRequirementContext(state, action.requirementId)) return state;
      const lockedIds =
        state.lockedContextIdsByRequirement[action.requirementId] ?? [];
      const selectedIds =
        state.selectedContextIdsByRequirement[action.requirementId] ?? [];
      const requirement = requirements.find(
        (item) => item.id === action.requirementId,
      );
      const source = contextSources.find((item) => item.id === action.sourceId);
      if (
        !requirement ||
        !source ||
        source.projectId !== requirement.projectId ||
        (source.requirementId && source.requirementId !== requirement.id)
      ) {
        return state;
      }
      const isLocked = lockedIds.includes(action.sourceId);
      return {
        ...state,
        lockedContextIdsByRequirement: {
          ...state.lockedContextIdsByRequirement,
          [action.requirementId]: isLocked
            ? lockedIds.filter((id) => id !== action.sourceId)
            : [...lockedIds, action.sourceId],
        },
        selectedContextIdsByRequirement: {
          ...state.selectedContextIdsByRequirement,
          [action.requirementId]:
            !isLocked && !selectedIds.includes(action.sourceId)
              ? [...selectedIds, action.sourceId]
              : selectedIds,
        },
      };
    }
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
      if (state.view === "requirement-detail" && state.selectedRequirementId) {
        const requirement = requirements.find(
          (item) => item.id === state.selectedRequirementId,
        );
        if (!requirement) return state;
        const messages = state.requirementMessages[requirement.id] ?? [];
        return {
          ...state,
          requirementExecutions: {
            ...state.requirementExecutions,
            [requirement.id]: "done",
          },
          requirementMessages: {
            ...state.requirementMessages,
            [requirement.id]: [
              ...messages,
              {
                id: `${requirement.id}-user-${messages.length}`,
                role: "user",
                text,
              },
              {
                id: `${requirement.id}-agent-${messages.length + 1}`,
                role: "agent",
                agentId: state.selectedAgentId,
                text: `${requirement.code} 的本轮处理已完成。结果已保留在当前需求工作区，可继续调整或查看对应产物。`,
                artifact:
                  state.selectedAgentId === "testing"
                    ? "test"
                    : state.selectedAgentId.includes("dev") ||
                        state.selectedAgentId === "code-review"
                      ? "diff"
                      : state.selectedAgentId === "prototype"
                        ? "prototype"
                        : "prd",
              },
            ],
          },
        };
      }
      return {
        ...state,
        view: "task",
        taskExecutionsById: {
          ...state.taskExecutionsById,
          [state.selectedTaskId]: "reading",
        },
        taskMessagesById: {
          ...state.taskMessagesById,
          [state.selectedTaskId]: [
            ...(state.taskMessagesById[state.selectedTaskId] ?? []),
            {
              id: `${state.selectedTaskId}-user-${state.taskMessagesById[state.selectedTaskId]?.length ?? 0}`,
              role: "user",
              text,
            },
          ],
        },
      };
    }
    case "advance-execution": {
      const currentExecution =
        state.taskExecutionsById[state.selectedTaskId] ?? "idle";
      const execution = nextExecution[currentExecution];
      if (execution !== "done" || currentExecution === "done") {
        return {
          ...state,
          taskExecutionsById: {
            ...state.taskExecutionsById,
            [state.selectedTaskId]: execution,
          },
        };
      }
      const messages = state.taskMessagesById[state.selectedTaskId] ?? [];
      const task = recentTasks.find((item) => item.id === state.selectedTaskId);
      return {
        ...state,
        taskExecutionsById: {
          ...state.taskExecutionsById,
          [state.selectedTaskId]: execution,
        },
        taskMessagesById: {
          ...state.taskMessagesById,
          [state.selectedTaskId]: [
            ...messages,
            {
              id: `${state.selectedTaskId}-agent-${messages.length}`,
              role: "agent",
              agentId: state.selectedAgentId,
              text: `${task?.title ?? "当前任务"} 已完成。本轮结果已保留在这条任务会话中，可继续调整。`,
            },
          ],
        },
      };
    }
    case "fail-execution":
      return {
        ...state,
        taskExecutionsById: {
          ...state.taskExecutionsById,
          [state.selectedTaskId]: "error",
        },
      };
  }
}
