import { Check, FileText } from "lucide-react";
import type { Agent, ExecutionState, Message, PreviewKind } from "../lib/types";

export function RequirementAgentActivity({
  agents,
  execution,
  messages,
  onOpenPreview,
}: {
  agents: Agent[];
  execution: ExecutionState;
  messages: Message[];
  onOpenPreview(kind: PreviewKind): void;
}) {
  return (
    <section className="requirement-agent-activity" aria-label="需求 Agent 活动">
      <header>
        <div>
          <p className="eyebrow">Conversation & result</p>
          <h2>Agent 对话与执行</h2>
        </div>
        {execution === "done" && <span><Check size={14} /> 本轮 Agent 执行已完成</span>}
      </header>
      {messages.length === 0 ? (
        <p className="requirement-activity-empty">从下方输入指令后，执行过程与结果会保留在当前需求中。</p>
      ) : (
        <div className="requirement-activity-list">
          {messages.slice(-4).map((message) => (
            <article className={message.role} key={message.id}>
              <small>
                {message.role === "user"
                  ? "陈楠"
                  : agents.find((agent) => agent.id === message.agentId)?.name ?? "Agent"}
              </small>
              <p>{message.text}</p>
              {message.artifact && (
                <button onClick={() => onOpenPreview(message.artifact!)} type="button">
                  <FileText size={14} /> 查看本需求产物
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
