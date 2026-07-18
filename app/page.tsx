"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { AssetsView } from "./components/assets-view";
import { HomeView } from "./components/home-view";
import { NavigationGuardDialog } from "./components/navigation-guard-dialog";
import { PreviewDrawer } from "./components/preview-drawer";
import { ProjectAssetsView } from "./components/project-assets-view";
import { ProjectsView } from "./components/projects-view";
import { RequirementWorkspace } from "./components/requirement-workspace";
import { Sidebar } from "./components/sidebar";
import { TaskView } from "./components/task-view";
import {
  agents,
  agentWorkSessions,
  assetGroups,
  contextSources,
  projectMembers,
  projects,
  productDocuments,
  recentTasks,
  requirements,
} from "./lib/demo-data";
import { clientReducer, initialClientState } from "./lib/demo-state";
import { getProjectCapabilities } from "./lib/project-capabilities";
import type { ViewId } from "./lib/types";

interface PendingNavigation {
  destination: string;
  draftId: string;
  run(): void;
}

export default function Page() {
  const [state, dispatch] = useReducer(clientReducer, initialClientState);
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation | null>(null);

  useEffect(() => {
    if (["idle", "done", "error"].includes(state.execution)) return;
    const timer = window.setTimeout(
      () => dispatch({ type: "advance-execution" }),
      720,
    );
    return () => window.clearTimeout(timer);
  }, [state.execution]);

  const selectedAgent =
    agents.find((agent) => agent.id === state.selectedAgentId) ?? agents[0];
  const selectedProject = useMemo(
    () =>
      projects.find((project) => project.id === state.selectedProjectId) ??
      null,
    [state.selectedProjectId],
  );
  const selectedRequirement = useMemo(
    () =>
      requirements.find(
        (requirement) => requirement.id === state.selectedRequirementId,
      ) ?? null,
    [state.selectedRequirementId],
  );
  const selectedPrdDocument = useMemo(
    () =>
      productDocuments.find(
        (document) =>
          document.requirementId === selectedRequirement?.id &&
          document.kind === "prd",
      ) ?? null,
    [selectedRequirement],
  );
  const selectedProjectMembers = useMemo(
    () =>
      projectMembers.filter(
        (member) => member.projectId === state.selectedProjectId,
      ),
    [state.selectedProjectId],
  );
  const currentMember = selectedProjectMembers.find(
    (member) => member.name === "陈楠",
  );
  const currentRole = currentMember
    ? state.memberRoles[currentMember.id] ?? currentMember.role
    : "viewer";
  const capabilities = getProjectCapabilities(currentRole);
  const activeContextSources = useMemo(
    () =>
      contextSources.filter(
        (source) =>
          source.projectId === state.selectedProjectId &&
          (!source.requirementId ||
            source.requirementId === state.selectedRequirementId),
      ),
    [state.selectedProjectId, state.selectedRequirementId],
  );
  const activeContextSourceIds = activeContextSources.map((source) => source.id);
  const activeSelectedContextIds = state.selectedRequirementId
    ? state.selectedContextIdsByRequirement[state.selectedRequirementId] ?? []
    : [];
  const activeLockedContextIds = state.selectedRequirementId
    ? state.lockedContextIdsByRequirement[state.selectedRequirementId] ?? []
    : [];

  const requestNavigation = (
    destination: string,
    run: () => void,
  ) => {
    const draftId = selectedPrdDocument?.id;
    const hasUnconfirmedDraft =
      state.view === "requirement-detail" &&
      draftId &&
      Boolean(state.documentDrafts[draftId]);
    if (hasUnconfirmedDraft) {
      setPendingNavigation({ destination, draftId, run });
      return;
    }
    run();
  };

  const navigateFromSidebar = (view: ViewId) => {
    const labels: Record<ViewId, string> = {
      home: "新建任务",
      projects: "项目",
      "project-detail": "项目工作台",
      "project-asset": "项目资产",
      "requirement-detail": "需求工作区",
      assets: "智能资产",
      task: "任务",
    };
    requestNavigation(labels[view], () => dispatch({ type: "navigate", view }));
  };

  const openProject = (projectId: string) => {
    dispatch({ type: "select-project", projectId });
    dispatch({ type: "navigate", view: "project-detail" });
  };

  return (
    <main className={`client-shell ${state.preview ? "drawer-open" : ""}`}>
      <Sidebar
        activeView={state.view}
        recentTasks={recentTasks}
        onNavigate={navigateFromSidebar}
        onOpenTask={(task) => {
          requestNavigation(task.title, () => {
            dispatch({ type: "select-agent", agentId: task.agentId });
            dispatch({
              type: "select-project",
              projectId: task.projectId ?? null,
            });
            dispatch({ type: "navigate", view: "task" });
          });
        }}
      />

      <section className="main-stage">
        {state.view === "home" && (
          <HomeView
            mode={state.mode}
            canEdit={capabilities.canEditAgentWork}
            currentRole={currentRole}
            agents={agents}
            projects={projects}
            selectedAgentId={state.selectedAgentId}
            selectedProjectId={state.selectedProjectId}
            onModeChange={(mode) => dispatch({ type: "set-mode", mode })}
            onSelectAgent={(agentId) =>
              dispatch({ type: "select-agent", agentId })
            }
            onSelectProject={(projectId) =>
              dispatch({ type: "select-project", projectId })
            }
            onSend={(text) => dispatch({ type: "send-message", text })}
            onOpenProject={openProject}
          />
        )}

        {(state.view === "projects" || state.view === "project-detail") && (
          <ProjectsView
            agents={agents}
            contextSources={contextSources}
            lastAgentByRequirement={state.lastAgentByRequirement}
            onOpenContext={() => dispatch({ type: "open-preview", preview: "sources" })}
            onOpenRequirement={(requirementId) =>
              dispatch({ type: "select-requirement", requirementId })
            }
            onOpenSettings={() => dispatch({ type: "open-preview", preview: "project-settings" })}
            onResumeSession={(sessionId) =>
              dispatch({ type: "resume-agent-work", sessionId })
            }
            projects={projects}
            requirementStages={state.requirementStages}
            requirements={requirements}
            selectedContextIds={activeSelectedContextIds}
            selectedProjectId={
              state.view === "project-detail" ? state.selectedProjectId : null
            }
            sessions={agentWorkSessions}
            onCreateRequirement={() =>
              dispatch({ type: "navigate", view: "home" })
            }
            onOpenProject={openProject}
            onBack={() => dispatch({ type: "navigate", view: "projects" })}
          />
        )}

        {state.view === "project-asset" && state.projectSection !== "overview" && (
          <ProjectAssetsView
            documents={productDocuments.filter(
              (document) => document.projectId === state.selectedProjectId,
            )}
            onBack={() =>
              dispatch({ type: "select-project-section", section: "overview" })
            }
            onOpenPreview={(assetId, preview) => {
              dispatch({ type: "select-project-asset", assetId });
              dispatch({ type: "open-preview", preview });
            }}
            requirements={requirements.filter(
              (requirement) => requirement.projectId === state.selectedProjectId,
            )}
            section={state.projectSection}
          />
        )}

        {state.view === "requirement-detail" && selectedRequirement && selectedProject && (
          <RequirementWorkspace
            agent={selectedAgent}
            agents={agents}
            currentStage={
              state.requirementStages[selectedRequirement.id] ?? selectedRequirement.stage
            }
            canEdit={capabilities.canEditAgentWork}
            currentRole={currentRole}
            documentDraft={selectedPrdDocument
              ? state.documentDrafts[selectedPrdDocument.id] ?? ""
              : ""}
            developmentTaskStatuses={state.developmentTaskStatuses}
            execution={state.requirementExecutions[selectedRequirement.id] ?? "idle"}
            messages={state.requirementMessages[selectedRequirement.id] ?? []}
            onBack={() =>
              requestNavigation(selectedProject.name, () =>
                dispatch({ type: "navigate", view: "project-detail" }),
              )
            }
            onOpenContext={() =>
              dispatch({ type: "open-preview", preview: "sources" })
            }
            onOpenPreview={(preview) =>
              dispatch({ type: "open-preview", preview })
            }
            onOpenSettings={() =>
              dispatch({ type: "open-preview", preview: "project-settings" })
            }
            onSelectAgent={(agentId) => {
              if (agentId === state.selectedAgentId) return;
              const nextAgent = agents.find((agent) => agent.id === agentId);
              requestNavigation(nextAgent?.name ?? "其他 Agent", () =>
                dispatch({ type: "select-agent", agentId }),
              );
            }}
            onSend={(text) => dispatch({ type: "send-message", text })}
            onSaveDocumentDraft={(draft) =>
              selectedPrdDocument &&
              dispatch({
                type: "set-document-draft",
                documentId: selectedPrdDocument.id,
                draft,
              })
            }
            onSetDevelopmentTaskStatus={(taskId, status) =>
              dispatch({ type: "set-development-task-status", taskId, status })
            }
            project={selectedProject}
            projects={projects}
            requirement={selectedRequirement}
            selectedContextCount={activeSelectedContextIds.length}
            selectedProjectId={state.selectedProjectId}
          />
        )}

        {state.view === "assets" && (
          <AssetsView agents={agents} assets={assetGroups} />
        )}

        {state.view === "task" && (
          <TaskView
            messages={state.messages}
            execution={state.execution}
            agent={selectedAgent}
            project={selectedProject}
            agents={agents}
            projects={projects}
            selectedProjectId={state.selectedProjectId}
            canEdit={capabilities.canEditAgentWork}
            currentRole={currentRole}
            onSelectAgent={(agentId) =>
              dispatch({ type: "select-agent", agentId })
            }
            onSelectProject={(projectId) =>
              dispatch({ type: "select-project", projectId })
            }
            onSend={(text) => dispatch({ type: "send-message", text })}
            onOpenPreview={(preview) =>
              dispatch({ type: "open-preview", preview })
            }
          />
        )}
      </section>

      <PreviewDrawer
        capabilities={capabilities}
        currentRole={currentRole}
        lockedContextIds={activeLockedContextIds.filter((id) =>
          activeContextSourceIds.includes(id),
        )}
        memberRoles={state.memberRoles}
        members={selectedProjectMembers}
        onChangeMemberRole={(memberId, role) =>
          dispatch({ type: "set-member-role", memberId, role })
        }
        onSetRequirementStage={(requirementId, stage) =>
          dispatch({
            type: "set-requirement-stage",
            requirementId,
            stage,
            reason: "从项目设置调整",
          })
        }
        onOpenAsset={(section) => {
          dispatch({ type: "close-preview" });
          dispatch({ type: "select-project-section", section });
        }}
        onToggleContextLock={(sourceId) =>
          state.selectedRequirementId &&
          dispatch({
            type: "toggle-context-lock",
            requirementId: state.selectedRequirementId,
            sourceId,
          })
        }
        onToggleContextSource={(sourceId) =>
          state.selectedRequirementId &&
          dispatch({
            type: "toggle-context-source",
            requirementId: state.selectedRequirementId,
            sourceId,
          })
        }
        preview={state.preview}
        requirementStages={state.requirementStages}
        requirements={requirements.filter(
          (requirement) => requirement.projectId === state.selectedProjectId,
        )}
        selectedContextIds={activeSelectedContextIds.filter((id) =>
          activeContextSourceIds.includes(id),
        )}
        selectedRequirement={selectedRequirement}
        selectedAssetId={state.selectedAssetId}
        onSelect={(preview) => dispatch({ type: "open-preview", preview })}
        onClose={() => dispatch({ type: "close-preview" })}
        sources={activeContextSources}
      />
      {pendingNavigation && (
        <NavigationGuardDialog
          destination={pendingNavigation.destination}
          onDiscard={() => {
            dispatch({
              type: "set-document-draft",
              documentId: pendingNavigation.draftId,
              draft: "",
            });
            const run = pendingNavigation.run;
            setPendingNavigation(null);
            run();
          }}
          onRetain={() => {
            const run = pendingNavigation.run;
            setPendingNavigation(null);
            run();
          }}
          onReturn={() => setPendingNavigation(null)}
        />
      )}
    </main>
  );
}
