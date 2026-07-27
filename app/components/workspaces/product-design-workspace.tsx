import { ProductModePicker } from "../product-mode-picker";
import { PrdWorkspace } from "./prd-workspace";
import { PrototypeWorkspace } from "./prototype-workspace";
import { RequirementAnalysisWorkspace } from "./requirement-analysis-workspace";
import type { WorkspaceRouterProps } from "./workspace-router";

export function ProductDesignWorkspace(props: WorkspaceRouterProps) {
  return (
    <>
      <ProductModePicker
        onChange={props.onProductWorkModeChange}
        value={props.productWorkMode}
        variant={props.productModePickerVariant}
      />
      {props.productWorkMode === "analysis" && <RequirementAnalysisWorkspace {...props} />}
      {props.productWorkMode === "prototype" && <PrototypeWorkspace {...props} />}
      {props.productWorkMode === "prd" && <PrdWorkspace {...props} />}
    </>
  );
}
