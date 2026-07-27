import { describe, expect, test } from "vitest";
import { getProjectInvestment, getRequirementInvestment } from "./investment-data";

describe("investment-data", () => {
  test("requirement totals equal the sum of its participants", () => {
    const inv = getRequirementInvestment("role-permissions");
    expect(inv.totalToken).toBe(
      inv.participants.reduce((sum, p) => sum + p.token, 0),
    );
    expect(inv.totalMinutes).toBe(
      inv.participants.reduce((sum, p) => sum + p.minutes, 0),
    );
    expect(inv.totalConversations).toBe(
      inv.participants.reduce((sum, p) => sum + p.conversations, 0),
    );
  });

  test("the digital human is a participant and flagged digital", () => {
    const inv = getRequirementInvestment("role-permissions");
    const digital = inv.participants.find((p) => p.participantId === "member-digital-portal");
    expect(digital).toBeDefined();
    expect(digital?.digital).toBe(true);
    expect(digital?.name).toBe("数字人");
  });

  test("project totals equal the sum of its requirements, participants aggregated", () => {
    const project = getProjectInvestment("customer-portal");
    const requirementsTotal = project.requirements.reduce(
      (sum, r) => sum + r.totalToken,
      0,
    );
    expect(project.totalToken).toBe(requirementsTotal);

    // 数字人 appears once with the sum of its token across all requirements
    const digital = project.participants.find(
      (p) => p.participantId === "member-digital-portal",
    );
    expect(digital).toBeDefined();
    expect(digital?.token).toBe(312000 + 205000 + 138000);
  });

  test("an unknown requirement yields an empty investment with zero totals", () => {
    const inv = getRequirementInvestment("does-not-exist");
    expect(inv.participants).toEqual([]);
    expect(inv.totalToken).toBe(0);
  });
});
