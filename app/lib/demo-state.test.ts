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

    expect(sent.messages.at(-1)?.role).toBe("user");
    expect(sent.execution).toBe("reading");
    expect(
      clientReducer(sent, { type: "advance-execution" }).execution,
    ).toBe("analyzing");
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
});
