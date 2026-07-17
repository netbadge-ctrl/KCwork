import {
  ArrowLeft,
  BookOpen,
  Boxes,
  FileText,
  FlaskConical,
  GitBranch,
  MoreHorizontal,
  Plus,
  Users,
} from "lucide-react";
import type {
  Project,
  ProjectAssetSummary,
  ProjectMember,
  ProjectSection,
  Requirement,
  RequirementStage,
} from "../lib/types";
import { RequirementList } from "./requirement-list";

const sectionIcons = {
  documents: FileText,
  memory: BookOpen,
  repositories: GitBranch,
  tests: FlaskConical,
};

export interface ProjectDetailViewProps {
  project: Project;
  members: ProjectMember[];
  assetSummaries: ProjectAssetSummary[];
  requirements: Requirement[];
  requirementStages: Record<string, RequirementStage>;
  stageRisks: Record<string, string>;
  onBack(): void;
  onNewRequirement(): void;
  onOpenMembers(): void;
  onOpenSection(section: ProjectSection): void;
  onOpenRequirement(id: string): void;
  onSetRequirementStage(id: string, stage: RequirementStage, reason: string): void;
}

export function ProjectDetailView({
  project,
  members,
  assetSummaries,
  requirements,
  requirementStages,
  stageRisks,
  onBack,
  onNewRequirement,
  onOpenMembers,
  onOpenSection,
  onOpenRequirement,
  onSetRequirementStage,
}: ProjectDetailViewProps) {
  return (
    <div className="project-detail page-scroll">
      <header className="page-header detail-header">
        <button className="back-button" onClick={onBack} type="button">
          <ArrowLeft size={17} /> 返回项目
        </button>
        <div className="detail-title-row">
          <div>
            <div className="project-kicker">
              <span style={{ background: project.color }} /> 系统开发项目
            </div>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>
          <div className="project-member-actions">
            <button className="member-stack" onClick={onOpenMembers} type="button" aria-label="查看项目成员">
              {members.slice(0, 4).map((member) => (
                <span key={member.id} title={member.name}>{member.initials}</span>
              ))}
              <b>+{Math.max(project.members - 4, 0)}</b>
            </button>
            <button className="secondary-button" onClick={onOpenMembers} type="button">
              <Users size={16} /> 管理成员
            </button>
            <button className="primary-button" onClick={onNewRequirement} type="button">
              <Plus size={16} /> 新建需求
            </button>
            <details className="project-more-menu">
              <summary aria-label="更多项目操作"><MoreHorizontal size={18} /></summary>
              <div>
                <button type="button">项目设置</button>
                <button type="button">需求状态配置</button>
                <button type="button">审核规则</button>
              </div>
            </details>
          </div>
        </div>
        <div className="project-meta-row">
          <span><Users size={15} /> {project.members} 位成员</span>
          <span><Boxes size={15} /> {project.contextCount} 项共享上下文</span>
          <span>更新于 {project.updatedAt}</span>
        </div>
      </header>

      <section className="content-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">跨需求共用</p>
            <h2>共享项目上下文</h2>
          </div>
          <span>产品、研发与测试引用同一项目上下文</span>
        </div>
        <div className="context-grid">
          {assetSummaries.map((asset) => {
            const Icon = sectionIcons[asset.section];
            return (
              <button
                aria-label={`${asset.label} ${asset.value}`}
                className="context-card"
                key={asset.section}
                onClick={() => onOpenSection(asset.section)}
                type="button"
              >
                <span className="context-icon"><Icon size={19} /></span>
                <span className="context-copy">
                  <strong>{asset.label}</strong>
                  <small>{asset.note}</small>
                </span>
                <span className="asset-card-meta">
                  <b>{asset.value}</b>
                  <small>{asset.updatedAt}</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <RequirementList
        onOpen={onOpenRequirement}
        onSetStage={onSetRequirementStage}
        requirements={requirements}
        risks={stageRisks}
        stages={requirementStages}
      />
    </div>
  );
}
