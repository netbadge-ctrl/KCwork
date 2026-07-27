"use client";

import { useEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from "react";
import { AssetsView } from "./components/assets-view";
import { HomeView } from "./components/home-view";
import { NavigationGuardDialog } from "./components/navigation-guard-dialog";
import { PreviewDrawer } from "./components/preview-drawer";
import { ProfileView } from "./components/profile-view";
import { ProjectAssetsView } from "./components/project-assets-view";
import { ProjectsView } from "./components/projects-view";
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
import type { PreviewKind, ProductContextReference, ProductWorkMode, Project, ProjectSection, ViewId } from "./lib/types";
import {
  clampPreferredRightPanelWidth,
  COLLAPSED_SIDEBAR_WIDTH,
  DEFAULT_RIGHT_PANEL_WIDTH,
  EXPANDED_SIDEBAR_WIDTH,
  readStoredBoolean,
  readStoredNumber,
} from "./lib/layout-preferences";
import { useProductPackageSession } from "./hooks/use-product-package-session";
import { useRequirementBaselineSession } from "./hooks/use-requirement-baseline-session";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "kflow.sidebar.collapsed";
const RIGHT_PANEL_WIDTH_STORAGE_KEY = "kflow.rightPanel.width";

type SidebarPreference = "auto" | "expanded" | "collapsed";

// Whether the sidebar is effectively collapsed given the preference and current view.
// "auto" collapses on task/project-detail, expands elsewhere.
function isSidebarCollapsed(preference: SidebarPreference, view: ViewId): boolean {
  if (preference === "collapsed") return true;
  if (preference === "expanded") return false;
  return view === "task" || view === "project-detail";
}

const sidebarWidthFor = (collapsed: boolean) =>
  collapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH;

interface LayoutPreferencesState {
  hydrated: boolean;
  sidebarPreference: SidebarPreference;
  rightPanelWidth: number;
}

type LayoutPreferencesAction =
  | {
      type: "hydrate";
      sidebarPreference: SidebarPreference;
      rightPanelWidth: number;
    }
  | { type: "toggle-sidebar"; currentEffective: boolean; viewportWidth: number }
  | { type: "reset-to-auto"; viewportWidth: number }
  | { type: "set-right-panel-width"; width: number };

const initialLayoutPreferences: LayoutPreferencesState = {
  hydrated: false,
  sidebarPreference: "auto",
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
        sidebarPreference: action.sidebarPreference,
        rightPanelWidth: action.rightPanelWidth,
      };
    case "toggle-sidebar": {
      // Flips from current effective state to explicit opposite
      const sidebarPreference: SidebarPreference = action.currentEffective
        ? "expanded"
        : "collapsed";
      return {
        ...state,
        sidebarPreference,
        rightPanelWidth: clampPreferredRightPanelWidth(
          state.rightPanelWidth,
          action.viewportWidth,
          action.currentEffective
            ? EXPANDED_SIDEBAR_WIDTH
            : COLLAPSED_SIDEBAR_WIDTH,
        ),
      };
    }
    case "set-right-panel-width":
      return { ...state, rightPanelWidth: action.width };
    case "reset-to-auto":
      // Reset to auto mode when entering task/project view
      // This ensures auto-collapsed behavior on entry
      return {
        ...state,
        sidebarPreference: "auto",
        rightPanelWidth: clampPreferredRightPanelWidth(
          state.rightPanelWidth,
          action.viewportWidth,
          COLLAPSED_SIDEBAR_WIDTH,
        ),
      };
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
  const isArtifactFocus = ["prototype", "prd"].includes(state.preview ?? "") && ["task", "requirement-detail"].includes(state.view);
  const productPackageSession = useProductPackageSession(
    state.selectedRequirementId ?? "role-permissions",
  );
  const requirementBaselineSession = useRequirementBaselineSession(
    state.selectedRequirementId ?? "role-permissions",
  );
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation | null>(null);
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [layoutPreferences, dispatchLayoutPreferences] = useReducer(
    layoutPreferencesReducer,
    initialLayoutPreferences,
  );
  const wasArtifactFocusRef = useRef(false);
  const regularRightPanelWidthRef = useRef<number | null>(null);
  const previousViewRef = useRef<ViewId>("home");

  // When entering task/project-detail from another view, reset sidebar
  // preference to "auto" so it collapses by default.
  useEffect(() => {
    const prev = previousViewRef.current;
    const current = state.view;
    const enteringTask =
      current === "task" || current === "project-detail";
    const comingFromNonTask =
      prev !== "task" && prev !== "project-detail";

    if (enteringTask && comingFromNonTask) {
      dispatchLayoutPreferences({
        type: "reset-to-auto",
        viewportWidth: window.innerWidth,
      });
    }

    previousViewRef.current = current;
  }, [state.view]);
  // Compute effective collapsed state
  // - "collapsed" preference: always collapsed
  // - "expanded" preference: always expanded
  // - "auto" preference: collapsed on task/project-detail, expanded elsewhere
  const effectiveSidebarCollapsed = isSidebarCollapsed(
    layoutPreferences.sidebarPreference,
    state.view,
  );
  const effectiveSidebarWidth = sidebarWidthFor(effectiveSidebarCollapsed);
  const selectedTaskExecution =
    state.taskExecutionsById[state.selectedTaskId] ?? "idle";
  const availableProjects = useMemo(
    () => [...projects, ...createdProjects],
    [createdProjects],
  );

  useEffect(() => {
    const raw = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    // Migrate legacy boolean values to new 3-state preference
    let sidebarPreference: SidebarPreference = "auto";
    if (raw === "expanded" || raw === "collapsed") {
      sidebarPreference = raw;
    } else if (raw === "true") {
      sidebarPreference = "collapsed";
    } else if (raw === "false") {
      sidebarPreference = "expanded";
    }
    // Hydrate: compute effective for initial width clamp
    const effectiveForHydrate = isSidebarCollapsed(sidebarPreference, state.view);
    dispatchLayoutPreferences({
      type: "hydrate",
      sidebarPreference,
      rightPanelWidth: clampPreferredRightPanelWidth(
        readStoredNumber(
          window.localStorage.getItem(RIGHT_PANEL_WIDTH_STORAGE_KEY),
          DEFAULT_RIGHT_PANEL_WIDTH,
        ),
        window.innerWidth,
        sidebarWidthFor(effectiveForHydrate),
      ),
    });
  }, []);

  useEffect(() => {
    if (!layoutPreferences.hydrated) return;
    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
      layoutPreferences.sidebarPreference,
    );
  }, [layoutPreferences.hydrated, layoutPreferences.sidebarPreference]);

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
          effectiveSidebarWidth,
        ),
      });
    window.addEventListener("resize", clampToViewport);
    return () => window.removeEventListener("resize", clampToViewport);
  }, [
    isArtifactFocus,
    effectiveSidebarCollapsed,
    layoutPreferences.rightPanelWidth,
  ]);

  useEffect(() => {
    if (!layoutPreferences.hydrated) return;
    if (isArtifactFocus && !wasArtifactFocusRef.current) {
      regularRightPanelWidthRef.current = layoutPreferences.rightPanelWidth;
      const desiredMainWidth = Math.min(520, Math.max(420, Math.floor(window.innerWidth * 0.32)));
      const sidebarWidth = effectiveSidebarWidth;
      dispatchLayoutPreferences({
        type: "set-right-panel-width",
        width: clampPreferredRightPanelWidth(
          window.innerWidth - sidebarWidth - desiredMainWidth,
          window.innerWidth,
          sidebarWidth,
        ),
      });
    }
    if (!isArtifactFocus && wasArtifactFocusRef.current && regularRightPanelWidthRef.current) {
      dispatchLayoutPreferences({ type: "set-right-panel-width", width: regularRightPanelWidthRef.current });
      regularRightPanelWidthRef.current = null;
    }
    wasArtifactFocusRef.current = isArtifactFocus;
  }, [
    isArtifactFocus,
    layoutPreferences.hydrated,
    effectiveSidebarCollapsed,
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
      availableProjects.find((project) => project.id === state.selectedProjectId) ??
      null,
    [availableProjects, state.selectedProjectId],
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
  const currentRoles: ProjectRole[] = currentMember
    ? (state.memberRoles[currentMember.id] ?? currentMember.roles)
    : ["viewer"];
  const capabilities = selectedProject
    ? getProjectCapabilities(currentRoles)
    : unscopedCapabilities;
  const prototypeStatus = usePrototypeDocumentStatus(
    selectedRequirement?.id ?? null,
  );

  useEffect(() => {
    if (!selectedProject) return;
    publishProjectCapability(
      selectedProject.id,
      currentRoles,
      capabilities.canEditProductArtifacts,
    );
  }, [
    capabilities.canEditProductArtifacts,
    currentRoles,
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
      (Boolean(draftId && state.documentDrafts[draftId]) ||
        Boolean(productPackageSession.state.prdRevision));
    const hasUnconfirmedPrototype =
      includePrototype &&
      selectedRequirement &&
      (prototypeStatus.pending || Boolean(productPackageSession.state.pendingInstruction));
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
          if (productPackageSession.state.prdRevision) {
            productPackageSession.dispatch({ type: "set-prd-revision", revision: "" });
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

  const handleProductWorkModeChange = (mode: ProductWorkMode) => {
    if (mode === state.productWorkMode) return;
    requestNavigation("产品工作模式", () =>
      dispatch({ type: "set-product-work-mode", mode }),
    );
  };

  const sendMessage = (text: string, contextReference?: ProductContextReference) => {
    dispatch({ type: "send-message", text, contextReference });
    if (state.selectedAgentId !== "product-design") return;
    if (contextReference) return;
    if (/原型|页面|组件/.test(text)) {
      productPackageSession.dispatch({
        type: "create-prototype-version",
        title: "根据本轮对话更新原型",
      });
      dispatch({ type: "open-preview", preview: "prototype" });
    } else if (/PRD|产品文档|需求文档/i.test(text)) {
      productPackageSession.dispatch({ type: "set-prd-revision", revision: text });
      dispatch({ type: "open-preview", preview: "prd" });
    }
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
        availableProjects.find((project) => project.id === projectId)?.name ??
        "未关联项目";
      requestNavigation(destination, run);
    }
  };

  return (
    <main
      className={`client-shell ${state.view === "home" ? "no-auxiliary" : ""} ${state.view !== "home" && state.preview ? "drawer-open" : ""} ${isArtifactFocus ? "artifact-focus" : ""}`}
      data-prototype-dirty={prototypeStatus.dirty}
      data-prototype-pending={prototypeStatus.pending || Boolean(productPackageSession.state.pendingInstruction)}
      style={
        {
          "--sidebar-width": `${effectiveSidebarWidth}px`,
          "--right-panel-width": `${layoutPreferences.rightPanelWidth}px`,
        } as CSSProperties
      }
    >
      <Sidebar
        activeView={state.view}
        collapsed={effectiveSidebarCollapsed}
        recentTasks={recentTasks}
        onNavigate={navigateFromSidebar}
        onOpenProfile={() => navigateFromSidebar("profile")}
        onOpenTask={(task) => {
          requestNavigation(task.title, () => {
            dispatch({ type: "open-task", taskId: task.id });
          });
        }}
        onToggleCollapsed={() => {
          dispatchLayoutPreferences({
            type: "toggle-sidebar",
            currentEffective: effectiveSidebarCollapsed,
            viewportWidth: window.innerWidth,
          });
        }}
      />

      <section className="main-stage">
        {state.view === "home" && (
          <HomeView
            mode={state.mode}
            canEdit={canEditSelectedWorkspace}
            currentRoles={currentRoles}
            agents={agents}
            projects={availableProjects}
            productWorkMode={state.productWorkMode}
            selectedAgentId={state.selectedAgentId}
            selectedProjectId={state.selectedProjectId}
            onModeChange={(mode) => dispatch({ type: "set-mode", mode })}
            onProductWorkModeChange={handleProductWorkModeChange}
            onSelectAgent={(agentId) =>
              dispatch({ type: "select-agent", agentId })
            }
            onSelectProject={selectProject}
            onSend={sendMessage}
            onOpenProject={openProject}
          />
        )}

        {(state.view === "projects" || state.view === "project-detail") && (
          <ProjectsView
            agents={agents}
            contextSources={contextSources}
            lastAgentByRequirement={state.lastAgentByRequirement}
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
            onResumeSession={(sessionId) => {
              const session = agentWorkSessions.find(
                (item) => item.id === sessionId,
              );
              const run = () =>
                dispatch({ type: "resume-agent-work", sessionId });
              if (session?.requirementId === state.selectedRequirementId) run();
              else requestNavigation(session?.title ?? "需求工作区", run);
            }}
            projects={availableProjects}
            requirementStages={state.requirementStages}
            requirements={requirements}
            selectedProjectId={
              state.view === "project-detail" ? state.selectedProjectId : null
            }
            sessions={agentWorkSessions}
            onCreateRequirement={() =>
              requestNavigation("新建需求", () =>
                dispatch({ type: "navigate", view: "home" }),
              )
            }
            onStartCreateProject={() => openPreview("create-system")}
            onOpenProject={openProject}
            onOpenPreview={openPreview}
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
          <TaskView
            agent={selectedAgent}
            agents={agents}
            canEdit={canEditSelectedWorkspace}
            contextCount={activeSelectedContextIds.length}
            currentRoles={currentRoles}
            execution={state.requirementExecutions[selectedRequirement.id] ?? "idle"}
            executionAgent={selectedAgent}
            messages={state.requirementMessages[selectedRequirement.id] ?? []}
            productWorkMode={state.productWorkMode}
            project={selectedProject}
            projectSelectionLocked
            projects={availableProjects}
            requirement={selectedRequirement}
            selectedProjectId={state.selectedProjectId}
            task={{
              id: `requirement-${selectedRequirement.id}`,
              title: selectedRequirement.title,
              mode: "research",
              projectId: selectedProject.id,
              requirementId: selectedRequirement.id,
              agentId: selectedAgent.id,
              productWorkMode: state.productWorkMode,
              time: `${selectedRequirement.code} · Spec ${selectedRequirement.specVersion}`,
            }}
            onOpenPreview={openPreview}
            activePreview={state.preview}
            onClearProductContext={() => dispatch({ type: "close-preview" })}
            onBackToProject={() =>
              requestNavigation(selectedProject.name, () =>
                dispatch({ type: "navigate", view: "project-detail" }),
              )
            }
            onSelectProject={selectProject}
            onSelectAgent={(agentId) => {
              if (agentId === state.selectedAgentId) return;
              const nextAgent = agents.find((agent) => agent.id === agentId);
              requestNavigation(nextAgent?.name ?? "其他 Agent", () =>
                dispatch({ type: "select-agent", agentId }),
              );
            }}
            onProductWorkModeChange={handleProductWorkModeChange}
            onSend={sendMessage}
            productPackage={productPackageSession.state}
            onProductPackageAction={productPackageSession.dispatch}
            requirementBaseline={requirementBaselineSession.state}
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
            projects={availableProjects}
            selectedProjectId={state.selectedProjectId}
            canEdit={canEditSelectedWorkspace}
            currentRoles={currentRoles}
            productWorkMode={state.productWorkMode}
            onProductWorkModeChange={handleProductWorkModeChange}
            onSelectAgent={(agentId) =>
              dispatch({ type: "select-agent", agentId })
            }
            onSelectProject={selectProject}
            onSend={sendMessage}
            onOpenPreview={openPreview}
            activePreview={state.preview}
            onClearProductContext={() => dispatch({ type: "close-preview" })}
            productPackage={productPackageSession.state}
            onProductPackageAction={productPackageSession.dispatch}
            requirement={selectedRequirement}
            requirementBaseline={selectedRequirement ? requirementBaselineSession.state : undefined}
          />
        )}
      </section>

      {state.view !== "home" && <PreviewDrawer
        assets={assetGroups}
        documentDraft={
          selectedPrdDocument
            ? state.documentDrafts[selectedPrdDocument.id] ?? ""
            : ""
        }
        explicitPreviewKind={
          state.view === "project-asset"
            ? state.selectedAssetPreviewKind
            : null
        }
        capabilities={capabilities}
        currentRoles={currentRoles}
        lockedContextIds={activeLockedContextIds.filter((id) =>
          activeContextSourceIds.includes(id),
        )}
        memberRoles={state.memberRoles}
        members={selectedProjectMembers}
        onChangeMemberRole={(memberId, roles) =>
          dispatch({ type: "set-member-role", memberId, roles })
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
            memory: "项目知识与记忆",
            repositories: "代码库",
            tests: "测试资产",
          };
          requestNavigation(destinations[section], () => {
            dispatch({ type: "close-preview" });
            dispatch({ type: "select-project-section", section });
          });
        }}
        onCreateProject={(project) => {
          setCreatedProjects((current) => [...current, project]);
          dispatch({ type: "select-project", projectId: project.id });
          dispatch({ type: "close-preview" });
          dispatch({ type: "navigate", view: "project-detail" });
        }}
        onOpenSmartAssets={() => {
          dispatch({ type: "close-preview" });
          dispatch({ type: "navigate", view: "assets" });
        }}
        onSaveDocumentDraft={(draft) =>
          selectedPrdDocument &&
          dispatch({
            type: "set-document-draft",
            documentId: selectedPrdDocument.id,
            draft,
          })
        }
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
          effectiveSidebarCollapsed
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
        selectedProject={selectedProject}
        selectedRequirement={selectedRequirement}
        selectedAgentId={selectedAgent.id}
        view={state.view}
        productPackage={productPackageSession.state}
        onProductPackageAction={productPackageSession.dispatch}
        onScopedProductSend={(reference, text) => sendMessage(text, reference)}
        requirementBaseline={requirementBaselineSession.state}
        onRequirementBaselineAction={requirementBaselineSession.dispatch}
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
      />}
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
