export const EXPANDED_SIDEBAR_WIDTH = 248;
export const COLLAPSED_SIDEBAR_WIDTH = 64;
export const DEFAULT_RIGHT_PANEL_WIDTH = 560;
export const MIN_RIGHT_PANEL_WIDTH = 420;
export const OVERLAY_BREAKPOINT = 1120;
export const MOBILE_BREAKPOINT = 760;
export const MOBILE_SIDEBAR_WIDTH = 68;

export function clampRightPanelWidth(width: number, viewportWidth: number) {
  return Math.min(
    Math.max(width, MIN_RIGHT_PANEL_WIDTH),
    Math.floor((viewportWidth * 7) / 10),
  );
}

export function getRightPanelMaxWidth(
  viewportWidth: number,
  sidebarWidth: number,
) {
  const seventyViewportWidth = Math.floor((viewportWidth * 7) / 10);
  return viewportWidth <= OVERLAY_BREAKPOINT
    ? Math.min(seventyViewportWidth, viewportWidth - sidebarWidth)
    : seventyViewportWidth;
}

export function clampRightPanelWidthForShell(
  width: number,
  viewportWidth: number,
  sidebarWidth: number,
) {
  return Math.min(
    clampRightPanelWidth(width, viewportWidth),
    getRightPanelMaxWidth(viewportWidth, sidebarWidth),
  );
}

export function clampPreferredRightPanelWidth(
  width: number,
  viewportWidth: number,
  sidebarWidth: number,
) {
  return viewportWidth <= MOBILE_BREAKPOINT
    ? width
    : clampRightPanelWidthForShell(width, viewportWidth, sidebarWidth);
}

export function getEffectiveRightPanelWidth(
  preferredWidth: number,
  viewportWidth: number,
  sidebarWidth: number,
) {
  return viewportWidth <= MOBILE_BREAKPOINT
    ? Math.max(0, viewportWidth - MOBILE_SIDEBAR_WIDTH)
    : clampRightPanelWidthForShell(
        preferredWidth,
        viewportWidth,
        sidebarWidth,
      );
}

export function readStoredNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function readStoredBoolean(value: string | null, fallback: boolean) {
  return value === "true" ? true : value === "false" ? false : fallback;
}
