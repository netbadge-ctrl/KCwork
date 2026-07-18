"use client";

import { useEffect, useMemo, useReducer } from "react";
import { AssetsView } from "./components/assets-view";
import { HomeView } from "./components/home-view";
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

export default function Page() {
  const [state, dispatch] = useReducer(clientReducer, initialClientState);

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
  const activeContextSources = useMemo(
    () =>
      contextSources.filter(
        (source) => source.projectId === state.selectedProjectId,
      ),
    [state.selectedProjectId],
  );
  const activeContextSourceIds = activeContextSources.map((source) => source.id);

  const openProject = (projectId: string) => {
    dispatch({ type: "select-project", projectId });
    dispatch({ type: "navigate", view: "project-detail" });
  };

  return (
    <main className={`client-shell ${state.preview ? "drawer-open" : ""}`}>
      <Sidebar
        activeView={state.view}
        recentTasks={recentTasks}
        onNavigate={(view) => dispatch({ type: "navigate", view })}
        onOpenTask={(task) => {
          dispatch({ type: "select-agent", agentId: task.agentId });
          dispatch({
            type: "select-project",
            projectId: task.projectId ?? null,
          });
          dispatch({ type: "navigate", view: "task" });
        }}
      />

      <section className="main-stage">
        {state.view === "home" && (
          <HomeView
            mode={state.mode}
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
            selectedContextIds={state.selectedContextIds}
            selectedProjectId={
              state.view === "project-detail" ? state.selectedProjectId : null
            }
            sessions={agentWorkSessions}
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
            documentDraft={
              state.documentDrafts["prd-role-permissions"] ?? ""
            }
            developmentTaskStatuses={state.developmentTaskStatuses}
            onBack={() => dispatch({ type: "navigate", view: "project-detail" })}
            onOpenContext={() =>
              dispatch({ type: "open-preview", preview: "sources" })
            }
            onOpenPreview={(preview) =>
              dispatch({ type: "open-preview", preview })
            }
            onOpenSettings={() =>
              dispatch({ type: "open-preview", preview: "project-settings" })
            }
            onSelectAgent={(agentId) =>
              dispatch({ type: "select-agent", agentId })
            }
            onSelectProject={(projectId) =>
              dispatch({ type: "select-project", projectId })
            }
            onSend={(text) => {
              dispatch({ type: "send-message", text });
              dispatch({ type: "navigate", view: "requirement-detail" });
            }}
            onSaveDocumentDraft={(draft) =>
              dispatch({
                type: "set-document-draft",
                documentId: "prd-role-permissions",
                draft,
              })
            }
            onSetDevelopmentTaskStatus={(taskId, status) =>
              dispatch({ type: "set-development-task-status", taskId, status })
            }
            project={selectedProject}
            projects={projects}
            requirement={selectedRequirement}
            selectedContextCount={state.selectedContextIds.length}
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
        currentRequirementStage={
          selectedRequirement
            ? state.requirementStages[selectedRequirement.id] ?? selectedRequirement.stage
            : null
        }
        lockedContextIds={state.lockedContextIds.filter((id) =>
          activeContextSourceIds.includes(id),
        )}
        memberRoles={state.memberRoles}
        members={projectMembers.filter(
          (member) => member.projectId === state.selectedProjectId,
        )}
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
        onToggleContextLock={(sourceId) =>
          dispatch({ type: "toggle-context-lock", sourceId })
        }
        onToggleContextSource={(sourceId) =>
          dispatch({ type: "toggle-context-source", sourceId })
        }
        preview={state.preview}
        selectedRequirement={selectedRequirement}
        selectedContextIds={state.selectedContextIds.filter((id) =>
          activeContextSourceIds.includes(id),
        )}
        selectedAssetId={state.selectedAssetId}
        onSelect={(preview) => dispatch({ type: "open-preview", preview })}
        onClose={() => dispatch({ type: "close-preview" })}
        sources={activeContextSources}
      />
    </main>
  );
}
