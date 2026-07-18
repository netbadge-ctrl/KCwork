import { Plus, UserRoundCog } from "lucide-react";
import type { ProjectMember, ProjectRole } from "../lib/types";

const roleLabels: Record<ProjectRole, string> = {
  admin: "项目管理员",
  product: "产品",
  development: "研发",
  testing: "测试",
  viewer: "观察者",
};

export interface MemberManagerProps {
  members: ProjectMember[];
  roles: Record<string, ProjectRole>;
  canManage?: boolean;
  onChangeRole(memberId: string, role: ProjectRole): void;
}

export function MemberManager({
  members,
  roles,
  canManage = true,
  onChangeRole,
}: MemberManagerProps) {
  return (
    <div className="member-manager">
      <div className="member-manager-summary">
        <span><UserRoundCog size={18} /></span>
        <div>
          <strong>{members.length} 位成员</strong>
          <small>项目成员可查看全部需求、代码和测试进展</small>
        </div>
        <button disabled={!canManage} type="button"><Plus size={15} /> 添加成员</button>
      </div>
      <div className="member-list">
        {members.map((member) => (
          <div className="member-row" key={member.id}>
            <span className="member-avatar">{member.initials}</span>
            <span className="member-identity">
              <strong>{member.name}</strong>
              <small>{member.team}</small>
            </span>
            <select
              aria-label={`修改${member.name}的项目角色`}
              className="member-role-select"
              disabled={!canManage}
              onChange={(event) =>
                onChangeRole(member.id, event.target.value as ProjectRole)
              }
              value={roles[member.id] ?? member.role}
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <p className="member-visibility-note">
        角色仅控制编辑范围，不影响项目内容可见性。
      </p>
    </div>
  );
}
