import type {
  ContextSource,
  ContextSourceKind,
  ContextSourceStatus,
} from "../lib/types";

export interface ContextSourcesPanelProps {
  sources: ContextSource[];
  selectedIds: string[];
  lockedIds: string[];
  canEdit: boolean;
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
  canEdit,
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
        <p className="eyebrow">会话上下文</p>
        <h3>Agent 正在引用 {selectedIds.length} 项资料</h3>
        <p>这里仅展示本次对话会用到的项目知识、记忆、文档与交付物；调整后只影响当前会话。</p>
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
                    disabled={!canEdit || isUnavailable || isLocked}
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
                    disabled={!canEdit || isUnavailable}
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
