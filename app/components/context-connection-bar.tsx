import type { ContextSource, ContextSourceKind } from "../lib/types";

export interface ContextConnectionBarProps {
  sources: ContextSource[];
  selectedIds: string[];
  onOpen(): void;
}

const sourceKindLabels: Record<ContextSourceKind, string> = {
  requirement: "需求",
  document: "文档",
  prototype: "原型",
  memory: "记忆",
  repository: "代码库",
  test: "测试",
};

export function ContextConnectionBar({
  sources,
  selectedIds,
  onOpen,
}: ContextConnectionBarProps) {
  const counts = sources.reduce<Partial<Record<ContextSourceKind, number>>>(
    (current, source) => ({
      ...current,
      [source.kind]: (current[source.kind] ?? 0) + 1,
    }),
    {},
  );
  const groupedCounts = (Object.entries(counts) as [ContextSourceKind, number][])
    .map(([kind, count]) => `${sourceKindLabels[kind]} ${count}`)
    .join(" · ");

  return (
    <section className="context-connection-bar content-section">
      <div>
        <p className="eyebrow">自动连接</p>
        <strong>{sources.length > 0 ? "Agent 已连接项目上下文" : "尚未为该项目连接自动上下文来源"}</strong>
        <span>{groupedCounts || "可在项目设置中维护产品文档、记忆、代码库和测试资产"}</span>
      </div>
      <div>
        <small>{selectedIds.length} 项已自动选择</small>
        <button aria-label="查看自动上下文来源" disabled={sources.length === 0} onClick={onOpen} type="button">
          查看来源
        </button>
      </div>
    </section>
  );
}
