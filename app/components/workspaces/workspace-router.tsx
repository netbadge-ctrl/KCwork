import type {
  Agent,
  DevelopmentTaskStatus,
  PreviewKind,
  ProductWorkMode,
  Requirement,
} from "../../lib/types";
import { DevelopmentWorkspace } from "./development-workspace";
import { ProductDesignWorkspace } from "./product-design-workspace";
import { RequirementAnalysisWorkspace } from "./requirement-analysis-workspace";
import { TestingWorkspace } from "./testing-workspace";

export interface WorkspaceRouterProps {
  agent: Agent;
  requirement: Requirement;
  documentDraft: string;
  developmentTaskStatuses: Record<string, DevelopmentTaskStatus>;
  canEdit: boolean;
  productWorkMode: ProductWorkMode;
  productModePickerVariant?: "default" | "compact" | "start";
  onProductWorkModeChange(mode: ProductWorkMode): void;
  onSaveDocumentDraft(draft: string): void;
  onSetDevelopmentTaskStatus(
    taskId: string,
    status: DevelopmentTaskStatus,
  ): void;
  onOpenPreview(kind: PreviewKind): void;
}

export function WorkspaceRouter(props: WorkspaceRouterProps) {
  const { agent } = props;
  if (agent.id === "product-design") return <ProductDesignWorkspace {...props} />;
  if (agent.id === "development") return <DevelopmentWorkspace {...props} />;
  if (agent.id === "testing") return <TestingWorkspace {...props} />;
  return <RequirementAnalysisWorkspace {...props} />;
}
