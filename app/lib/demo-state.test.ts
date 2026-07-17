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
});
