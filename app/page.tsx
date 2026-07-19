"use client";

import { useEffect, useMemo, useReducer, useState, type CSSProperties } from "react";
import { AssetsView } from "./components/assets-view";
import { HomeView } from "./components/home-view";
import { NavigationGuardDialog } from "./components/navigation-guard-dialog";
import { PreviewDrawer } from "./components/preview-drawer";
import { ProfileView } from "./components/profile-view";
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
import { resolveContextualTools } from "./lib/contextual-tools";
import {
  canEditAgentWorkspace,
  getProjectCapabilities,
  unscopedCapabilities,
} from "./lib/project-capabilities";
import { publishProjectCapability } from "./lib/project-capability-store";
import {
  discardPrototypeDraft,
  usePrototypeDocumentStatus,
} from "./lib/prototype-state";
import type { PreviewKind, ProjectSection, ViewId } from "./lib/types";
import {
  clampPreferredRightPanelWidth,
  COLLAPSED_SIDEBAR_WIDTH,
  DEFAULT_RIGHT_PANEL_WIDTH,
  EXPANDED_SIDEBAR_WIDTH,
  readStoredBoolean,
  readStoredNumber,
} from "./lib/layout-preferences";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "kflow.sidebar.collapsed";
const RIGHT_PANEL_WIDTH_STORAGE_KEY = "kflow.rightPanel.width";

interface LayoutPreferencesState {
  hydrated: boolean;
  isSidebarCollapsed: boolean;
  rightPanelWidth: number;
}

type LayoutPreferencesAction =
  | {
      type: "hydrate";
      isSidebarCollapsed: boolean;
      rightPanelWidth: number;
    }
  | { type: "toggle-sidebar"; viewportWidth: number }
  | { type: "set-right-panel-width"; width: number };

const initialLayoutPreferences: LayoutPreferencesState = {
  hydrated: false,
  isSidebarCollapsed: false,
  rightPanelWidth: DEFAULT_RIGHT_PANEL_WIDTH,
};

function layoutPreferencesReducer(
  state: LayoutPreferencesState,
  action: LayoutPreferencesAction,
): LayoutPreferencesState {
  switch (action.type) {
    case "hydrate":
      return {
        hydrated: true,
        isSidebarCollapsed: action.isSidebarCollapsed,
        rightPanelWidth: action.rightPanelWidth,
      };
    case "toggle-sidebar": {
      const isSidebarCollapsed = !state.isSidebarCollapsed;
      return {
        ...state,
        isSidebarCollapsed,
        rightPanelWidth: clampPreferredRightPanelWidth(
          state.rightPanelWidth,
          action.viewportWidth,
          isSidebarCollapsed
            ? COLLAPSED_SIDEBAR_WIDTH
            : EXPANDED_SIDEBAR_WIDTH,
        ),
      };
    }
    case "set-right-panel-width":
      return { ...state, rightPanelWidth: action.width };
  }
}

interface PendingNavigation {
  destination: string;
  kind: "prd" | "prototype" | "combined";
  discard(): void;
  run(): void;
}

