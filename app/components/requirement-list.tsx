import {
  ArrowRight,
  Braces,
  FileText,
  FlaskConical,
  LayoutTemplate,
} from "lucide-react";
import type { Requirement, RequirementStage } from "../lib/types";

export const stageLabels: Record<RequirementStage, string> = {
  clarifying: "需求澄清",
  designing: "方案设计",
  "ready-for-dev": "待开发",
  developing: "开发中",
  "ready-for-test": "待测试",
  testing: "测试中",
  "ready-for-release": "待上线",
  done: "已完成",
};

const stages = Object.entries(stageLabels) as [RequirementStage, string][];

export interface RequirementListProps {
  requirements: Requirement[];
  stages: Record<string, RequirementStage>;
  risks: Record<string, string>;
  onOpen(id: string): void;
  onSetStage(id: string, stage: RequirementStage, reason: string): void;
}

export function RequirementList({
  requirements,
  stages: currentStages,
  risks,
  onOpen,
  onSetStage,
}: RequirementListProps) {
  return (
    <section className="content-section requirement-section">
      <div className="section-title requirement-title-row">
        <div>
          <p className="eyebrow">Spec 驱动</p>
          <h2>项目需求</h2>
        </div>
        <span>{requirements.length} 份需求正在共享产品、代码与测试上下文</span>
      </div>

      <div className="requirement-list">
        {requirements.map((requirement) => {
          const stage = currentStages[requirement.id] ?? requirement.stage;
          return (
            <article className="requirement-row" key={requirement.id}>
              <button
                aria-label={`打开需求 ${requirement.title}`}
                className="requirement-main"
                onClick={() => onOpen(requirement.id)}
                type="button"
              >
                <span className="requirement-code">{requirement.code}</span>
                <span className="requirement-copy">
                  <strong>{requirement.title}</strong>
                  <small>{requirement.summary}</small>
                </span>
              </button>

              <div className="requirement-stage-cell">
                <select
                  aria-label={`切换 ${requirement.title} 状态`}
                  className="requirement-stage-select"
                  onChange={(event) =>
                    onSetStage(
                      requirement.id,
                      event.target.value as RequirementStage,
                      "由项目成员直接调整",
                    )
                  }
                  value={stage}
                >
                  {stages.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <span className={`gate-badge ${requirement.gateStatus}`}>
                  {requirement.gateLabel}
                </span>
                {risks[requirement.id] && (
                  <small className="stage-risk">已记录跳转说明</small>
                )}
              </div>

              <div className="spec-meter" aria-label={`Spec 完整度 ${requirement.specCompletion}%`}>
                <span><b>Spec {requirement.specVersion}</b><small>{requirement.specCompletion}%</small></span>
                <div><i style={{ width: `${requirement.specCompletion}%` }} /></div>
              </div>

              <div className="requirement-owners">
                <span title="产品负责人">产 · {requirement.owners.product}</span>
                <span title="研发负责人">研 · {requirement.owners.development}</span>
                <span title="测试负责人">测 · {requirement.owners.testing}</span>
              </div>

              <div className="requirement-counts" aria-label="关联产物数量">
                <span title="原型"><LayoutTemplate size={13} />{requirement.counts.prototypes}</span>
                <span title="文档"><FileText size={13} />{requirement.counts.documents}</span>
                <span title="代码变更"><Braces size={13} />{requirement.counts.changes}</span>
                <span title="测试用例"><FlaskConical size={13} />{requirement.counts.tests}</span>
              </div>

              <button
                aria-label={`进入 ${requirement.title} 详情`}
                className="requirement-open-icon"
                onClick={() => onOpen(requirement.id)}
                type="button"
              >
                <ArrowRight size={17} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
