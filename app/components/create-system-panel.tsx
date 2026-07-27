import { Check, Database, FileText, GitBranch, Link2, TestTube2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type { AssetItem, Project } from "../lib/types";

interface CreateSystemPanelProps {
  assets: AssetItem[];
  onCreate(project: Project): void;
  onOpenAssets(): void;
}

const requirementSources = [
  {
    id: "requirements-customer",
    label: "客户门户产品",
    provider: "企业需求平台",
    count: 38,
    syncedAt: "6 分钟前同步",
  },
  {
    id: "requirements-finance",
    label: "财务数字化产品",
    provider: "企业需求平台",
    count: 24,
    syncedAt: "昨天同步",
  },
];

const testSources = [
  {
    id: "tests-customer",
    label: "客户门户核心回归集",
    provider: "企业测试平台",
    count: 286,
    syncedAt: "12 分钟前同步",
  },
  {
    id: "tests-identity",
    label: "身份服务回归集",
    provider: "企业测试平台",
    count: 128,
    syncedAt: "昨天同步",
  },
];

function systemCodeFromName(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "enterprise-system";
}

export function CreateSystemPanel({
  assets,
  onCreate,
  onOpenAssets,
}: CreateSystemPanelProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemCode, setSystemCode] = useState("enterprise-system");
  const [systemCodeEdited, setSystemCodeEdited] = useState(false);
  const [repositoryIds, setRepositoryIds] = useState<string[]>([]);
  const [requirementSourceId, setRequirementSourceId] = useState<string | null>(null);
  const [testSourceId, setTestSourceId] = useState<string | null>(null);
  const [contextIds, setContextIds] = useState<string[]>([]);

  const repositories = useMemo(
    () => assets.filter((asset) => asset.kind === "repository"),
    [assets],
  );
  const contextAssets = useMemo(
    () => assets.filter((asset) => asset.kind === "knowledge" || asset.kind === "memory"),
    [assets],
  );
  const selectedRequirementSource = requirementSources.find(
    (source) => source.id === requirementSourceId,
  );
  const selectedTestSource = testSources.find(
    (source) => source.id === testSourceId,
  );

  const toggle = (id: string, values: string[], setValues: (next: string[]) => void) => {
    setValues(values.includes(id) ? values.filter((item) => item !== id) : [...values, id]);
  };

  const create = () => {
    if (!name.trim()) return;
    const selectedRepositories = repositories.filter((asset) => repositoryIds.includes(asset.id));
    const selectedContexts = contextAssets.filter((asset) => contextIds.includes(asset.id));
    onCreate({
      id: `project-${Date.now()}`,
      name: name.trim(),
      systemCode: systemCode.trim() || systemCodeFromName(name),
      description: description.trim() || "持续迭代的企业系统项目",
      members: 1,
      updatedAt: "刚刚",
      contextCount:
        selectedRepositories.length +
        selectedContexts.length +
        Number(Boolean(selectedRequirementSource)) +
        Number(Boolean(selectedTestSource)),
      color: "#7c5cff",
      repositories: selectedRepositories.map((asset) => asset.name),
      requirementSource: selectedRequirementSource
        ? `${selectedRequirementSource.provider} · ${selectedRequirementSource.label}`
        : "未关联需求来源",
      historicalRequirementCount: selectedRequirementSource?.count ?? 0,
      testSuite: selectedTestSource
        ? `${selectedTestSource.provider} · ${selectedTestSource.label}`
        : "未关联测试资产",
      testCaseCount: selectedTestSource?.count ?? 0,
      contextAssets: selectedContexts.map((asset) => asset.name),
    });
  };

  return (
    <form
      className="create-system-panel"
      onSubmit={(event) => {
        event.preventDefault();
        create();
      }}
    >
      <section className="create-system-section">
        <div className="create-system-section-title">
          <span>1</span>
          <div><strong>系统信息</strong><small>只填写系统本身的信息</small></div>
        </div>
        <div className="create-system-fields">
          <label>
            <span>系统名称</span>
            <input
              aria-label="系统名称"
              autoFocus
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);
                if (!systemCodeEdited) setSystemCode(systemCodeFromName(nextName));
              }}
              placeholder="例如：企业客户门户"
              value={name}
            />
          </label>
          <label>
            <span>系统标识</span>
            <input
              aria-label="系统标识"
              onChange={(event) => {
                setSystemCodeEdited(true);
                setSystemCode(event.target.value);
              }}
              value={systemCode}
            />
          </label>
          <label className="wide">
            <span>系统说明</span>
            <textarea
              aria-label="系统说明"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="描述系统服务对象、业务边界和核心能力"
              value={description}
            />
          </label>
        </div>
      </section>

      <ConnectionSection
        icon={<GitBranch size={17} />}
        index="2"
        onOpenAssets={onOpenAssets}
        subtitle="从已连接的代码平台中多选仓库"
        title="代码仓库"
      >
        <div className="connection-option-list">
          {repositories.map((repository) => {
            const selected = repositoryIds.includes(repository.id);
            return (
              <button
                aria-pressed={selected}
                className={`connection-option ${selected ? "selected" : ""}`}
                key={repository.id}
                onClick={() => toggle(repository.id, repositoryIds, setRepositoryIds)}
                type="button"
              >
                <span className="connection-check">{selected && <Check size={13} />}</span>
                <div>
                  <strong>{repository.name}</strong>
                  <small>{repository.id === "portal-repo" ? "GitHub · netbadge-ctrl" : "GitLab · finance-platform"}</small>
                </div>
                <span>{repository.description}</span>
              </button>
            );
          })}
        </div>
      </ConnectionSection>

      <ConnectionSection
        icon={<FileText size={17} />}
        index="3"
        onOpenAssets={onOpenAssets}
        subtitle="选择产品来源，需求数量由平台自动同步"
        title="产品需求"
      >
        <div className="connection-option-list">
          {requirementSources.map((source) => (
            <button
              aria-pressed={requirementSourceId === source.id}
              className={`connection-option ${requirementSourceId === source.id ? "selected" : ""}`}
              key={source.id}
              onClick={() => setRequirementSourceId(requirementSourceId === source.id ? null : source.id)}
              type="button"
            >
              <span className="connection-check">{requirementSourceId === source.id && <Check size={13} />}</span>
              <div><strong>{source.label}</strong><small>{source.provider}</small></div>
              <span>{source.count} 项需求 · {source.syncedAt}</span>
            </button>
          ))}
        </div>
      </ConnectionSection>

      <ConnectionSection
        icon={<TestTube2 size={17} />}
        index="4"
        onOpenAssets={onOpenAssets}
        subtitle="选择测试项目或测试集，用例数量自动同步"
        title="测试资产"
      >
        <div className="connection-option-list">
          {testSources.map((source) => (
            <button
              aria-pressed={testSourceId === source.id}
              className={`connection-option ${testSourceId === source.id ? "selected" : ""}`}
              key={source.id}
              onClick={() => setTestSourceId(testSourceId === source.id ? null : source.id)}
              type="button"
            >
              <span className="connection-check">{testSourceId === source.id && <Check size={13} />}</span>
              <div><strong>{source.label}</strong><small>{source.provider}</small></div>
              <span>{source.count} 条用例 · {source.syncedAt}</span>
            </button>
          ))}
        </div>
      </ConnectionSection>

      <ConnectionSection
        icon={<Database size={17} />}
        index="5"
        onOpenAssets={onOpenAssets}
        subtitle="勾选 Agent 可以持续引用的知识与记忆"
        title="共享上下文"
      >
        <div className="connection-option-list">
          {contextAssets.map((asset) => {
            const selected = contextIds.includes(asset.id);
            return (
              <button
                aria-pressed={selected}
                className={`connection-option ${selected ? "selected" : ""}`}
                key={asset.id}
                onClick={() => toggle(asset.id, contextIds, setContextIds)}
                type="button"
              >
                <span className="connection-check">{selected && <Check size={13} />}</span>
                <div><strong>{asset.name}</strong><small>{asset.kind === "knowledge" ? "知识库" : "记忆库"}</small></div>
                <span>{asset.meta}</span>
              </button>
            );
          })}
        </div>
      </ConnectionSection>

      <div className="create-system-summary">
        <div>
          <Link2 size={16} />
          <span>
            将连接 {repositoryIds.length} 个仓库、{selectedRequirementSource?.count ?? 0} 项需求、
            {selectedTestSource?.count ?? 0} 条用例和 {contextIds.length} 项共享上下文
          </span>
        </div>
        <button className="primary-button" disabled={!name.trim()} type="submit">创建系统项目</button>
      </div>
    </form>
  );
}

function ConnectionSection({
  children,
  icon,
  index,
  onOpenAssets,
  subtitle,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  index: string;
  onOpenAssets(): void;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="create-system-section">
      <div className="create-system-section-title">
        <span>{icon}</span>
        <div><strong>{index}. {title}</strong><small>{subtitle}</small></div>
        <button onClick={onOpenAssets} type="button">去智能资产添加连接</button>
      </div>
      {children}
    </section>
  );
}
