import { describe, expect, it } from "vitest";
import { clientReducer, initialClientState } from "./demo-state";

describe("clientReducer", () => {
  it("switches mode and Agent without creating workflow state", () => {
    const office = clientReducer(initialClientState, {
      type: "set-mode",
      mode: "office",
    });
    const selected = clientReducer(office, {
      type: "select-agent",
      agentId: "meeting-notes",
    });

    expect(selected.mode).toBe("office");
    expect(selected.selectedAgentId).toBe("meeting-notes");
    expect(selected).not.toHaveProperty("workflow");
  });

  it("opens and closes a preview", () => {
    const open = clientReducer(initialClientState, {
      type: "open-preview",
      preview: "prd",
    });

    expect(open.preview).toBe("prd");
    expect(clientReducer(open, { type: "close-preview" }).preview).toBeNull();
  });

  it("adds a user message and advances deterministic execution", () => {
    const sent = clientReducer(initialClientState, {
      type: "send-message",
      text: "补充权限边界",
    });

    expect(sent.taskMessagesById["prd-role"].at(-1)?.role).toBe("user");
    expect(sent.taskExecutionsById["prd-role"]).toBe("reading");
    expect(
      clientReducer(sent, { type: "advance-execution", taskId: "prd-role" })
        .taskExecutionsById["prd-role"],
    ).toBe("analyzing");
  });

  it("opens every recent task atomically with its exact associations", () => {
    const taskAssociations = [
      ["prd-role", "customer-portal", "role-permissions", "prd-writer", "research"],
      ["permission-ui", "customer-portal", "role-permissions", "frontend-dev", "research"],
      ["login-failure", "expense", null, "backend-dev", "research"],
      ["q3-report", null, null, "data-analysis", "office"],
    ] as const;

    for (const [taskId, projectId, requirementId, agentId, mode] of taskAssociations) {
      const opened = clientReducer(initialClientState, {
        type: "open-task",
        taskId,
      });

      expect(opened).toMatchObject({
        view: "task",
        selectedTaskId: taskId,
        selectedProjectId: projectId,
        selectedRequirementId: requirementId,
        selectedAgentId: agentId,
        mode,
      });
    }
  });

  it("persists the selected Agent independently for each task", () => {
    const permissionTask = clientReducer(initialClientState, {
      type: "open-task",
      taskId: "permission-ui",
    });
    const reviewed = clientReducer(permissionTask, {
      type: "select-agent",
      agentId: "code-review",
    });
    const q3 = clientReducer(reviewed, {
      type: "open-task",
      taskId: "q3-report",
    });
    const reopened = clientReducer(q3, {
      type: "open-task",
      taskId: "permission-ui",
    });

    expect(reopened.selectedAgentId).toBe("code-review");
    expect(reopened.taskAgentIdsById["permission-ui"]).toBe("code-review");
    expect(reopened.taskAgentIdsById["q3-report"]).toBe("data-analysis");
  });

  it("attributes completion to the invocation Agent despite a mid-flight switch", () => {
    const permissionTask = clientReducer(initialClientState, {
      type: "open-task",
      taskId: "permission-ui",
    });
    const reviewed = clientReducer(permissionTask, {
      type: "select-agent",
      agentId: "code-review",
    });
    const sent = clientReducer(reviewed, {
      type: "send-message",
      text: "复核权限配置实现",
    });
    const switched = clientReducer(sent, {
      type: "select-agent",
      agentId: "frontend-dev",
    });
    const failed = clientReducer(switched, {
      type: "fail-execution",
      taskId: "permission-ui",
    });
    const analyzing = clientReducer(switched, {
      type: "advance-execution",
      taskId: "permission-ui",
    });
    const generating = clientReducer(analyzing, {
      type: "advance-execution",
      taskId: "permission-ui",
    });
    const done = clientReducer(generating, {
      type: "advance-execution",
      taskId: "permission-ui",
    });

    expect(sent.taskInvocationAgentIdsById["permission-ui"]).toBe(
      "code-review",
    );
    expect(failed.taskInvocationAgentIdsById["permission-ui"]).toBe(
      "code-review",
    );
    expect(done.taskAgentIdsById["permission-ui"]).toBe("frontend-dev");
    expect(done.taskMessagesById["permission-ui"].at(-1)?.agentId).toBe(
      "code-review",
    );
  });

  it("keeps messages and execution scoped to the selected recent task", () => {
    const selected = clientReducer(initialClientState, {
      type: "open-task",
      taskId: "q3-report",
    });
    const sent = clientReducer(selected, {
      type: "send-message",
      text: "总结本季度趋势",
    });
    const analyzing = clientReducer(sent, {
      type: "advance-execution",
      taskId: "q3-report",
    });
    const generating = clientReducer(analyzing, {
      type: "advance-execution",
      taskId: "q3-report",
    });
    const done = clientReducer(generating, {
      type: "advance-execution",
      taskId: "q3-report",
    });

    expect(done.selectedTaskId).toBe("q3-report");
    expect(done.taskMessagesById["q3-report"].at(-2)?.text).toBe(
      "总结本季度趋势",
    );
    expect(done.taskMessagesById["q3-report"].at(-1)?.text).toContain(
      "Q3 经营分析报告",
    );
    expect(done.taskMessagesById["prd-role"]).toEqual(
      initialClientState.taskMessagesById["prd-role"],
    );
    expect(done.taskExecutionsById["q3-report"]).toBe("done");
  });

  it("advances and fails only the originating task after switching tasks", () => {
    const q3 = clientReducer(initialClientState, {
      type: "open-task",
      taskId: "q3-report",
    });
    const inFlight = clientReducer(q3, {
      type: "send-message",
      text: "继续分析趋势",
    });
    const switched = clientReducer(inFlight, {
      type: "open-task",
      taskId: "prd-role",
    });
    const advanced = clientReducer(switched, {
      type: "advance-execution",
      taskId: "q3-report",
    });
    const failed = clientReducer(advanced, {
      type: "fail-execution",
      taskId: "q3-report",
    });

    expect(advanced.selectedTaskId).toBe("prd-role");
    expect(advanced.taskExecutionsById["q3-report"]).toBe("analyzing");
    expect(advanced.taskExecutionsById["prd-role"]).toBe("idle");
    expect(failed.taskExecutionsById["q3-report"]).toBe("error");
    expect(failed.taskExecutionsById["prd-role"]).toBe("idle");
  });

  it("ignores empty messages", () => {
    const next = clientReducer(initialClientState, {
      type: "send-message",
      text: "   ",
    });

    expect(next).toEqual(initialClientState);
  });

  it("selects a requirement and opens its workspace", () => {
    const next = clientReducer(initialClientState, {
      type: "select-requirement",
      requirementId: "role-permissions",
    });

    expect(next.selectedRequirementId).toBe("role-permissions");
    expect(next.view).toBe("requirement-detail");
    expect(next.selectedAgentId).toBe("prd-writer");
  });

  it("moves a requirement to any stage and records skipped-gate risk", () => {
    const next = clientReducer(initialClientState, {
      type: "set-requirement-stage",
      requirementId: "role-permissions",
      stage: "testing",
      reason: "联调窗口提前，先执行核心回归",
    });

    expect(next.requirementStages["role-permissions"]).toBe("testing");
    expect(next.stageRisks["role-permissions"]).toContain("联调窗口提前");
  });

  it("changes a project member role", () => {
    const next = clientReducer(initialClientState, {
      type: "set-member-role",
      memberId: "member-lin",
      role: "testing",
    });

    expect(next.memberRoles["member-lin"]).toBe("testing");
  });

  it("marks a development task and saves a document draft", () => {
    const working = clientReducer(initialClientState, {
      type: "set-development-task-status",
      taskId: "dev-role-panel",
      status: "in-progress",
    });
    const saved = clientReducer(working, {
      type: "set-document-draft",
      documentId: "prd-role-permissions",
      draft: "新增：批量调整成员角色时必须二次确认。",
    });

    expect(saved.developmentTaskStatuses["dev-role-panel"]).toBe("in-progress");
    expect(saved.documentDrafts["prd-role-permissions"]).toContain("二次确认");
  });

  it("restores the last Agent for a requirement", () => {
    const next = clientReducer(initialClientState, {
      type: "resume-agent-work",
      sessionId: "session-role-prd",
    });

    expect(next.view).toBe("requirement-detail");
    expect(next.selectedRequirementId).toBe("role-permissions");
    expect(next.selectedAgentId).toBe("prd-writer");
  });

  it("lets a user adjust and lock automatically selected context", () => {
    const removed = clientReducer(initialClientState, {
      type: "toggle-context-source",
      requirementId: "role-permissions",
      sourceId: "context-role-interview",
    });
    const locked = clientReducer(removed, {
      type: "toggle-context-lock",
      requirementId: "role-permissions",
      sourceId: "context-project-memory",
    });

    expect(
      removed.selectedContextIdsByRequirement["role-permissions"],
    ).not.toContain("context-role-interview");
    expect(
      locked.lockedContextIdsByRequirement["role-permissions"],
    ).toContain("context-project-memory");
  });

  it("opens a requirement with its remembered Agent", () => {
    const next = clientReducer(initialClientState, {
      type: "select-requirement",
      requirementId: "role-permissions",
    });

    expect(next.selectedAgentId).toBe("prd-writer");
  });

  it("remembers an Agent selected in a requirement workspace", () => {
    const opened = clientReducer(initialClientState, {
      type: "select-requirement",
      requirementId: "role-permissions",
    });
    const selected = clientReducer(opened, {
      type: "select-agent",
      agentId: "prototype",
    });
    const navigated = clientReducer(selected, { type: "navigate", view: "task" });
    const reopened = clientReducer(navigated, {
      type: "select-requirement",
      requirementId: "role-permissions",
    });

    expect(selected.lastAgentByRequirement["role-permissions"]).toBe("prototype");
    expect(reopened.selectedAgentId).toBe("prototype");
  });

  it("does not overwrite a remembered Agent from outside a requirement workspace", () => {
    const opened = clientReducer(initialClientState, {
      type: "select-requirement",
      requirementId: "role-permissions",
    });
    const home = clientReducer(opened, { type: "navigate", view: "home" });
    const selected = clientReducer(home, {
      type: "select-agent",
      agentId: "frontend-dev",
    });
    const reopened = clientReducer(selected, {
      type: "select-requirement",
      requirementId: "role-permissions",
    });

    expect(selected.lastAgentByRequirement["role-permissions"]).toBe("prd-writer");
    expect(reopened.selectedAgentId).toBe("prd-writer");
  });

  it("remembers the Agent from a resumed work session", () => {
    const opened = clientReducer(initialClientState, {
      type: "select-requirement",
      requirementId: "role-permissions",
    });
    const selected = clientReducer(opened, {
      type: "select-agent",
      agentId: "prototype",
    });
    const resumed = clientReducer(selected, {
      type: "resume-agent-work",
      sessionId: "session-role-prd",
    });
    const away = clientReducer(resumed, { type: "navigate", view: "task" });
    const reopened = clientReducer(away, {
      type: "select-requirement",
      requirementId: "role-permissions",
    });

    expect(resumed.lastAgentByRequirement["role-permissions"]).toBe("prd-writer");
    expect(reopened.selectedAgentId).toBe("prd-writer");
  });

  it("atomically matches a selected requirement to its project", () => {
    const fromAnotherProject = {
      ...initialClientState,
      selectedProjectId: "expense",
      selectedRequirementId: null,
    };

    const selected = clientReducer(fromAnotherProject, {
      type: "select-requirement",
      requirementId: "sso-login",
    });

    expect(selected.selectedProjectId).toBe("customer-portal");
    expect(selected.selectedRequirementId).toBe("sso-login");
  });

  it("keeps context selection and locks scoped to each requirement", () => {
    const ssoSelected = clientReducer(initialClientState, {
      type: "toggle-context-source",
      requirementId: "sso-login",
      sourceId: "context-sso-runbook",
    });
    const roleLocked = clientReducer(ssoSelected, {
      type: "toggle-context-lock",
      requirementId: "role-permissions",
      sourceId: "context-role-interview",
    });

    expect(
      ssoSelected.selectedContextIdsByRequirement["sso-login"],
    ).not.toContain("context-sso-runbook");
    expect(
      ssoSelected.selectedContextIdsByRequirement["role-permissions"],
    ).toContain("context-role-interview");
    expect(
      roleLocked.lockedContextIdsByRequirement["role-permissions"],
    ).toContain("context-role-interview");
    expect(
      roleLocked.lockedContextIdsByRequirement["sso-login"],
    ).not.toContain("context-role-interview");
  });

  it("selects a source when locking it and refuses to remove it while locked", () => {
    const removed = clientReducer(initialClientState, {
      type: "toggle-context-source",
      requirementId: "role-permissions",
      sourceId: "context-role-interview",
    });
    const locked = clientReducer(removed, {
      type: "toggle-context-lock",
      requirementId: "role-permissions",
      sourceId: "context-role-interview",
    });
    const attemptedRemoval = clientReducer(locked, {
      type: "toggle-context-source",
      requirementId: "role-permissions",
      sourceId: "context-role-interview",
    });

    expect(
      locked.selectedContextIdsByRequirement["role-permissions"],
    ).toContain("context-role-interview");
    expect(attemptedRemoval).toEqual(locked);
  });

  it("stores Agent activity inside the active requirement session", () => {
    const opened = clientReducer(initialClientState, {
      type: "select-requirement",
      requirementId: "sso-login",
    });
    const sent = clientReducer(opened, {
      type: "send-message",
      text: "总结失败用例并给出下一步",
    });

    expect(sent.view).toBe("requirement-detail");
    expect(sent.requirementExecutions["sso-login"]).toBe("done");
    expect(sent.requirementMessages["sso-login"].at(-1)?.text).toContain(
      "REQ-029",
    );
    expect(sent.requirementMessages["role-permissions"]).toEqual(
      initialClientState.requirementMessages["role-permissions"],
    );
  });

  it("rejects context mutations when the signed-in project member is a viewer", () => {
    const viewer = clientReducer(initialClientState, {
      type: "set-member-role",
      memberId: "member-chen",
      role: "viewer",
    });
    const toggled = clientReducer(viewer, {
      type: "toggle-context-source",
      requirementId: "role-permissions",
      sourceId: "context-role-interview",
    });
    const locked = clientReducer(viewer, {
      type: "toggle-context-lock",
      requirementId: "role-permissions",
      sourceId: "context-project-memory",
    });

    expect(toggled).toEqual(viewer);
    expect(locked).toEqual(viewer);
  });
});
