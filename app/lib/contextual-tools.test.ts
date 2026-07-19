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

  test("maps product, development, review, and test Agents to their own evidence", () => {
    expect(kinds("product-design", "research", true, false, "analysis"))
      .toEqual(["context", "analysis", "questions", "log"]);
    expect(kinds("product-design", "research", true, false, "prototype"))
      .toEqual(["prototype", "components", "interaction", "context"]);
    expect(kinds("product-design", "research", true, false, "prd"))
      .toEqual(["prd", "pdf", "analysis", "context"]);
    expect(kinds("frontend-dev")).toEqual(["files", "diff", "log", "context"]);
    expect(kinds("backend-dev")).toEqual(["files", "diff", "log", "context"]);
    expect(kinds("code-review")).toEqual(["diff", "issues", "analysis", "context"]);
    expect(kinds("testing", "research", true, true)).toEqual(["test", "failures", "log", "context"]);
  });

  test("hides execution-only entries until evidence exists and caps the rail at four", () => {
    for (const legacyId of ["requirement-analysis", "prototype", "prd-writer"]) {
      expect(kinds(legacyId, "research", false)).toEqual(["context", "analysis"]);
    }
    expect(kinds("testing", "research", false, false)).toEqual(["test", "failures", "context"]);
    expect(kinds("frontend-dev").length).toBeLessThanOrEqual(4);
  });
});
