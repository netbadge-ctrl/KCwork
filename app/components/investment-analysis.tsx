import { Bot, ChevronDown, Coins, MessageSquare, Timer } from "lucide-react";
import { useState } from "react";
import {
  getProjectInvestment,
  getRequirementInvestment,
  type ParticipantInvestment,
} from "../lib/investment-data";

function formatToken(token: number): string {
  if (token >= 1000) return `${Math.round(token / 1000)}k`;
  return String(token);
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours > 0 && rest > 0) return `${hours}h ${rest}m`;
  if (hours > 0) return `${hours}h`;
  return `${rest}m`;
}

function ParticipantAvatar({ participant }: { participant: ParticipantInvestment }) {
  return (
    <span className={`investment-avatar${participant.digital ? " digital" : ""}`}>
      {participant.digital ? <Bot size={14} /> : participant.initials}
    </span>
  );
}

function InvestmentTable({ participants }: { participants: ParticipantInvestment[] }) {
  return (
    <table className="investment-table">
      <thead>
        <tr>
          <th>参与人</th>
          <th><Coins size={12} /> Token 消耗</th>
          <th><MessageSquare size={12} /> 对话次数</th>
          <th><Timer size={12} /> 投入时长</th>
        </tr>
      </thead>
      <tbody>
        {participants.map((p) => (
          <tr key={p.participantId}>
            <td>
              <ParticipantAvatar participant={p} />
              <span>{p.name}{p.digital ? " · 数字人" : ""}</span>
            </td>
            <td>{formatToken(p.token)}</td>
            <td>{p.conversations}</td>
            <td>{formatDuration(p.minutes)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InvestmentTotals({
  totalToken,
  totalMinutes,
  totalConversations,
}: {
  totalToken: number;
  totalMinutes: number;
  totalConversations: number;
}) {
  return (
    <div className="investment-totals">
      <span><Coins size={13} /> 总 Token <b>{formatToken(totalToken)}</b></span>
      <span><MessageSquare size={13} /> 总对话 <b>{totalConversations}</b></span>
      <span><Timer size={13} /> 总时长 <b>{formatDuration(totalMinutes)}</b></span>
    </div>
  );
}

export function RequirementInvestmentCard({ requirementId }: { requirementId: string }) {
  const investment = getRequirementInvestment(requirementId);
  if (investment.participants.length === 0) return null;
  return (
    <section className="investment-card">
      <header><h3>投入分析</h3><InvestmentTotals totalToken={investment.totalToken} totalMinutes={investment.totalMinutes} totalConversations={investment.totalConversations} /></header>
      <InvestmentTable participants={investment.participants} />
    </section>
  );
}

export function ProjectInvestmentCard({ projectId }: { projectId: string }) {
  const investment = getProjectInvestment(projectId);
  const [expanded, setExpanded] = useState<string | null>(investment.requirements[0]?.requirementId ?? null);
  if (investment.requirements.length === 0) return null;
  return (
    <section className="investment-card project-investment-card">
      <header>
        <h3>投入分析</h3>
        <InvestmentTotals totalToken={investment.totalToken} totalMinutes={investment.totalMinutes} totalConversations={investment.totalConversations} />
      </header>
      <div className="investment-requirements">
        {investment.requirements.map((req) => {
          const isOpen = expanded === req.requirementId;
          return (
            <div className="investment-requirement" key={req.requirementId}>
              <button
                className="investment-requirement-head"
                onClick={() => setExpanded(isOpen ? null : req.requirementId)}
                type="button"
              >
                <ChevronDown size={13} className={isOpen ? "open" : ""} />
                <span>{req.title}</span>
                <small>{formatToken(req.totalToken)} · {formatDuration(req.totalMinutes)} · {req.totalConversations} 对话</small>
              </button>
              {isOpen && <InvestmentTable participants={req.participants} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
