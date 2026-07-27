import { describe, expect, test } from "vitest";
import { resolveContextualTools } from "./contextual-tools";
import type { ProductWorkMode } from "./types";

const kinds = (agentId: string, mode: "office" | "research" = "research", hasExecution = true, hasTestEvidence = false, productWorkMode?: ProductWorkMode) =>
  resolveContextualTools({
    agentId,
    hasExecution,
    hasTestEvidence,
    mode,
    productWorkMode,
    view: "task",
  }).map((tool) => tool.kind);

describe("resolveContextualTools", () => {
  test("keeps office work free of development and testing tools", () => {
    expect(kinds("meeting-notes", "office")).toEqual(["context", "prd", "actions", "sources"]);
    expect(kinds("data-analysis", "office")).toEqual(["context", "chart", "analysis", "export"]);
    expect(kinds("presentation", "office")).toEqual(["outline", "slides", "context", "export"]);

    for (const agentId of ["meeting-notes", "data-analysis", "presentation"]) {
      expect(kinds(agentId, "office")).not.toContain("diff");
      expect(kinds(agentId, "office")).not.toContain("test");
    }
  });
});
