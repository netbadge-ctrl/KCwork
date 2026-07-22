import { useReducer } from "react";
import { createInitialProductPackage, productPackageReducer } from "../lib/product-package";

export function useProductPackageSession(requirementId: string) {
  const [state, dispatch] = useReducer(
    productPackageReducer,
    requirementId,
    createInitialProductPackage,
  );
  return { state, dispatch };
}
