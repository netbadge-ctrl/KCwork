import { describe, expect, it } from "vitest";
import {
  canEditAgentWorkspace,
  getProjectCapabilities,
} from "./project-capabilities";

describe("canEditAgentWorkspace", () => {
  it("restricts the unified product design Agent to product artifact editors", () => {
    expect(
      canEditAgentWorkspace(
        getProjectCapabilities("product"),
        "product-design",
      ),
    ).toBe(true);
    expect(
      canEditAgentWorkspace(
        getProjectCapabilities("development"),
        "product-design",
      ),
    ).toBe(false);
    expect(
      canEditAgentWorkspace(
        getProjectCapabilities("testing"),
        "product-design",
      ),
    ).toBe(false);
  });
});
