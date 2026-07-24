import { projectMembers, requirements } from "./demo-data";

export interface ParticipantInvestment {
  participantId: string;
  name: string;
  initials: string;
  digital: boolean;
  token: number;
  conversations: number;
  minutes: number;
}

export interface RequirementInvestment {
  requirementId: string;
  totalToken: number;
  totalMinutes: number;
  totalConversations: number;
  participants: ParticipantInvestment[];
}

export interface RequirementInvestmentSummary {
  requirementId: string;
  title: string;
  totalToken: number;
  totalMinutes: number;
  totalConversations: number;
  participants: ParticipantInvestment[];
}

export interface ProjectInvestment {
  projectId: string;
  totalToken: number;
  totalMinutes: number;
  totalConversations: number;
  requirements: RequirementInvestmentSummary[];
  participants: ParticipantInvestment[];
}

interface RawInvestment {
  participantId: string;
  token: number;
  conversations: number;
  minutes: number;
}

// 确定性种子数据:每个需求下相关参与人(成员 + 数字人)的投入指标。
const seed: Record<string, RawInvestment[]> = {
  "role-permissions": [
    { participantId: "member-chen", token: 184000, conversations: 23, minutes: 145 },
    { participantId: "member-lin", token: 96000, conversations: 12, minutes: 88 },
    { participantId: "member-zhou", token: 42000, conversations: 8, minutes: 40 },
    { participantId: "member-digital-portal", token: 312000, conversations: 41, minutes: 210 },
  ],
  "sso-login": [
    { participantId: "member-gu", token: 78000, conversations: 11, minutes: 52 },
    { participantId: "member-zhao", token: 121000, conversations: 15, minutes: 96 },
    { participantId: "member-digital-portal", token: 205000, conversations: 28, minutes: 132 },
  ],
  "audit-export": [
    { participantId: "member-chen", token: 54000, conversations: 7, minutes: 38 },
    { participantId: "member-zhou", token: 33000, conversations: 5, minutes: 22 },
    { participantId: "member-digital-portal", token: 138000, conversations: 19, minutes: 84 },
  ],
};

function resolveParticipant(raw: RawInvestment): ParticipantInvestment | null {
  const member = projectMembers.find((m) => m.id === raw.participantId);
  if (!member) return null;
  return {
    participantId: raw.participantId,
    name: member.name,
    initials: member.initials,
    digital: Boolean(member.digital),
    token: raw.token,
    conversations: raw.conversations,
    minutes: raw.minutes,
  };
}

function sumParticipants(participants: ParticipantInvestment[]) {
  return {
    totalToken: participants.reduce((sum, p) => sum + p.token, 0),
    totalMinutes: participants.reduce((sum, p) => sum + p.minutes, 0),
    totalConversations: participants.reduce((sum, p) => sum + p.conversations, 0),
  };
}

export function getRequirementInvestment(requirementId: string): RequirementInvestment {
  const raw = seed[requirementId] ?? [];
  const participants = raw
    .map(resolveParticipant)
    .filter((p): p is ParticipantInvestment => p !== null)
    .sort((a, b) => b.token - a.token);
  return { requirementId, participants, ...sumParticipants(participants) };
}

export function getProjectInvestment(projectId: string): ProjectInvestment {
  const projectRequirements = requirements.filter((r) => r.projectId === projectId);
  const requirementSummaries: RequirementInvestmentSummary[] = projectRequirements.map((r) => {
    const inv = getRequirementInvestment(r.id);
    return {
      requirementId: r.id,
      title: r.title,
      totalToken: inv.totalToken,
      totalMinutes: inv.totalMinutes,
      totalConversations: inv.totalConversations,
      participants: inv.participants,
    };
  });

  const byId = new Map<string, ParticipantInvestment>();
  for (const summary of requirementSummaries) {
    for (const p of summary.participants) {
      const current = byId.get(p.participantId);
      if (current) {
        current.token += p.token;
        current.conversations += p.conversations;
        current.minutes += p.minutes;
      } else {
        byId.set(p.participantId, { ...p });
      }
    }
  }
  const participants = [...byId.values()].sort((a, b) => b.token - a.token);

  return {
    projectId,
    requirements: requirementSummaries,
    participants,
    totalToken: requirementSummaries.reduce((sum, r) => sum + r.totalToken, 0),
    totalMinutes: requirementSummaries.reduce((sum, r) => sum + r.totalMinutes, 0),
    totalConversations: requirementSummaries.reduce((sum, r) => sum + r.totalConversations, 0),
  };
}
