import { render } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { projectMembers, requirements } from "../lib/demo-data";
import { PreviewDrawer } from "./preview-drawer";

const storedValues = new Map<string, string>();
Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: {
    clear: () => storedValues.clear(),
    getItem: (key: string) => storedValues.get(key) ?? null,
    key: (index: number) => [...storedValues.keys()][index] ?? null,
    get length() {
      return storedValues.size;
    },
    removeItem: (key: string) => storedValues.delete(key),
    setItem: (key: string, value: string) => storedValues.set(key, value),
  } satisfies Storage,
});

const capabilities = {
  canEditAgentWork: true,
  canEditProductArtifacts: true,
  canEditDevelopmentArtifacts: true,
  canEditTestArtifacts: true,
  canManageMembers: true,
  canManageRequirements: true,
  canManageAssets: true,
};

test("bypasses contextual compatibility only for the explicitly selected preview kind", () => {
  const onClose = vi.fn();
  const props = {
    capabilities,
    currentRole: "admin" as const,
    explicitPreviewKind: "prd" as const,
    lockedContextIds: [],
    memberRoles: {},
    members: projectMembers,
    onChangeMemberRole: vi.fn(),
    onClose,
    onOpenAsset: vi.fn(),
    onSelect: vi.fn(),
    onSetRequirementStage: vi.fn(),
    onToggleContextLock: vi.fn(),
    onToggleContextSource: vi.fn(),
    onWidthChange: vi.fn(),
    preview: "prd" as const,
    requirementStages: {},
    requirements,
    selectedAssetId: "prd-role-permissions",
    selectedContextIds: [],
    selectedRequirement: requirements[0],
    sidebarWidth: 248,
    sources: [],
    tools: [],
    width: 560,
  };
  const drawer = render(<PreviewDrawer {...props} />);

  expect(onClose).not.toHaveBeenCalled();

  drawer.rerender(
    <PreviewDrawer {...props} preview="prototype" />,
  );
  expect(onClose).toHaveBeenCalledTimes(1);
});
