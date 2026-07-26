import type { ProjectCapabilities, ProjectRole } from "./types";

export const projectRoleLabels: Record<ProjectRole, string> = {
  product: "产品",
  development: "研发",
  testing: "测试",
  viewer: "观察者",
};

export function getProjectCapabilities(
  roles: ProjectRole[],
): ProjectCapabilities {
  return {
    canEditAgentWork: !roles.includes("viewer"),
    canEditProductArtifacts: roles.includes("product"),
    canEditDevelopmentArtifacts: roles.includes("development"),
    canEditTestArtifacts: roles.includes("testing"),
    canManageMembers: !roles.includes("viewer"),
    canManageRequirements: roles.includes("product"),
    canManageAssets: !roles.includes("viewer"),
  };
}

export const unscopedCapabilities: ProjectCapabilities = {
  canEditAgentWork: true,
  canEditProductArtifacts: true,
  canEditDevelopmentArtifacts: true,
  canEditTestArtifacts: true,
  canManageMembers: false,
  canManageRequirements: false,
  canManageAssets: false,
};

export function canEditAgentWorkspace(
  capabilities: ProjectCapabilities,
  agentId: string,
) {
  if (agentId === "product-design") {
    return capabilities.canEditProductArtifacts;
  }
  if (agentId === "development") {
    return capabilities.canEditDevelopmentArtifacts;
  }
  if (agentId === "testing") return capabilities.canEditTestArtifacts;
  return capabilities.canEditAgentWork;
}
