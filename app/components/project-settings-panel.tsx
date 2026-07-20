import { ChevronDown, Database, FileText, GitBranch, ShieldCheck, TestTube2 } from "lucide-react";
import { useState } from "react";
import type {
  ProjectMember,
  ProjectCapabilities,
  ProjectRole,
  ProjectSection,
  Requirement,
  RequirementStage,
} from "../lib/types";
import { projectRoleLabels } from "../lib/project-capabilities";
import { MemberManager } from "./member-manager";
import { stageLabels } from "./requirement-list";

const assetSections: {
  section: Exclude<ProjectSection, "overview">;
  label: string;
  description: string;
  icon: typeof FileText;
}[] = [
  { section: "documents", label: "产品文档", description: "PRD、原型与确认版本", icon: FileText },
  { section: "memory", label: "项目记忆", description: "决策、约定与长期上下文", icon: Database },
  { section: "repositories", label: "代码库", description: "关联仓库与索引状态", icon: GitBranch },
  { section: "tests", label: "测试资产", description: "测试用例、报告与质量状态", icon: TestTube2 },
];

export interface ProjectSettingsPanelProps {
  section?: "all" | "governance" | "context";
  members: ProjectMember[];
  memberRoles: Record<string, ProjectRole>;
  requirements: Requirement[];
  requirementStages: Record<string, RequirementStage>;
  capabilities: ProjectCapabilities;
  currentRole: ProjectRole;
  onChangeMemberRole(memberId: string, role: ProjectRole): void;
  onSetRequirementStage(requirementId: string, stage: RequirementStage): void;
  onOpenAsset(section: Exclude<ProjectSection, "overview">): void;
}

export function ProjectSettingsPanel({
  section = "all",
  members,
  memberRoles,
  requirements,
  requirementStages,
  capabilities,
  currentRole,
  onChangeMemberRole,
  onSetRequirementStage,
  onOpenAsset,
}: ProjectSettingsPanelProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggleSection = (section: string) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  return (
    <section className="project-settings-panel" aria-label="项目治理设置">
      <div className="project-settings-intro">
        <span className="project-settings-role">
          <ShieldCheck size={16} />
          {currentRole === "viewer"
            ? "当前角色仅可查看"
            : `当前角色：${projectRoleLabels[currentRole]}`}
        </span>
        <p>项目治理和共享上下文维护集中在此处，日常工作仍围绕 Agent 与需求展开。</p>
      </div>

      {section === "all" && <section className="project-settings-section">
        <button
          aria-expanded={openSection === "members"}
          className="project-settings-section-toggle"
          onClick={() => toggleSection("members")}
          type="button"
        >
          <span>成员与角色</span>
          <ChevronDown size={17} />
        </button>
        {openSection === "members" && (
          <div className="project-settings-section-content">
            <MemberManager
              canManage={capabilities.canManageMembers}
              members={members}
              onChangeRole={onChangeMemberRole}
              roles={memberRoles}
            />
          </div>
        )}
      </section>}

      {(section === "all" || section === "governance") && <section className="project-settings-section">
        {section === "all" && <button
          aria-expanded={openSection === "governance"}
          className="project-settings-section-toggle"
          onClick={() => toggleSection("governance")}
          type="button"
        >
          <span>需求状态与门禁</span>
          <ChevronDown size={17} />
        </button>}
        {(section === "governance" || openSection === "governance") && (
          <div className="project-settings-section-content requirement-governance-settings">
            <p className="project-settings-help">调整状态会记录为项目治理变更；门禁状态由对应评审结果维护。</p>
            <div className="project-requirement-settings-list">
              {requirements.map((requirement) => {
                const stage = requirementStages[requirement.id] ?? requirement.stage;
                return (
                  <article className="project-requirement-setting" key={requirement.id}>
                    <div>
                      <strong>{requirement.title}</strong>
                      <small>{requirement.code} · Spec {requirement.specVersion}</small>
                    </div>
                    <label>
                      状态
                      <select
                        aria-label={`设置${requirement.title}状态`}
                        disabled={!capabilities.canManageRequirements}
                        onChange={(event) =>
                          onSetRequirementStage(
                            requirement.id,
                            event.target.value as RequirementStage,
                          )
                        }
                        value={stage}
                      >
                        {Object.entries(stageLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </label>
                    <p className="requirement-gate-summary">
                      当前门禁：{requirement.gateLabel}（{requirement.gateStatus}）
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>}

      {(section === "all" || section === "context") && <section className="project-settings-section">
        {section === "all" && <button
          aria-expanded={openSection === "assets"}
          className="project-settings-section-toggle"
          onClick={() => toggleSection("assets")}
          type="button"
        >
          <span>上下文维护</span>
          <ChevronDown size={17} />
        </button>}
        {(section === "context" || openSection === "assets") && (
          <div className="project-settings-section-content project-settings-assets">
            {assetSections.map(({ section, label, description, icon: Icon }) => (
              <div className="project-settings-asset" key={section}>
                <span><Icon size={16} /></span>
                <div><strong>{label}</strong><small>{description}</small></div>
                <button
                  aria-label={`管理全部${label}`}
                  disabled={!capabilities.canManageAssets}
                  onClick={() => onOpenAsset(section)}
                  type="button"
                >管理全部</button>
              </div>
            ))}
          </div>
        )}
      </section>}
    </section>
  );
}
