import { ArrowLeft, Boxes, FilePlus2, FileText, GitBranch, TestTube2 } from "lucide-react";
import type {
  Agent,
  AgentWorkSession,
  ContextSource,
  Project,
  Requirement,
  RequirementStage,
} from "../lib/types";
import { AgentRequirementList } from "./agent-requirement-list";
import { ContextConnectionBar } from "./context-connection-bar";
import { RecentAgentWork } from "./recent-agent-work";

export interface ProjectDetailViewProps {
  project: Project;
  sessions: AgentWorkSession[];
  agents: Agent[];
  requirements: Requirement[];
  requirementStages: Record<string, RequirementStage>;
  lastAgentByRequirement: Record<string, string>;
  contextSources: ContextSource[];
  selectedContextIds: string[];
  onBack(): void;
  onResumeSession(sessionId: string): void;
  onOpenRequirement(requirementId: string): void;
  onOpenContext(): void;
  onCreateRequirement(): void;
}

export function ProjectDetailView({
  project,
  sessions,
  agents,
  requirements,
  requirementStages,
  lastAgentByRequirement,
  contextSources,
  selectedContextIds,
  onBack,
  onResumeSession,
  onOpenRequirement,
  onOpenContext,
  onCreateRequirement,
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
        </div>
        <div className="project-meta-row">
          <span>更新于 {project.updatedAt}</span>
          <span>
            {contextSources.length > 0
              ? "Agent 协作上下文已就绪"
              : "项目上下文尚未连接"}
          </span>
        </div>
      </header>

      <section className="system-foundation content-section">
        <div className="system-foundation-heading">
          <div>
            <p className="eyebrow">持续迭代基础</p>
            <h2>系统上下文</h2>
          </div>
          <span>{project.systemCode ?? project.id}</span>
        </div>
        <div className="system-foundation-grid">
          <article>
            <span><GitBranch size={17} /></span>
            <div><strong>代码仓库</strong><small>{project.repositories?.length ?? 0} 个已连接</small></div>
            <p>{project.repositories?.join("、") || "尚未连接代码仓库"}</p>
          </article>
          <article>
            <span><FileText size={17} /></span>
            <div><strong>历史产品需求</strong><small>{project.historicalRequirementCount ?? requirements.length} 项累计需求</small></div>
            <p>{project.requirementSource ?? "当前项目需求空间"}</p>
          </article>
          <article>
            <span><TestTube2 size={17} /></span>
            <div><strong>测试资产</strong><small>{project.testCaseCount ?? 0} 条已有用例</small></div>
            <p>{project.testSuite ?? "尚未连接测试资产集"}</p>
          </article>
          <article>
            <span><Boxes size={17} /></span>
            <div><strong>共享上下文</strong><small>{project.contextCount} 项可供 Agent 引用</small></div>
            <p>{project.contextAssets?.join("、") || "通过右侧上下文维护继续补充"}</p>
          </article>
        </div>
      </section>

      {sessions.length > 0 && (
        <RecentAgentWork agents={agents} onResume={onResumeSession} sessions={sessions} />
      )}
      {requirements.length > 0 ? (
        <AgentRequirementList
          agents={agents}
          lastAgentByRequirement={lastAgentByRequirement}
          onOpen={onOpenRequirement}
          requirements={requirements}
          stages={requirementStages}
        />
      ) : (
        <section className="project-empty-state content-section">
          <span><FilePlus2 size={24} /></span>
          <div>
            <p className="eyebrow">从需求开始</p>
            <h2>还没有需求</h2>
            <p>创建首个需求后，即可在项目边界内选择 Agent 并连接专属上下文。</p>
          </div>
          <button onClick={onCreateRequirement} type="button">新建需求</button>
        </section>
      )}
      <ContextConnectionBar
        onOpen={onOpenContext}
        selectedIds={selectedContextIds}
        sources={contextSources}
      />
    </div>
  );
}
