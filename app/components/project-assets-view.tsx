import {
  ArrowLeft,
  BookOpen,
  FileText,
  FlaskConical,
  GitBranch,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ProductDocument, ProjectSection, Requirement } from "../lib/types";
import { ProjectKnowledgeMemory } from "./project-knowledge-memory";

const sectionLabels: Record<Exclude<ProjectSection, "overview">, string> = {
  documents: "产品文档",
  memory: "项目知识与记忆",
  repositories: "代码库",
  tests: "测试资产",
};

const staticAssets = {
  memory: [
    { id: "memory-role-boundary", name: "角色权限范围决策", meta: "已确认 · 引用 3 份需求", status: "有效" },
    { id: "memory-audit", name: "审计数据保留周期", meta: "陈楠 · 昨天确认", status: "有效" },
    { id: "memory-sso", name: "SSO 异常处理约定", meta: "引用 REQ-029", status: "待更新" },
  ],
  repositories: [
    { id: "repo-portal", name: "customer-portal", meta: "main · 8 分钟前完成索引", status: "可用" },
    { id: "repo-service", name: "portal-service", meta: "main · 关联 2 份需求", status: "可用" },
    { id: "repo-e2e", name: "portal-e2e", meta: "release/3.2 · 42 个场景", status: "可用" },
  ],
  tests: [
    { id: "report-role-regression", name: "角色管理回归测试报告", meta: "REQ-032 · 92% 通过", status: "有失败" },
    { id: "report-sso-regression", name: "SSO 登录端到端用例", meta: "REQ-029 · 34 个用例", status: "执行中" },
    { id: "test-permission", name: "权限接口契约测试", meta: "自动化 · 最近通过", status: "已通过" },
  ],
};

export interface ProjectAssetsViewProps {
  section: Exclude<ProjectSection, "overview">;
  documents: ProductDocument[];
  requirements: Requirement[];
  onOpenPreview(assetId: string, kind: "prd" | "prototype" | "asset" | "test"): void;
  onBack(): void;
}

export function ProjectAssetsView({
  section,
  documents,
  requirements,
  onOpenPreview,
  onBack,
}: ProjectAssetsViewProps) {
  const [query, setQuery] = useState("");
  const label = sectionLabels[section];
  const rows = useMemo(() => {
    if (section === "documents") {
      return documents.map((document) => ({
        id: document.id,
        name: document.title,
        meta: `${document.version} · ${requirements.find((item) => item.id === document.requirementId)?.code ?? "未关联"} · ${document.updatedAt}`,
        status: document.status === "changed" ? "有变更" : "已确认",
        kind: document.kind,
      }));
    }
    return staticAssets[section].map((asset) => ({ ...asset, kind: "asset" as const }));
  }, [documents, requirements, section]);
  const filteredRows = rows.filter((row) =>
    `${row.name}${row.meta}`.toLowerCase().includes(query.toLowerCase()),
  );

  const HeaderIcon = section === "documents"
    ? FileText
    : section === "memory"
      ? BookOpen
      : section === "repositories"
        ? GitBranch
        : FlaskConical;

  return (
    <div className="asset-browser page-scroll">
      <header className="page-header asset-browser-header">
        <div>
          <button className="back-button" onClick={onBack} type="button">
            <ArrowLeft size={17} /> 返回项目
          </button>
          <p className="eyebrow">项目共享资产</p>
          <h1><HeaderIcon size={24} /> {label}</h1>
          <p>{section === "memory" ? "维护系统长期上下文，并控制哪些知识与多人记忆可以被 Agent 使用。" : "查看、编辑并追踪资产与需求之间的引用关系。"}</p>
        </div>
        {section !== "memory" && <button className="primary-button" type="button"><Plus size={16} /> 新建{label}</button>}
      </header>

      <label className="search-box asset-search">
        <Search size={17} />
        <input
          aria-label={`搜索${label}`}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`搜索${label}名称或关联需求`}
          value={query}
        />
      </label>

      {section === "memory" ? <ProjectKnowledgeMemory query={query} /> : <div className="project-asset-list">
        {filteredRows.map((row) => (
          <article className="project-asset-row" key={row.id}>
            <span className="project-asset-icon"><HeaderIcon size={18} /></span>
            <span className="project-asset-copy">
              <strong>{row.name}</strong>
              <small>{row.meta}</small>
            </span>
            <span className="asset-status">{row.status}</span>
            <span className="asset-row-actions">
              <button
                aria-label={`查看${row.name}`}
                onClick={() =>
                  onOpenPreview(
                    row.id,
                    section === "tests"
                      ? "test"
                      : row.kind === "prototype"
                        ? "prototype"
                        : row.kind === "prd"
                          ? "prd"
                          : "asset",
                  )
                }
                type="button"
              >查看</button>
              <button
                aria-label={`编辑${row.name}`}
                onClick={() => onOpenPreview(row.id, "asset")}
                type="button"
              ><Pencil size={14} /> 编辑</button>
            </span>
          </article>
        ))}
      </div>}
    </div>
  );
}
