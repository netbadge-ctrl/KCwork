import { ArrowUpRight, Clock3 } from "lucide-react";
import type { Agent, AgentWorkSession, Requirement } from "../lib/types";

export interface RecentAgentWorkProps {
  sessions: AgentWorkSession[];
  agents: Agent[];
  requirements: Requirement[];
  onResume(sessionId: string): void;
}

export function RecentAgentWork({
  sessions,
  agents,
  requirements,
  onResume,
}: RecentAgentWorkProps) {
  return (
    <section className="recent-agent-work content-section">
      <div className="section-title">
        <div>
          <p className="eyebrow">最近任务</p>
          <h2>继续上次的 Agent 对话</h2>
        </div>
        <span>保留需求上下文与上次确认点</span>
      </div>
      <div className="agent-task-list">
        {sessions.map((session) => {
          const agent = agents.find((item) => item.id === session.agentId);
          const requirement = requirements.find((item) => item.id === session.requirementId);
          if (!agent) return null;

          return (
            <button
              aria-label={`继续 ${agent.name} 对话`}
              className="agent-task-card"
              key={session.id}
              onClick={() => onResume(session.id)}
              type="button"
            >
              <span className="agent-avatar">{agent.shortName}</span>
              <span className="agent-task-copy">
                <small>{requirement?.code ?? "项目任务"} · {agent.name}</small>
                <strong>{session.title}</strong>
                <span>{session.summary}</span>
              </span>
              <span className="agent-task-next">
                <div>
                  <small><Clock3 size={11} />{session.updatedAt}</small>
                  <strong>{session.pendingAction}</strong>
                </div>
                <ArrowUpRight size={16} />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
