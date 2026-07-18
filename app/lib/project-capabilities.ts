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
  if (role === "viewer") {
    return {
      canEditAgentWork: false,
      canManageMembers: false,
      canManageRequirements: false,
      canManageAssets: false,
    };
  }

  return {
    canEditAgentWork: true,
    canManageMembers: role === "admin",
    canManageRequirements: role === "admin" || role === "product",
    canManageAssets: true,
  };
}
