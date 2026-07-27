import {
  ArrowRight,
  Braces,
  FileText,
  FlaskConical,
  LayoutTemplate,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Agent, Requirement, RequirementStage } from "../lib/types";
import { stageLabels } from "./requirement-list";

export interface AgentRequirementListProps {
  requirements: Requirement[];
  agents: Agent[];
  lastAgentByRequirement: Record<string, string>;
  stages: Record<string, RequirementStage>;
  historicalTotal?: number;
  onOpen(requirementId: string): void;
  onCreate(): void;
}

type RequirementFilter = "active" | "done" | "all";

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

function participantsOf(requirement: Requirement): string[] {
  return [
    requirement.owners.product,
    requirement.owners.development,
    requirement.owners.testing,
  ].filter((owner) => owner && owner !== "待分配");
}

export function AgentRequirementList({
  requirements,
  agents,
  lastAgentByRequirement,
  stages,
  historicalTotal,
  onOpen,
  onCreate,
}: AgentRequirementListProps) {
  const [filter, setFilter] = useState<RequirementFilter>("active");
  const counts = useMemo(() => {
    const done = requirements.filter(
      (requirement) => (stages[requirement.id] ?? requirement.stage) === "done",
    ).length;
    return { active: requirements.length - done, done, all: requirements.length };
  }, [requirements, stages]);
  const visibleRequirements = useMemo(
    () => [...requirements]
      .filter((requirement) => {
        const isDone = (stages[requirement.id] ?? requirement.stage) === "done";
        return filter === "all" || (filter === "done" ? isDone : !isDone);
      })
      .sort((a, b) => createdAtWeight(a.createdAt) - createdAtWeight(b.createdAt)),
    [filter, requirements, stages],
  );

  const filters: { id: RequirementFilter; label: string }[] = [
    { id: "active", label: "进行中" },
    { id: "done", label: "已完成" },
    { id: "all", label: "全部" },
  ];

  return (
    <section className="agent-requirement-list content-section">
      <div className="project-requirement-heading">
        <div>
          <p className="eyebrow">项目需求</p>
          <h2>产品需求</h2>
          <span>当前展示 {requirements.length} 项，项目累计 {historicalTotal ?? requirements.length} 项</span>
        </div>
        <button className="project-create-requirement" onClick={onCreate} type="button">
          <Plus size={14} /> 新建需求
        </button>
      </div>
      <div className="project-requirement-toolbar">
        <div className="project-requirement-filters" role="tablist" aria-label="筛选产品需求">
          {filters.map((item) => (
            <button
              aria-selected={filter === item.id}
              className={filter === item.id ? "active" : ""}
              key={item.id}
              onClick={() => setFilter(item.id)}
              role="tab"
              type="button"
            >
              {item.label}<span>{counts[item.id]}</span>
            </button>
          ))}
        </div>
        <span>需求完成后仍保留完整产品、研发与测试上下文</span>
      </div>
      <div className="project-requirement-list">
        {visibleRequirements.map((requirement) => {
          const stage = stages[requirement.id] ?? requirement.stage;
          const isDone = stage === "done";
          const lastAgent = agents.find(
            (agent) => agent.id === lastAgentByRequirement[requirement.id],
          );
          const participants = participantsOf(requirement);
          return (
            <article className={`project-requirement-row ${isDone ? "completed" : ""}`} key={requirement.id}>
              <button
                aria-label={`打开需求 ${requirement.title}`}
                className="project-requirement-main"
                onClick={() => onOpen(requirement.id)}
                type="button"
              >
                <span className="requirement-code">{requirement.code}</span>
                <span>
                  <strong>{requirement.title}</strong>
                  <small>{requirement.summary}</small>
                </span>
              </button>
              <div className="project-requirement-state">
                <span className={`project-stage-chip ${isDone ? "done" : ""}`}>{stageLabels[stage]}</span>
                <small>{isDone ? `完成于 ${requirement.updatedAt}` : requirement.gateLabel}</small>
              </div>
              <div className="project-requirement-agent">
                <span className="agent-avatar mini">{lastAgent?.shortName ?? (isDone ? "✓" : "产")}</span>
                <span>
                  <small>{isDone ? "最终成果" : "最近工作"}</small>
                  <strong>{isDone ? `Spec ${requirement.specVersion}` : lastAgent?.name ?? "产品设计 Agent"}</strong>
                </span>
              </div>
              <div className="project-requirement-artifacts" aria-label="需求产物">
                <span title="原型"><LayoutTemplate size={12} />{requirement.counts.prototypes}</span>
                <span title="文档"><FileText size={12} />{requirement.counts.documents}</span>
                <span title="代码变更"><Braces size={12} />{requirement.counts.changes}</span>
                <span title="测试用例"><FlaskConical size={12} />{requirement.counts.tests}</span>
              </div>
              <div className="project-requirement-people" aria-label={`参与人：${participants.join("、")}`}>
                {participants.slice(0, 3).map((name) => (
                  <span key={name} title={name}>{name.slice(0, 1)}</span>
                ))}
              </div>
              <button
                aria-label={`${isDone ? "查看" : "继续"} ${requirement.title}`}
                className="project-requirement-open"
                onClick={() => onOpen(requirement.id)}
                type="button"
              >
                <span>{isDone ? "查看成果" : "继续工作"}</span><ArrowRight size={15} />
              </button>
            </article>
          );
        })}
        {visibleRequirements.length === 0 && (
          <div className="project-requirement-empty">
            当前分类暂无需求
          </div>
        )}
      </div>
    </section>
  );
}
