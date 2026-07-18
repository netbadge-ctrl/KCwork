import type { ProjectCapabilities, ProjectRole } from "./types";

export const projectRoleLabels: Record<ProjectRole, string> = {
  admin: "项目管理员",
  product: "产品",
  development: "研发",
  testing: "测试",
  viewer: "观察者",
};

export function getProjectCapabilities(
  role: ProjectRole,
): ProjectCapabilities {
  return {
    canEditAgentWork: role !== "viewer",
    canEditProductArtifacts: role === "admin" || role === "product",
    canEditDevelopmentArtifacts:
      role === "admin" || role === "development",
    canEditTestArtifacts: role === "admin" || role === "testing",
    canManageMembers: role === "admin",
    canManageRequirements: role === "admin" || role === "product",
    canManageAssets: role !== "viewer",
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
  if (["requirement-analysis", "prd-writer", "prototype"].includes(agentId)) {
    return capabilities.canEditProductArtifacts;
  }
  if (["frontend-dev", "backend-dev", "code-review"].includes(agentId)) {
    return capabilities.canEditDevelopmentArtifacts;
  }
  if (agentId === "testing") return capabilities.canEditTestArtifacts;
  return capabilities.canEditAgentWork;
}