export default function Page() {
  const [state, dispatch] = useReducer(clientReducer, initialClientState);
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation | null>(null);
  const [layoutPreferences, dispatchLayoutPreferences] = useReducer(
    layoutPreferencesReducer,
    initialLayoutPreferences,
  );
  const selectedTaskExecution =
    state.taskExecutionsById[state.selectedTaskId] ?? "idle";

  useEffect(() => {
    const isSidebarCollapsed = readStoredBoolean(
      window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY),
      false,
    );
    dispatchLayoutPreferences({
      type: "hydrate",
      isSidebarCollapsed,
      rightPanelWidth: clampPreferredRightPanelWidth(
        readStoredNumber(
          window.localStorage.getItem(RIGHT_PANEL_WIDTH_STORAGE_KEY),
          DEFAULT_RIGHT_PANEL_WIDTH,
        ),
        window.innerWidth,
        isSidebarCollapsed
          ? COLLAPSED_SIDEBAR_WIDTH
          : EXPANDED_SIDEBAR_WIDTH,
      ),
    });
  }, []);

  useEffect(() => {
    if (!layoutPreferences.hydrated) return;
    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
      String(layoutPreferences.isSidebarCollapsed),
    );
  }, [layoutPreferences.hydrated, layoutPreferences.isSidebarCollapsed]);

  useEffect(() => {
    if (!layoutPreferences.hydrated) return;
    window.localStorage.setItem(
      RIGHT_PANEL_WIDTH_STORAGE_KEY,
      String(layoutPreferences.rightPanelWidth),
    );
  }, [layoutPreferences.hydrated, layoutPreferences.rightPanelWidth]);

  useEffect(() => {
    const clampToViewport = () =>
      dispatchLayoutPreferences({
        type: "set-right-panel-width",
        width: clampPreferredRightPanelWidth(
          layoutPreferences.rightPanelWidth,
          window.innerWidth,
          layoutPreferences.isSidebarCollapsed
            ? COLLAPSED_SIDEBAR_WIDTH
            : EXPANDED_SIDEBAR_WIDTH,
        ),
      });
    window.addEventListener("resize", clampToViewport);
    return () => window.removeEventListener("resize", clampToViewport);
  }, [
    layoutPreferences.isSidebarCollapsed,
    layoutPreferences.rightPanelWidth,
  ]);

  useEffect(() => {
    if (["idle", "done", "error"].includes(selectedTaskExecution)) return;
    const taskId = state.selectedTaskId;
    const timer = window.setTimeout(
      () => dispatch({ type: "advance-execution", taskId }),
      720,
    );
    return () => window.clearTimeout(timer);
  }, [selectedTaskExecution, state.selectedTaskId]);

  const selectedAgent =
    agents.find((agent) => agent.id === state.selectedAgentId) ?? agents[0];
  const selectedTask =
    recentTasks.find((task) => task.id === state.selectedTaskId) ??
    recentTasks[0];
  const taskExecutionAgentId =
    state.taskInvocationAgentIdsById[selectedTask.id] ??
    state.taskAgentIdsById[selectedTask.id] ??
    selectedTask.agentId;
  const taskExecutionAgent =
    agents.find((agent) => agent.id === taskExecutionAgentId) ?? selectedAgent;
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
  const capabilities = selectedProject
    ? getProjectCapabilities(currentRole)
    : unscopedCapabilities;
  const prototypeStatus = usePrototypeDocumentStatus(
    selectedRequirement?.id ?? null,
  );

  useEffect(() => {
    if (!selectedProject) return;
    publishProjectCapability(
      selectedProject.id,
      currentRole,
      capabilities.canEditProductArtifacts,
    );
  }, [
    capabilities.canEditProductArtifacts,
    currentRole,
    selectedProject,
  ]);
  const canEditSelectedWorkspace = canEditAgentWorkspace(
    capabilities,
    selectedAgent.id,
  );
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
  const activeExecution = selectedRequirement
    ? state.requirementExecutions[selectedRequirement.id] ?? "idle"
    : selectedTaskExecution;
  const contextualTools = resolveContextualTools({
    agentId: selectedAgent.id,
    hasExecution: activeExecution !== "idle",
    hasTestEvidence: Boolean(selectedRequirement?.counts.tests),
    mode: selectedAgent.mode === "office" ? "office" : "research",
    productWorkMode: state.productWorkMode,
    view: state.view,
  });

  const requestNavigation = (
    destination: string,
    run: () => void,
    options: { includePrd?: boolean; includePrototype?: boolean } = {},
  ) => {
    const { includePrd = true, includePrototype = true } = options;
    const draftId = selectedPrdDocument?.id;
    const hasUnconfirmedDraft =
      includePrd &&
      draftId &&
      Boolean(state.documentDrafts[draftId]);
    const hasUnconfirmedPrototype =
      includePrototype &&
      selectedRequirement &&
      prototypeStatus.pending;
    if (hasUnconfirmedDraft || hasUnconfirmedPrototype) {
      const kind = hasUnconfirmedDraft && hasUnconfirmedPrototype
        ? "combined"
        : hasUnconfirmedPrototype
          ? "prototype"
          : "prd";
      setPendingNavigation({
        destination,
        kind,
        discard: () => {
          if (hasUnconfirmedDraft && draftId) {
            dispatch({
              type: "set-document-draft",
              documentId: draftId,
              draft: "",
            });
          }
          if (hasUnconfirmedPrototype && selectedRequirement) {
            discardPrototypeDraft(selectedRequirement.id);
          }
        },
        run,
      });
      return;
    }
    run();
  };

  const openPreview = (preview: PreviewKind) => {
    const run = () => dispatch({ type: "open-preview", preview });
    if (state.preview === "prototype" && preview !== "prototype") {
      requestNavigation("其他辅助内容", run, { includePrd: false });
    } else run();
  };

  const navigateFromSidebar = (view: ViewId) => {
    const labels: Record<ViewId, string> = {
      home: "新建任务",
      projects: "项目",
      "project-detail": "项目工作台",
      "project-asset": "项目资产",
      "requirement-detail": "需求工作区",
      assets: "智能资产",
      profile: "个人设置",
      task: "任务",
    };
    requestNavigation(labels[view], () => dispatch({ type: "navigate", view }));
  };

  const openProject = (projectId: string) => {
    const run = () => {
      dispatch({ type: "select-project", projectId });
      dispatch({ type: "navigate", view: "project-detail" });
    };
    if (projectId === state.selectedProjectId) run();
    else requestNavigation("项目工作台", run);
  };

  const selectProject = (projectId: string | null) => {
    const run = () => dispatch({ type: "select-project", projectId });
    if (projectId === state.selectedProjectId) run();
    else {
      const destination =
        projects.find((project) => project.id === projectId)?.name ??
        "未关联项目";
      requestNavigation(destination, run);
    }
  };

  return (
    <main
      className={`client-shell ${state.preview ? "drawer-open" : ""}`}
      data-prototype-dirty={prototypeStatus.dirty}
      data-prototype-pending={prototypeStatus.pending}
      style={
        {
          "--sidebar-width": `${
            layoutPreferences.isSidebarCollapsed
              ? COLLAPSED_SIDEBAR_WIDTH
              : EXPANDED_SIDEBAR_WIDTH
          }px`,
          "--right-panel-width": `${layoutPreferences.rightPanelWidth}px`,
        } as CSSProperties
      }
    >
      <Sidebar
        activeView={state.view}
        collapsed={layoutPreferences.isSidebarCollapsed}
        recentTasks={recentTasks}
        onNavigate={navigateFromSidebar}
        onOpenProfile={() => navigateFromSidebar("profile")}
        onOpenTask={(task) => {
          requestNavigation(task.title, () => {
            dispatch({ type: "open-task", taskId: task.id });
          });
        }}
        onToggleCollapsed={() =>
          dispatchLayoutPreferences({
            type: "toggle-sidebar",
            viewportWidth: window.innerWidth,
          })
        }
      />

      <section className="main-stage">
        {state.view === "home" && (
          <HomeView
            mode={state.mode}
            canEdit={canEditSelectedWorkspace}
            currentRole={currentRole}
            agents={agents}
            projects={projects}
            productWorkMode={state.productWorkMode}
            selectedAgentId={state.selectedAgentId}
            selectedProjectId={state.selectedProjectId}
            onModeChange={(mode) => dispatch({ type: "set-mode", mode })}
            onProductWorkModeChange={(mode) => {
              if (mode === state.productWorkMode) return;
              requestNavigation("产品工作模式", () =>
                dispatch({ type: "set-product-work-mode", mode }),
              );
            }}
            onSelectAgent={(agentId) =>
              dispatch({ type: "select-agent", agentId })
            }
            onSelectProject={selectProject}
            onSend={(text) => dispatch({ type: "send-message", text })}
            onOpenProject={openProject}
          />
        )}

        {(state.view === "projects" || state.view === "project-detail") && (
          <ProjectsView
            agents={agents}
            contextSources={contextSources}
            lastAgentByRequirement={state.lastAgentByRequirement}
            onOpenContext={() => openPreview("sources")}
            onOpenRequirement={(requirementId) => {
              const run = () =>
                dispatch({ type: "select-requirement", requirementId });
              if (requirementId === state.selectedRequirementId) run();
              else {
                const destination =
                  requirements.find((item) => item.id === requirementId)
                    ?.title ?? "需求工作区";
                requestNavigation(destination, run);
              }
            }}
            onOpenSettings={() => openPreview("project-settings")}
            onResumeSession={(sessionId) => {
              const session = agentWorkSessions.find(
                (item) => item.id === sessionId,
              );
              const run = () =>
                dispatch({ type: "resume-agent-work", sessionId });
              if (session?.requirementId === state.selectedRequirementId) run();
              else requestNavigation(session?.title ?? "需求工作区", run);
            }}
            projects={projects}
            requirementStages={state.requirementStages}
            requirements={requirements}
            selectedContextIds={activeSelectedContextIds}
            selectedProjectId={
              state.view === "project-detail" ? state.selectedProjectId : null
            }
            sessions={agentWorkSessions}
            onCreateRequirement={() =>
              requestNavigation("新建需求", () =>
                dispatch({ type: "navigate", view: "home" }),
              )
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
              const run = () => {
                dispatch({
                  type: "select-project-asset",
                  assetId,
                  previewKind: preview,
                });
                dispatch({ type: "open-preview", preview });
              };
              requestNavigation("查看项目资产", run);
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
            canEdit={canEditSelectedWorkspace}
            currentRole={currentRole}
            documentDraft={selectedPrdDocument
              ? state.documentDrafts[selectedPrdDocument.id] ?? ""
              : ""}
            developmentTaskStatuses={state.developmentTaskStatuses}
            execution={state.requirementExecutions[selectedRequirement.id] ?? "idle"}
            messages={state.requirementMessages[selectedRequirement.id] ?? []}
            productWorkMode={state.productWorkMode}
            onBack={() =>
              requestNavigation(selectedProject.name, () =>
                dispatch({ type: "navigate", view: "project-detail" }),
              )
            }
            onOpenContext={() => openPreview("sources")}
            onOpenPreview={openPreview}
            onOpenSettings={() => openPreview("project-settings")}
            onSelectAgent={(agentId) => {
              if (agentId === state.selectedAgentId) return;
              const nextAgent = agents.find((agent) => agent.id === agentId);
              requestNavigation(nextAgent?.name ?? "其他 Agent", () =>
                dispatch({ type: "select-agent", agentId }),
              );
            }}
            onProductWorkModeChange={(mode) => {
              if (mode === state.productWorkMode) return;
              requestNavigation("产品工作模式", () =>
                dispatch({ type: "set-product-work-mode", mode }),
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

        {state.view === "profile" && <ProfileView />}

        {state.view === "task" && (
          <TaskView
            messages={state.taskMessagesById[selectedTask.id] ?? []}
            execution={selectedTaskExecution}
            task={selectedTask}
            agent={selectedAgent}
            executionAgent={taskExecutionAgent}
            project={selectedProject}
            agents={agents}
            projects={projects}
            selectedProjectId={state.selectedProjectId}
            canEdit={canEditSelectedWorkspace}
            currentRole={currentRole}
            onSelectAgent={(agentId) =>
              dispatch({ type: "select-agent", agentId })
            }
            onSelectProject={selectProject}
            onSend={(text) => dispatch({ type: "send-message", text })}
            onOpenPreview={openPreview}
          />
        )}
      </section>

      <PreviewDrawer
        explicitPreviewKind={
          state.view === "project-asset"
            ? state.selectedAssetPreviewKind
            : null
        }
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
          const destinations: Record<Exclude<ProjectSection, "overview">, string> = {
            documents: "产品文档",
            memory: "项目记忆",
            repositories: "代码库",
            tests: "测试资产",
          };
          requestNavigation(destinations[section], () => {
            dispatch({ type: "close-preview" });
            dispatch({ type: "select-project-section", section });
          });
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
        sidebarWidth={
          layoutPreferences.isSidebarCollapsed
            ? COLLAPSED_SIDEBAR_WIDTH
            : EXPANDED_SIDEBAR_WIDTH
        }
        width={layoutPreferences.rightPanelWidth}
        tools={contextualTools}
        requirementStages={state.requirementStages}
        requirements={requirements.filter(
          (requirement) => requirement.projectId === state.selectedProjectId,
        )}
        selectedContextIds={activeSelectedContextIds.filter((id) =>
          activeContextSourceIds.includes(id),
        )}
        selectedRequirement={selectedRequirement}
        selectedAssetId={state.selectedAssetId}
        onSelect={openPreview}
        onClose={() => {
          const run = () => dispatch({ type: "close-preview" });
          if (state.preview === "prototype") {
            requestNavigation("关闭页面预览", run, { includePrd: false });
          } else run();
        }}
        onWidthChange={(width) =>
          dispatchLayoutPreferences({ type: "set-right-panel-width", width })
        }
        sources={activeContextSources}
      />
      {pendingNavigation && (
        <NavigationGuardDialog
          destination={pendingNavigation.destination}
          kind={pendingNavigation.kind}
          onDiscard={() => {
            pendingNavigation.discard();
            if (pendingNavigation.kind !== "prd") {
              dispatch({ type: "close-preview" });
            }
            const run = pendingNavigation.run;
            setPendingNavigation(null);
            run();
          }}
          onRetain={() => {
            if (pendingNavigation.kind !== "prd") {
              dispatch({ type: "close-preview" });
            }
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
