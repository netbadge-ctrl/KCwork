import type { Agent, AgentWorkSession } from "../lib/types";

export interface RecentAgentWorkProps {
  sessions: AgentWorkSession[];
  agents: Agent[];
  onResume(sessionId: string): void;
}

export function RecentAgentWork({
  sessions,
  agents,
  onResume,
}: RecentAgentWorkProps) {
  return (
    <section className="recent-agent-work content-section">
      <div className="section-title">
        <div>
          <p className="eyebrow">接续上下文</p>
          <h2>继续 Agent 工作</h2>
        </div>
        <span>从上次确认点继续，无需重新交代背景</span>
      </div>
      <div className="agent-session-grid">
        {sessions.map((session) => {
          const agent = agents.find((item) => item.id === session.agentId);
          if (!agent) return null;

          return (
            <article className="agent-session-card" key={session.id}>
              <div className="agent-session-card-heading">
                <span className="agent-avatar">{agent.shortName}</span>
                <div>
                  <small>{agent.name}</small>
                  <strong>{session.title}</strong>
                </div>
                <time>{session.updatedAt}</time>
              </div>
              <p>{session.summary}</p>
              <div className="agent-session-card-footer">
                <span>{session.pendingAction}</span>
                <button
                  aria-label={`继续 ${agent.name} 对话`}
                  onClick={() => onResume(session.id)}
                  type="button"
                >
                  继续对话
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
