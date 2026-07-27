import { describe, expect, test } from "vitest";
import {
  clampRightPanelWidth,
  clampRightPanelWidthForShell,
  DEFAULT_RIGHT_PANEL_WIDTH,
  COLLAPSED_SIDEBAR_WIDTH,
  EXPANDED_SIDEBAR_WIDTH,
  MIN_MAIN_STAGE_WIDTH,
  MIN_RIGHT_PANEL_WIDTH,
  readStoredBoolean,
  readStoredNumber,
  getRightPanelMaxWidth,
} from "./layout-preferences";

describe("layout preferences", () => {
  test("clamps the drawer between 420px and 70vw", () => {
    expect(DEFAULT_RIGHT_PANEL_WIDTH).toBe(560);
    expect(MIN_RIGHT_PANEL_WIDTH).toBe(420);
    expect(clampRightPanelWidth(300, 1400)).toBe(420);
    expect(clampRightPanelWidth(1200, 1400)).toBe(980);
    expect(clampRightPanelWidth(620, 1400)).toBe(620);
  });

  test("reads valid stored layout preferences with safe fallbacks", () => {
    expect(readStoredNumber("640", DEFAULT_RIGHT_PANEL_WIDTH)).toBe(640);
    expect(readStoredNumber("not-a-number", DEFAULT_RIGHT_PANEL_WIDTH)).toBe(
      DEFAULT_RIGHT_PANEL_WIDTH,
    );
    expect(readStoredNumber("0", DEFAULT_RIGHT_PANEL_WIDTH)).toBe(
      DEFAULT_RIGHT_PANEL_WIDTH,
    );
    expect(readStoredBoolean("true", false)).toBe(true);
    expect(readStoredBoolean("false", true)).toBe(false);
    expect(readStoredBoolean("invalid", true)).toBe(true);
  });

  test("constrains an overlay panel to the space beside the sidebar", () => {
    expect(getRightPanelMaxWidth(800, 248)).toBe(552);
    expect(clampRightPanelWidthForShell(560, 800, 248)).toBe(552);
    expect(getRightPanelMaxWidth(800, 64)).toBe(560);
    expect(getRightPanelMaxWidth(1400, 248)).toBe(732);
  });

  test("preserves a 420px main stage in inline desktop layout", () => {
    expect(MIN_MAIN_STAGE_WIDTH).toBe(420);
    expect(getRightPanelMaxWidth(1121, EXPANDED_SIDEBAR_WIDTH)).toBe(453);
    expect(getRightPanelMaxWidth(1121, COLLAPSED_SIDEBAR_WIDTH)).toBe(637);
    expect(getRightPanelMaxWidth(1440, EXPANDED_SIDEBAR_WIDTH)).toBe(772);
    expect(getRightPanelMaxWidth(1440, COLLAPSED_SIDEBAR_WIDTH)).toBe(956);
  });
});
