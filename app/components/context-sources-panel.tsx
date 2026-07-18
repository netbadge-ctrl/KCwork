import type {
  ContextSource,
  ContextSourceKind,
  ContextSourceStatus,
} from "../lib/types";

export interface ContextSourcesPanelProps {
  sources: ContextSource[];
  selectedIds: string[];
  lockedIds: string[];
  onToggle(sourceId: string): void;
  onToggleLock(sourceId: string): void;
}

const kindLabels: Record<ContextSourceKind, string> = {
  requirement: "需求",
  document: "文档",
  prototype: "原型",
  memory: "项目记忆",
  repository: "代码库",
  test: "测试资产",
};

const statusLabels: Record<ContextSourceStatus, string> = {
  available: "当前可用",
  syncing: "正在同步",
  unavailable: "当前不可用",
};

export function ContextSourcesPanel({
  sources,
  selectedIds,
  lockedIds,
  onToggle,
  onToggleLock,
}: ContextSourcesPanelProps) {
  const groups = sources.reduce<Partial<Record<ContextSourceKind, ContextSource[]>>>(
    (groupedSources, source) => {
      groupedSources[source.kind] = [...(groupedSources[source.kind] ?? []), source];
      return groupedSources;
    },
    {},
  );

  return (
    <section className="context-sources-panel">
      <div className="context-sources-summary">
        <p className="eyebrow">Agent context</p>
        <h3>本次自动引用 {selectedIds.length} 项上下文</h3>
        <p>可调整本次 Agent 工作引用的上下文，并锁定需要持续保留的项目记忆。</p>
      </div>

      {Object.entries(groups).map(([kind, groupSources]) => (
        <section className="context-source-group" key={kind}>
          <h4>{kindLabels[kind as ContextSourceKind]}</h4>
          {groupSources?.map((source) => {
            const isSelected = selectedIds.includes(source.id);
            const isLocked = lockedIds.includes(source.id);
            const isUnavailable = source.status === "unavailable";

            return (
              <article className="context-source-record" key={source.id}>
                <label className="context-source-selection">
                  <input
                    aria-label={`引用${source.name}`}
                    checked={isSelected}
                    disabled={isUnavailable}
                    onChange={() => onToggle(source.id)}
                    type="checkbox"
                  />
                  <span>
                    <strong>{source.name}</strong>
                    <small>{source.detail}</small>
                  </span>
                </label>
                <div className="context-source-actions">
                  <span className={`context-source-status ${source.status}`}>
                    {statusLabels[source.status]}
                  </span>
                  <button
                    aria-label={`${isLocked ? "解除锁定" : "锁定"}${source.name}`}
                    className={isLocked ? "context-lock is-locked" : "context-lock"}
                    onClick={() => onToggleLock(source.id)}
                    type="button"
                  >
                    {isLocked ? "已锁定" : "锁定"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ))}
    </section>
  );
}
