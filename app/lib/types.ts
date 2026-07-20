export type Mode = "research" | "office";
export type ProductWorkMode = "analysis" | "prototype" | "prd";
export type ViewId =
  | "home"
  | "projects"
  | "project-detail"
  | "project-asset"
  | "requirement-detail"
  | "assets"
  | "profile"
  | "task";
export type AssetKind =
  | "agent"
  | "skill"
  | "plugin"
  | "knowledge"
  | "memory"
  | "repository"
  | "tool";
export type PreviewKind =
  | "prd"
  | "prototype"
  | "pdf"
  | "diff"
  | "context"
  | "log"
  | "test"
  | "members"
  | "asset"
  | "sources"
  | "project-settings"
  | "requirement-governance"
  | "context-maintenance"
  | "create-system"
  | "actions"
  | "chart"
  | "slides"
  | "outline"
  | "export"
  | "analysis"
  | "questions"
  | "components"
  | "interaction"
  | "files"
  | "issues"
  | "failures";
export type ExecutionState =
  | "idle"
  | "reading"
  | "analyzing"
  | "generating"
  | "done"
  | "error";

export interface Agent {
  id: string;
  name: string;
  shortName: string;
  mode: Mode | "both";
  description: string;
  category: string;
}

export type ContextSourceKind =
  | "requirement"
  | "document"
  | "prototype"
  | "memory"
  | "repository"
  | "test";

export type ContextSourceStatus = "available" | "syncing" | "unavailable";

export interface AgentWorkSession {
  id: string;
  projectId: string;
  requirementId: string;
  agentId: string;
  productWorkMode?: ProductWorkMode;
  title: string;
  summary: string;
  pendingAction: string;
  updatedAt: string;
}

export interface ContextSource {
  id: string;
  projectId: string;
  requirementId?: string;
  kind: ContextSourceKind;
  name: string;
  detail: string;
  status: ContextSourceStatus;
  autoSelected: boolean;
}

export interface Project {
  id: string;
  name: string;
  systemCode?: string;
  description: string;
  members: number;
  updatedAt: string;
  contextCount: number;
  color: string;
  repositories?: string[];
  requirementSource?: string;
  historicalRequirementCount?: number;
  testSuite?: string;
  testCaseCount?: number;
  contextAssets?: string[];
}

export interface RecentTask {
  id: string;
  title: string;
  mode: Mode;
  projectId?: string;
  requirementId?: string;
  agentId: string;
  productWorkMode?: ProductWorkMode;
  time: string;
}

export interface AssetItem {
  id: string;
  kind: AssetKind;
  name: string;
  description: string;
  status: string;
  meta: string;
  scope?: "个人 Skill" | "团队 Skill" | "系统 Skill";
  trigger?: string;
  capabilities?: string[];
  enabled?: boolean;
}

export interface Message {
  id: string;
  role: "user" | "agent";
  agentId?: string;
  text: string;
  artifact?: PreviewKind;
  artifactTitle?: string;
  artifactMeta?: string;
}

export type RequirementStage =
  | "clarifying"
  | "designing"
  | "ready-for-dev"
  | "developing"
  | "ready-for-test"
  | "testing"
  | "ready-for-release"
  | "done";

export type ReviewGateStatus =
  | "pending"
  | "approved"
  | "objected"
  | "skipped";
export type ProjectRole =
  | "admin"
  | "product"
  | "development"
  | "testing"
  | "viewer";

export interface ProjectCapabilities {
  canEditAgentWork: boolean;
  canEditProductArtifacts: boolean;
  canEditDevelopmentArtifacts: boolean;
  canEditTestArtifacts: boolean;
  canManageMembers: boolean;
  canManageRequirements: boolean;
  canManageAssets: boolean;
}
export type DeliverableStatus =
  | "draft"
  | "reviewing"
  | "confirmed"
  | "changed";
export type DevelopmentTaskStatus =
  | "not-started"
  | "in-progress"
  | "done"
  | "blocked";
export type ProjectSection =
  | "overview"
  | "documents"
  | "memory"
  | "repositories"
  | "tests";

export interface ProjectMember {
  id: string;
  projectId: string;
  name: string;
  initials: string;
  role: ProjectRole;
  team: string;
}

export interface Requirement {
  id: string;
  projectId: string;
  code: string;
  title: string;
  summary: string;
  stage: RequirementStage;
  gateStatus: ReviewGateStatus;
  gateLabel: string;
  specVersion: string;
  specCompletion: number;
  owners: { product: string; development: string; testing: string };
  counts: {
    prototypes: number;
    documents: number;
    tasks: number;
    changes: number;
    tests: number;
  };
  updatedAt: string;
}

export interface ProjectAssetSummary {
  section: Exclude<ProjectSection, "overview">;
  label: string;
  value: string;
  note: string;
  updatedAt: string;
}

export interface ProductDocument {
  id: string;
  projectId: string;
  requirementId: string;
  title: string;
  kind: "prd" | "prototype";
  status: DeliverableStatus;
  version: string;
  updatedAt: string;
}

export interface DevelopmentTask {
  id: string;
  requirementId: string;
  title: string;
  status: DevelopmentTaskStatus;
  specRef: string;
  repository: string;
  files: number;
}

export interface CodeChange {
  id: string;
  requirementId: string;
  taskId: string;
  file: string;
  additions: number;
  deletions: number;
  rationale: string;
}

export interface TestCase {
  id: string;
  requirementId: string;
  title: string;
  type: "manual" | "automated";
  status: "pending" | "passed" | "failed";
  specRef: string;
}

export interface TestReport {
  id: string;
  requirementId: string;
  title: string;
  passRate: number;
  passed: number;
  failed: number;
  skipped: number;
}
