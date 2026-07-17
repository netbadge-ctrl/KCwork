import {
  Bot,
  BrainCircuit,
  ChevronRight,
  Database,
  GitBranch,
  PlugZap,
  Search,
} from "lucide-react";
import { useState } from "react";
import type { Agent, AssetItem, AssetKind } from "../lib/types";

export interface AssetsViewProps {
  agents: Agent[];
  assets: AssetItem[];
}

const tabs: { label: string; kind: AssetKind; icon: typeof Bot }[] = [
  { label: "Agent", kind: "agent", icon: Bot },
  { label: "知识库", kind: "knowledge", icon: Database },
  { label: "记忆库", kind: "memory", icon: BrainCircuit },
  { label: "代码库", kind: "repository", icon: GitBranch },
  { label: "工具", kind: "tool", icon: PlugZap },
];

export function AssetsView({ agents, assets }: AssetsViewProps) {
  const [activeKind, setActiveKind] = useState<AssetKind>("agent");
  const [query, setQuery] = useState("");
  const visibleAssets = assets.filter(
    (asset) =>
      asset.kind === activeKind &&
      `${asset.name}${asset.description}`.includes(query),
  );

  return (
    <div className="assets-view page-scroll">
      <header className="page-header">
        <div>
          <p className="eyebrow">企业能力底座</p>
          <h1>智能资产</h1>
          <p>统一管理可用 Agent、知识、记忆、代码库与工具连接。</p>
        </div>
        <button className="primary-button" type="button">添加资产</button>
      </header>
      <div className="asset-tabs" role="tablist" aria-label="资产分类">
        {tabs.map(({ label, kind, icon: Icon }) => (
          <button
            aria-selected={activeKind === kind}
            className={activeKind === kind ? "active" : ""}
            key={kind}
            onClick={() => setActiveKind(kind)}
            role="tab"
            type="button"
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>
      <label className="search-box compact">
        <Search size={16} />
        <input
          aria-label="搜索智能资产"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索当前分类"
          value={query}
        />
      </label>

      {activeKind === "agent" ? (
        <div className="asset-grid agent-assets">
          {agents.filter((agent) => agent.name.includes(query)).map((agent) => (
            <article className="asset-card" key={agent.id}>
              <div className="asset-card-top">
                <span className="agent-avatar large">{agent.shortName}</span>
                <span className="status-badge success">已启用</span>
              </div>
              <p className="asset-category">{agent.category}</p>
              <h2>{agent.name}</h2>
              <p>{agent.description}</p>
              <button type="button">查看能力 <ChevronRight size={15} /></button>
            </article>
          ))}
        </div>
      ) : (
        <div className="asset-grid">
          {visibleAssets.map((asset) => (
            <article className="asset-card" key={asset.id}>
              <div className="asset-card-top">
                <span className="asset-kind-icon">
                  {activeKind === "knowledge" && <Database size={19} />}
                  {activeKind === "memory" && <BrainCircuit size={19} />}
                  {activeKind === "repository" && <GitBranch size={19} />}
                  {activeKind === "tool" && <PlugZap size={19} />}
                </span>
                <span className="status-badge success">{asset.status}</span>
              </div>
              <h2>{asset.name}</h2>
              <p>{asset.description}</p>
              <div className="asset-meta"><span>{asset.meta}</span><ChevronRight size={15} /></div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
