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
    expect(next.selectedAgentId).toBe("requirement-analysis");
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
});
