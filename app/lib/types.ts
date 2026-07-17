export type Mode = "research" | "office";
export type ViewId =
  | "home"
  | "projects"
  | "project-detail"
  | "assets"
  | "task";
export type AssetKind =
  | "agent"
  | "knowledge"
  | "memory"
  | "repository"
  | "tool";
export type PreviewKind = "prd" | "diff" | "context" | "log" | "test";
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

export interface Project {
  id: string;
  name: string;
  description: string;
  members: number;
  updatedAt: string;
  contextCount: number;
  color: string;
}

export interface RecentTask {
  id: string;
  title: string;
  mode: Mode;
  projectId?: string;
  agentId: string;
  time: string;
}

export interface AssetItem {
  id: string;
  kind: AssetKind;
  name: string;
  description: string;
  status: string;
  meta: string;
}

export interface Message {
  id: string;
  role: "user" | "agent";
  agentId?: string;
  text: string;
  artifact?: PreviewKind;
}
