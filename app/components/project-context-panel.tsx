import { Boxes, FileText, GitBranch, TestTube2 } from "lucide-react";
import type { ReactNode } from "react";
import type {
  ContextSource,
  Project,
  ProjectSection,
  Requirement,
} from "../lib/types";

type ProjectContextPanelKind = "repositories" | "requirements" | "tests" | "context";

interface ProjectContextPanelProps {
  kind: ProjectContextPanelKind;
  project: Project;
  requirements: Requirement[];
  sources: ContextSource[];
  onOpenAsset(section: Exclude<ProjectSection, "overview">): void;
}

export function ProjectContextPanel({
  kind,
  project,
  requirements,
  sources,
  onOpenAsset,
}: ProjectContextPanelProps) {
  if (kind === "repositories") {
    return (
      <section className="project-context-panel">
        <PanelSummary icon={<GitBranch size={18} />} label="已连接代码仓库" value={`${project.repositories?.length ?? 0} 个`} />
        <div className="project-context-items">
          {(project.repositories ?? []).map((repository, index) => (
            <article key={repository}>
              <div><strong>{repository}</strong><small>{index === 0 ? "主仓库" : "关联服务"}</small></div>
              <span>main · 已完成索引</span>
            </article>
          ))}
          {!project.repositories?.length && <EmptyLine text="尚未连接代码仓库" />}
        </div>
        <button className="drawer-wide-action" onClick={() => onOpenAsset("repositories")} type="button">查看和维护代码库</button>
      </section>
    );
  }

  if (kind === "requirements") {
    return (
      <section className="project-context-panel">
        <PanelSummary icon={<FileText size={18} />} label="同步产品需求" value={`${project.historicalRequirementCount ?? requirements.length} 项`} />
        <p className="project-context-source">{project.requirementSource ?? "当前项目需求空间"} · 自动同步</p>
        <div className="project-context-items">
          {requirements.map((requirement) => (
            <article key={requirement.id}>
              <div><strong>{requirement.title}</strong><small>{requirement.code} · Spec {requirement.specVersion}</small></div>
              <span>{requirement.updatedAt}</span>
            </article>
          ))}
          {requirements.length === 0 && <EmptyLine text="已连接需求来源，暂无进行中的新需求" />}
        </div>
        <button className="drawer-wide-action" onClick={() => onOpenAsset("documents")} type="button">查看产品文档与需求资产</button>
      </section>
    );
  }

  if (kind === "tests") {
    const activeTestCount = requirements.reduce((total, requirement) => total + requirement.counts.tests, 0);
    return (
      <section className="project-context-panel">
        <PanelSummary icon={<TestTube2 size={18} />} label="已同步测试用例" value={`${project.testCaseCount ?? activeTestCount} 条`} />
        <p className="project-context-source">{project.testSuite ?? "尚未连接测试资产集"} · 自动同步</p>
        <div className="project-context-items">
          {requirements.filter((requirement) => requirement.counts.tests > 0).map((requirement) => (
            <article key={requirement.id}>
              <div><strong>{requirement.title}</strong><small>{requirement.code}</small></div>
              <span>{requirement.counts.tests} 条关联用例</span>
            </article>
          ))}
          {activeTestCount === 0 && <EmptyLine text="当前需求尚未产生新增测试用例" />}
        </div>
        <button className="drawer-wide-action" onClick={() => onOpenAsset("tests")} type="button">查看和维护测试资产</button>
      </section>
    );
  }

  const sharedSources = sources.filter((source) => !source.requirementId);
  return (
    <section className="project-context-panel">
      <PanelSummary icon={<Boxes size={18} />} label="Agent 共享上下文" value={`${project.contextCount} 项`} />
      <div className="project-context-tags">
        {(project.contextAssets ?? []).map((asset) => <span key={asset}>{asset}</span>)}
      </div>
      <div className="project-context-items">
        {sharedSources.map((source) => (
          <article key={source.id}>
            <div><strong>{source.name}</strong><small>{source.detail}</small></div>
            <span>{source.status === "available" ? "可用" : "同步中"}</span>
          </article>
        ))}
        {sharedSources.length === 0 && <EmptyLine text="尚未连接项目级共享上下文" />}
      </div>
      <button className="drawer-wide-action" onClick={() => onOpenAsset("memory")} type="button">维护知识与项目记忆</button>
    </section>
  );
}

function PanelSummary({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="project-context-summary">
      <span>{icon}</span>
      <div><small>{label}</small><strong>{value}</strong></div>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="project-context-empty">{text}</p>;
}
