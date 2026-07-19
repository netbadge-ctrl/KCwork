"use client";

import { useEffect, useState } from "react";
import { getProjectCapabilities } from "./project-capabilities";
import type { ProjectRole } from "./types";

interface StoredProjectCapability {
  projectId: string;
  role: ProjectRole;
  canEditProductArtifacts: boolean;
}

const PROJECT_CAPABILITY_STORAGE_PREFIX = "kflow.projectCapability.";
const PROJECT_CAPABILITY_EVENT = "kflow:project-capability";
const projectRoles = new Set<ProjectRole>([
  "admin",
  "product",
  "development",
  "testing",
  "viewer",
]);

function storageKey(projectId: string) {
  return `${PROJECT_CAPABILITY_STORAGE_PREFIX}${projectId}`;
}

function readCapability(projectId: string, value?: string | null) {
  if (typeof window === "undefined" || !window.localStorage) return false;
  const storedValue =
    value === undefined
      ? window.localStorage.getItem(storageKey(projectId))
      : value;
  if (!storedValue) return false;
  try {
    const stored = JSON.parse(storedValue) as StoredProjectCapability;
    if (
      stored.projectId !== projectId ||
      !projectRoles.has(stored.role) ||
      typeof stored.canEditProductArtifacts !== "boolean"
    ) {
      return false;
    }
    const roleCapability =
      getProjectCapabilities(stored.role).canEditProductArtifacts;
    return stored.canEditProductArtifacts === roleCapability
      ? roleCapability
      : false;
  } catch {
    return false;
  }
}

export function publishProjectCapability(
  projectId: string,
  role: ProjectRole,
  canEditProductArtifacts: boolean,
) {
  if (typeof window === "undefined" || !window.localStorage) return;
  const value = JSON.stringify({ projectId, role, canEditProductArtifacts });
  window.localStorage.setItem(storageKey(projectId), value);
  window.dispatchEvent(
    new CustomEvent(PROJECT_CAPABILITY_EVENT, {
      detail: { projectId, value },
    }),
  );
}

export function useProjectProductCapability(projectId: string) {
  const [snapshot, setSnapshot] = useState(() => ({
    projectId,
    canEdit: readCapability(projectId),
  }));
  const canEdit =
    snapshot.projectId === projectId
      ? snapshot.canEdit
      : readCapability(projectId);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey(projectId)) {
        setSnapshot({
          projectId,
          canEdit: readCapability(projectId, event.newValue),
        });
      }
    };
    const handleLocalUpdate = (event: Event) => {
      const detail = (
        event as CustomEvent<{ projectId: string; value: string }>
      ).detail;
      if (detail.projectId === projectId) {
        setSnapshot({
          projectId,
          canEdit: readCapability(projectId, detail.value),
        });
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener(PROJECT_CAPABILITY_EVENT, handleLocalUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(PROJECT_CAPABILITY_EVENT, handleLocalUpdate);
    };
  }, [projectId]);

  return canEdit;
}
