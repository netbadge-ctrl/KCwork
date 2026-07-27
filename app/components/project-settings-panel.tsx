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
  { section: "memory", label: "项目知识与记忆", description: "系统知识、多人决策与长期上下文", icon: Database },
  { section: "repositories", label: "代码库", description: "关联仓库与索引状态", icon: GitBranch },
  { section: "tests", label: "测试资产", description: "测试用例、报告与质量状态", icon: TestTube2 },
];

export interface ProjectSettingsPanelProps {
  section?: "all" | "governance" | "context";
  members: ProjectMember[];
  memberRoles: Record<string, ProjectRole[]>;
  requirements: Requirement[];
  requirementStages: Record<string, RequirementStage>;
  capabilities: ProjectCapabilities;
  currentRoles: ProjectRole[];
  onChangeMemberRole(memberId: string, roles: ProjectRole[]): void;
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
  currentRoles,
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
          {currentRoles.includes("viewer")
            ? "当前角色仅可查看"
            : `当前角色：${currentRoles.map((r) => projectRoleLabels[r]).join("、")}`}
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
