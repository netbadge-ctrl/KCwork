import { useReducer } from "react";
import { createInitialRequirementBaseline, requirementBaselineReducer } from "../lib/requirement-baseline";

export function useRequirementBaselineSession(requirementId: string) {
  const [state, dispatch] = useReducer(requirementBaselineReducer, requirementId, createInitialRequirementBaseline);
  return { state, dispatch };
}
