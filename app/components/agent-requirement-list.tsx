import type { Agent, Requirement, RequirementStage } from "../lib/types";
import { stageLabels } from "./requirement-list";

export interface AgentRequirementListProps {
  requirements: Requirement[];
  agents: Agent[];
  lastAgentByRequirement: Record<string, string>;
  stages: Record<string, RequirementStage>;
  onOpen(requirementId: string): void;
}

// 创建时间排序权重:越近创建权重越高(最新在前)。
// 种子 createdAt 为自然语言("2 小时前"/"3 天前"),按小时数近似排序。
function createdAtWeight(createdAt: string): number {
  const match = createdAt.match(/(\d+)\s*(小时|天|周|月)/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === "小时") return value;
  if (unit === "天") return value * 24;
  if (unit === "周") return value * 24 * 7;
  if (unit === "月") return value * 24 * 30;
  return Number.MAX_SAFE_INTEGER;
}

function participantListOf(requirement: Requirement): string[] {
  const owners = [
    requirement.owners.product,
    requirement.owners.development,
    requirement.owners.testing,
  ];
  return owners.filter((owner) => owner && owner !== "待分配");
}

export function AgentRequirementList({
  requirements,
  agents,
  lastAgentByRequirement,
  stages,
  onOpen,
}: AgentRequirementListProps) {
  const sorted = [...requirements].sort(
    (a, b) => createdAtWeight(a.createdAt) - createdAtWeight(b.createdAt),
  );
  return (
    <section className="agent-requirement-list content-section">
      <div className="section-title">
        <div>
          <p className="eyebrow">按需求进入</p>
          <h2>产品需求</h2>
        </div>
        <span>按创建时间排序,展示创建人、状态与参与人</span>
      </div>
      <div className="agent-requirement-grid">
        {sorted.map((requirement) => {
          const stage = stages[requirement.id] ?? requirement.stage;
          const lastAgent = agents.find(
            (agent) => agent.id === lastAgentByRequirement[requirement.id],
          );
          const participants = participantListOf(requirement);
          return (
            <article className="agent-requirement-card" key={requirement.id}>
              <button
                aria-label={`打开需求 ${requirement.title}`}
                className="agent-requirement-main"
                onClick={() => onOpen(requirement.id)}
                type="button"
              >
                <span className="requirement-code">{requirement.code}</span>
                <strong>{requirement.title}</strong>
                <p>{requirement.summary}</p>
              </button>
              <dl className="requirement-meta">
                <div>
                  <dt>创建人</dt>
                  <dd>{requirement.createdBy}</dd>
                </div>
                <div>
                  <dt>创建时间</dt>
                  <dd>{requirement.createdAt}</dd>
                </div>
                <div>
                  <dt>需求状态</dt>
                  <dd><span className="compact-stage-label">{stageLabels[stage]}</span></dd>
                </div>
              </dl>
              <footer>
                <div className="requirement-participants" aria-label="参与人">
                  {participants.map((name) => (
                    <span className="requirement-participant" key={name} title={name}>
                      {name.slice(0, 1)}
                    </span>
                  ))}
                  <small>{participants.join("、")}</small>
                </div>
                <button
                  aria-label={`恢复${requirement.title}工作区`}
                  onClick={() => onOpen(requirement.id)}
                  type="button"
                >
                  {lastAgent?.name ? `继续 ${lastAgent.name}` : "恢复工作区"}
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
