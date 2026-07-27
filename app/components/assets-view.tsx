import {
  Bot,
  BrainCircuit,
  ChevronRight,
  Database,
  GitBranch,
  Plus,
  Puzzle,
  PlugZap,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Agent, AssetItem, AssetKind } from "../lib/types";
import { AssetAddForm, assetAddConfigs } from "./asset-add-form";
import { KnowledgeMemoryWorkspace } from "./knowledge-memory-workspace";

export interface AssetsViewProps {
  agents: Agent[];
  assets: AssetItem[];
}

const tabs: { label: string; kind: AssetKind; icon: typeof Bot }[] = [
  { label: "Skill", kind: "skill", icon: Sparkles },
  { label: "插件", kind: "plugin", icon: Puzzle },
  { label: "MCP", kind: "tool", icon: PlugZap },
  { label: "Agent", kind: "agent", icon: Bot },
  { label: "代码库", kind: "repository", icon: GitBranch },
  { label: "知识库", kind: "knowledge", icon: Database },
  { label: "记忆库", kind: "memory", icon: BrainCircuit },
];

export function AssetsView({ agents, assets }: AssetsViewProps) {
  const [activeKind, setActiveKind] = useState<AssetKind>("skill");
  const [query, setQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [customAssets, setCustomAssets] = useState<AssetItem[]>([]);
  const [enabledAssets, setEnabledAssets] = useState<Record<string, boolean>>(
    () => Object.fromEntries(assets.map((asset) => [asset.id, asset.enabled ?? true])),
  );
  const allAssets = [...assets, ...customAssets];
  const visibleAssets = allAssets.filter(
    (asset) =>
      asset.kind === activeKind &&
      `${asset.name}${asset.description}`.includes(query),
  );

  const addAsset = (asset: AssetItem) => {
    setCustomAssets((current) => [...current, asset]);
    setIsAdding(false);
  };

  useEffect(() => {
    if (!isAdding) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAdding(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isAdding]);

  const addConfig = assetAddConfigs[activeKind];

  return (
    <div className="assets-view page-scroll">
      <header className="page-header">
        <div>
          <p className="eyebrow">企业能力底座</p>
          <h1>智能资产</h1>
          <p>让 Agent 复用 Skill、插件、知识、记忆和项目上下文。</p>
        </div>
      </header>
      <div className="asset-tabs" role="tablist" aria-label="资产分类">
        {tabs.map(({ label, kind, icon: Icon }) => (
          <button
            aria-selected={activeKind === kind}
            className={activeKind === kind ? "active" : ""}
            key={kind}
            onClick={() => {
              setActiveKind(kind);
              setIsAdding(false);
              setQuery("");
            }}
            role="tab"
            type="button"
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>
      <div className="asset-tab-toolbar">
        <label className="search-box compact">
          <Search size={16} />
          <input
            aria-label="搜索智能资产"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索当前分类"
            value={query}
          />
        </label>
        <button className="primary-button" onClick={() => setIsAdding(true)} type="button">
          <Plus size={15} /> 添加
        </button>
      </div>
      {isAdding && (
        <div
          className="asset-add-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsAdding(false);
          }}
        >
          <aside
            aria-labelledby="asset-add-title"
            aria-modal="true"
            className="asset-add-drawer"
            role="dialog"
          >
            <header className="asset-add-drawer-header">
              <div>
                <p>{addConfig.eyebrow}</p>
                <h2 id="asset-add-title">{addConfig.title}</h2>
                <span>{addConfig.description}</span>
              </div>
              <button aria-label="关闭添加页面" className="icon-button" onClick={() => setIsAdding(false)} type="button">
                <X size={18} />
              </button>
            </header>
            <div className="asset-add-drawer-body">
              <AssetAddForm
                kind={activeKind}
                onAdd={addAsset}
                onCancel={() => setIsAdding(false)}
              />
            </div>
          </aside>
        </div>
      )}

      {activeKind === "knowledge" || activeKind === "memory" ? (
        <KnowledgeMemoryWorkspace assets={visibleAssets} kind={activeKind} query={query} />
      ) : activeKind === "agent" ? (
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
          {visibleAssets.map((asset) => (
            <article className="asset-card" key={asset.id}>
              <div className="asset-card-top">
                <span className="agent-avatar large">{asset.name.slice(0, 1)}</span>
                <span className="status-badge success">已启用</span>
              </div>
              <p className="asset-category">自定义 Agent</p>
              <h2>{asset.name}</h2>
              <p>{asset.description}</p>
              <div className="asset-meta"><span>{asset.meta}</span><ChevronRight size={15} /></div>
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
                  {activeKind === "skill" && <Sparkles size={19} />}
                  {activeKind === "plugin" && <Puzzle size={19} />}
                </span>
                {(activeKind === "skill" || activeKind === "plugin") ? (
                  <button
                    aria-label={`${enabledAssets[asset.id] ?? true ? "停用" : "启用"}${asset.name}`}
                    className={`asset-toggle ${enabledAssets[asset.id] ?? true ? "active" : ""}`}
                    onClick={() => setEnabledAssets((current) => ({
                      ...current,
                      [asset.id]: !(current[asset.id] ?? true),
                    }))}
                    type="button"
                  >
                    {enabledAssets[asset.id] ?? true ? "已启用" : "启用"}
                  </button>
                ) : (
                  <span className="status-badge success">{asset.status}</span>
                )}
              </div>
              <h2>{asset.name}</h2>
              <p>{asset.description}</p>
              {asset.scope && (
                <div className="asset-detail-line">
                  <span>{asset.scope}</span><small>{asset.trigger}</small>
                </div>
              )}
              {asset.capabilities && (
                <div className="asset-capabilities">
                  {asset.capabilities.map((capability) => <span key={capability}>{capability}</span>)}
                </div>
              )}
              <div className="asset-meta"><span>{asset.meta}</span><ChevronRight size={15} /></div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
