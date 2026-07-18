import type {
  Agent,
  DevelopmentTaskStatus,
  PreviewKind,
  Requirement,
} from "../../lib/types";
import { CodeReviewWorkspace } from "./code-review-workspace";
import { DevelopmentWorkspace } from "./development-workspace";
import { PrdWorkspace } from "./prd-workspace";
import { PrototypeWorkspace } from "./prototype-workspace";
import { RequirementAnalysisWorkspace } from "./requirement-analysis-workspace";
import { TestingWorkspace } from "./testing-workspace";

export interface WorkspaceRouterProps {
  agent: Agent;
  requirement: Requirement;
  documentDraft: string;
  developmentTaskStatuses: Record<string, DevelopmentTaskStatus>;
  canEdit: boolean;
  onSaveDocumentDraft(draft: string): void;
  onSetDevelopmentTaskStatus(
    taskId: string,
    status: DevelopmentTaskStatus,
  ): void;
  onOpenPreview(kind: PreviewKind): void;
}

export function WorkspaceRouter(props: WorkspaceRouterProps) {
  const { agent } = props;
  if (agent.id === "requirement-analysis") return <RequirementAnalysisWorkspace {...props} />;
  if (agent.id === "prototype") return <PrototypeWorkspace {...props} />;
  if (agent.id === "prd-writer") return <PrdWorkspace {...props} />;
  if (agent.id === "frontend-dev" || agent.id === "backend-dev") return <DevelopmentWorkspace {...props} />;
  if (agent.id === "code-review") return <CodeReviewWorkspace {...props} />;
  if (agent.id === "testing") return <TestingWorkspace {...props} />;
  return <RequirementAnalysisWorkspace {...props} />;
}
