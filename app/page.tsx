"use client";

import { useEffect, useMemo, useReducer } from "react";
import { AssetsView } from "./components/assets-view";
import { HomeView } from "./components/home-view";
import { PreviewDrawer } from "./components/preview-drawer";
import { ProjectsView } from "./components/projects-view";
import { Sidebar } from "./components/sidebar";
import { TaskView } from "./components/task-view";
import { agents, assetGroups, projects, recentTasks } from "./lib/demo-data";
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
            projects={projects}
            selectedProjectId={
              state.view === "project-detail" ? state.selectedProjectId : null
            }
            recentTasks={recentTasks}
            onOpenProject={openProject}
            onBack={() => dispatch({ type: "navigate", view: "projects" })}
            onStartTask={(projectId) => {
              dispatch({ type: "select-project", projectId });
              dispatch({ type: "navigate", view: "home" });
            }}
            onOpenTask={() => dispatch({ type: "navigate", view: "task" })}
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
        preview={state.preview}
        onSelect={(preview) => dispatch({ type: "open-preview", preview })}
        onClose={() => dispatch({ type: "close-preview" })}
      />
    </main>
  );
}
