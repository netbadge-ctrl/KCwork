import { Bot, Plus, UserRoundCog } from "lucide-react";
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
  roles: Record<string, ProjectRole[]>;
  canManage?: boolean;
  onChangeRole(memberId: string, roles: ProjectRole[]): void;
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
          <div className={`member-row${member.digital ? " digital" : ""}`} key={member.id}>
            <span className="member-avatar">{member.digital ? <Bot size={16} /> : member.initials}</span>
            <span className="member-identity">
              <strong>{member.name}</strong>
              <small>{member.team}</small>
            </span>
            {member.digital ? (
              <span className="member-role-digital" aria-label={`${member.name}为数字人，不可调整角色`}>数字人</span>
            ) : (
              <div className="member-role-chips" aria-label={`修改${member.name}的项目角色`}>
                {Object.entries(roleLabels).map(([value, label]) => {
                  const current = roles[member.id] ?? member.roles;
                  const active = current.includes(value as ProjectRole);
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!canManage}
                      className={`member-role-chip${active ? " active" : ""}`}
                      aria-pressed={active}
                      aria-label={`${label}${active ? "（已选）" : ""}`}
                      onClick={() => {
                        const next = active
                          ? current.filter((r) => r !== value)
                          : [...current, value as ProjectRole];
                        onChangeRole(member.id, next);
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="member-visibility-note">
        角色仅控制编辑范围，不影响项目内容可见性。
      </p>
    </div>
  );
}
