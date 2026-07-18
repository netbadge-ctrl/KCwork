import type { Agent, Requirement, RequirementStage } from "../lib/types";
import { stageLabels } from "./requirement-list";

export interface AgentRequirementListProps {
  requirements: Requirement[];
  agents: Agent[];
  lastAgentByRequirement: Record<string, string>;
  stages: Record<string, RequirementStage>;
  onOpen(requirementId: string): void;
}

export function AgentRequirementList({
  requirements,
  agents,
  lastAgentByRequirement,
  stages,
  onOpen,
}: AgentRequirementListProps) {
  return (
    <section className="agent-requirement-list content-section">
      <div className="section-title">
        <div>
          <p className="eyebrow">按需求进入</p>
          <h2>从需求开始</h2>
        </div>
        <span>选择需求后恢复上次协作的 Agent</span>
      </div>
      <div className="agent-requirement-grid">
        {requirements.map((requirement) => {
          const stage = stages[requirement.id] ?? requirement.stage;
          const lastAgent = agents.find(
            (agent) => agent.id === lastAgentByRequirement[requirement.id],
          );

          return (
            <article className="agent-requirement-card" key={requirement.id}>
              <div>
                <span className="requirement-code">{requirement.code}</span>
                <strong>{requirement.title}</strong>
                <p>{requirement.summary}</p>
              </div>
              <footer>
                <span className="compact-stage-label">{stageLabels[stage]}</span>
                <small>{lastAgent?.name ?? "需求分析 Agent"}</small>
                <button
                  aria-label={`恢复${requirement.title}工作区`}
                  onClick={() => onOpen(requirement.id)}
                  type="button"
                >
                  恢复工作区
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
