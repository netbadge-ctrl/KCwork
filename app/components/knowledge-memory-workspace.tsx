import {
  BookOpen,
  Bot,
  Braces,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Database,
  FileText,
  GitBranch,
  Link2,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { AssetItem } from "../lib/types";

type KnowledgeRecord = {
  id: string;
  name: string;
  type: "代码 Wiki" | "业务文档" | "研发规范" | "办公文档";
  description: string;
  source: string;
  owner: string;
  volume: string;
  freshness: string;
  scope: string;
  usage: string;
  citations: string[];
};

type MemoryRecord = {
  id: string;
  title: string;
  content: string;
  scope: "项目" | "团队" | "企业";
  status: "已确认" | "待复核" | "候选";
  contributors: string;
  source: string;
  validity: string;
  usedBy: string;
};

const knowledgeRecords: KnowledgeRecord[] = [
  { id: "code-wiki", name: "核心系统代码 Wiki", type: "代码 Wiki", description: "从仓库结构、符号、接口、依赖和变更记录持续生成，回答代码在哪里、为什么这样设计。", source: "GitHub Enterprise · 12 个仓库", owner: "研发效能组", volume: "18,420 个符号", freshness: "8 分钟前增量同步", scope: "研发中心可用", usage: "研发 Agent 自动优先检索当前仓库及其依赖仓库", citations: ["permission-service / auth/roles.ts", "customer-portal / members/api.ts", "ADR-018 权限域拆分"] },
  { id: "product-docs", name: "产品与业务知识库", type: "业务文档", description: "沉淀产品规范、业务术语、历史 PRD 与跨系统业务规则，供产品和测试 Agent 引用。", source: "企业文档平台 · 6 个空间", owner: "产品运营中心", volume: "286 篇已发布文档", freshness: "今天 09:40 同步", scope: "全员可用", usage: "产品 Agent 默认引用已发布版本，草稿仅在所属项目可见", citations: ["企业权限产品规范 v3", "客户身份术语表", "历史需求 REQ-019"] },
  { id: "engineering-standards", name: "研发与安全规范", type: "研发规范", description: "编码、安全、架构、发布和质量门禁规则，作为生成代码与评审时的强约束来源。", source: "研发规范中心 · 14 个目录", owner: "架构委员会", volume: "194 条有效规则", freshness: "昨天完成校验", scope: "研发中心可用", usage: "前后端 Agent 在生成与审查代码时自动加入强约束", citations: ["TypeScript 编码规范", "API 鉴权基线", "生产发布检查表"] },
  { id: "office-docs", name: "企业办公文档知识库", type: "办公文档", description: "会议纪要、制度、方案和经营材料按权限同步，支持日常办公 Agent 检索与引用。", source: "企业云文档 · 32 个授权目录", owner: "企业信息中心", volume: "1,842 份文档", freshness: "30 分钟前增量同步", scope: "继承原文档权限", usage: "办公 Agent 只检索当前用户有权限访问的内容", citations: ["研发中心周会纪要", "差旅报销制度 2026", "Q3 经营复盘"] },
];

const memoryRecords: MemoryRecord[] = [
  { id: "memory-project-role", title: "角色调整必须保留审计记录", content: "客户门户中的项目管理员、普通成员与观察者角色变更都必须记录操作者、变更前后值及原因。", scope: "项目", status: "已确认", contributors: "陈楠、林川、周祺", source: "REQ-032 评审 · 3 次 Agent 对话", validity: "适用于客户门户 V3.2 及以后", usedBy: "产品、前端、后端、测试 Agent" },
  { id: "memory-team-api", title: "权限接口优先保持向后兼容", content: "权限域接口新增字段时保留旧字段两个版本周期；破坏性变更需要独立 Spec 和迁移说明。", scope: "团队", status: "已确认", contributors: "权限平台研发组 · 6 人", source: "ADR-018 · 4 个已完成需求", validity: "每季度复核", usedBy: "后端开发、代码评审 Agent" },
  { id: "memory-org-terms", title: "企业客户统一称为租户", content: "代码和技术文档使用 tenant，面向客户的产品文案使用企业；不得混用组织、公司等近义词。", scope: "企业", status: "已确认", contributors: "产品运营中心 · 12 人", source: "企业术语委员会", validity: "长期有效", usedBy: "全部产品与研发 Agent" },
  { id: "memory-candidate", title: "观察者是否允许导出审计记录", content: "本轮讨论倾向于禁止观察者导出，但尚未完成安全与合规确认。", scope: "项目", status: "候选", contributors: "陈楠、周祺", source: "REQ-032 产品对话 · 今天 11:20", validity: "确认后生效", usedBy: "当前不会自动注入 Agent" },
  { id: "memory-review", title: "批量修改角色需要二次确认", content: "超过 3 位成员的批量角色修改显示影响范围并要求二次确认。", scope: "项目", status: "待复核", contributors: "陈楠、林川", source: "原型 V4 与 PRD V3 差异", validity: "原型冲突解决后更新", usedBy: "仅作为风险提示引用" },
];

const typeIcons = {
  "代码 Wiki": Braces,
  "业务文档": BookOpen,
  "研发规范": ShieldCheck,
  "办公文档": FileText,
};

export function KnowledgeMemoryWorkspace({ kind, query, assets }: { kind: "knowledge" | "memory"; query: string; assets: AssetItem[] }) {
  const [knowledgeType, setKnowledgeType] = useState<"全部" | KnowledgeRecord["type"]>("全部");
  const [memoryScope, setMemoryScope] = useState<"全部" | MemoryRecord["scope"]>("全部");
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState(knowledgeRecords[0].id);
  const [selectedMemoryId, setSelectedMemoryId] = useState(memoryRecords[0].id);
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const filteredKnowledge = useMemo(() => knowledgeRecords.filter((record) =>
    (knowledgeType === "全部" || record.type === knowledgeType) && `${record.name}${record.description}${record.source}`.toLowerCase().includes(query.toLowerCase()),
  ), [knowledgeType, query]);
  const filteredMemory = useMemo(() => memoryRecords.filter((record) =>
    (memoryScope === "全部" || record.scope === memoryScope) && `${record.title}${record.content}${record.source}`.toLowerCase().includes(query.toLowerCase()),
  ), [memoryScope, query]);
  const selectedKnowledge = knowledgeRecords.find((item) => item.id === selectedKnowledgeId) ?? knowledgeRecords[0];
  const selectedMemory = memoryRecords.find((item) => item.id === selectedMemoryId) ?? memoryRecords[0];

  if (kind === "knowledge") {
    return <section className="knowledge-memory-workspace">
      <div className="knowledge-overview-strip">
        <div><span><Database size={16} /></span><p><b>企业知识面</b><small>统一检索，沿用源系统权限，回答必须附带引用</small></p></div>
        <dl><div><dt>4</dt><dd>知识库</dd></div><div><dt>99.2%</dt><dd>索引健康度</dd></div><div><dt>2,514</dt><dd>近 7 日引用</dd></div></dl>
      </div>
      <div className="knowledge-filter-row">
        {(["全部", "代码 Wiki", "业务文档", "研发规范", "办公文档"] as const).map((type) => <button className={knowledgeType === type ? "active" : ""} key={type} onClick={() => setKnowledgeType(type)} type="button">{type}</button>)}
        <span><RefreshCw size={13} />所有同步源正常</span>
      </div>
      <div className="knowledge-master-detail">
        <div className="knowledge-collection-list">
          {filteredKnowledge.map((record) => {
            const Icon = typeIcons[record.type];
            return <button className={selectedKnowledge.id === record.id ? "active" : ""} key={record.id} onClick={() => { setSelectedKnowledgeId(record.id); setShowAnswer(false); }} type="button"><span className="knowledge-record-icon"><Icon size={17} /></span><span><small>{record.type}</small><b>{record.name}</b><em>{record.description}</em><i><span>{record.volume}</span><span>{record.freshness}</span></i></span><ChevronRight size={15} /></button>;
          })}
          {assets.filter((asset) => !knowledgeRecords.some((record) => record.id === asset.id)).map((asset) => <button key={asset.id} type="button"><span className="knowledge-record-icon"><Database size={17} /></span><span><small>自定义知识库</small><b>{asset.name}</b><em>{asset.description}</em><i><span>{asset.meta}</span><span>{asset.status}</span></i></span><ChevronRight size={15} /></button>)}
        </div>
        <aside className="knowledge-detail-panel">
          <header><span>{selectedKnowledge.type}</span><h3>{selectedKnowledge.name}</h3><p>{selectedKnowledge.description}</p></header>
          <div className="knowledge-detail-grid"><span><small>同步来源</small><b>{selectedKnowledge.source}</b></span><span><small>负责人</small><b>{selectedKnowledge.owner}</b></span><span><small>权限范围</small><b>{selectedKnowledge.scope}</b></span><span><small>更新状态</small><b>{selectedKnowledge.freshness}</b></span></div>
          <section><b><Bot size={14} />Agent 使用规则</b><p>{selectedKnowledge.usage}</p></section>
          <section><b><Link2 size={14} />可追溯引用</b>{selectedKnowledge.citations.map((citation) => <button key={citation} type="button"><span>{citation}</span><ChevronRight size={12} /></button>)}</section>
          <button className="knowledge-query-action" onClick={() => setShowAnswer(!showAnswer)} type="button"><SearchCheck size={14} />{showAnswer ? "收起检索示例" : "试用一次 Agent 检索"}</button>
          {showAnswer && <div className="knowledge-answer-demo"><span><Sparkles size={13} />带引用回答</span><p>批量调整项目角色时需要保留审计记录，并在高风险操作前展示影响范围。</p><small>引用 3 项 · 权限校验已通过</small></div>}
        </aside>
      </div>
    </section>;
  }

  const effectiveStatus = confirmed.includes(selectedMemory.id) ? "已确认" : selectedMemory.status;
  return <section className="knowledge-memory-workspace">
    <div className="knowledge-overview-strip memory">
      <div><span><BrainCircuit size={16} /></span><p><b>组织多人记忆</b><small>把对话中的稳定事实提炼成可确认、可追溯、可失效的共享记忆</small></p></div>
      <dl><div><dt>286</dt><dd>有效记忆</dd></div><div><dt>18</dt><dd>待复核</dd></div><div><dt>74</dt><dd>贡献成员</dd></div></dl>
    </div>
    <div className="memory-lifecycle"><span className="done"><Check size={12} />对话与工作产生候选</span><i /><span className="done"><Users size={12} />项目成员共同确认</span><i /><span className="done"><Bot size={12} />按范围注入 Agent</span><i /><span><Clock3 size={12} />定期复核与失效</span></div>
    <div className="knowledge-filter-row">
      {(["全部", "项目", "团队", "企业"] as const).map((scope) => <button className={memoryScope === scope ? "active" : ""} key={scope} onClick={() => setMemoryScope(scope)} type="button">{scope}记忆</button>)}
      <span><CircleAlert size={13} />候选记忆不会自动影响 Agent</span>
    </div>
    <div className="knowledge-master-detail">
      <div className="memory-record-list">
        {filteredMemory.map((record) => <button className={selectedMemory.id === record.id ? "active" : ""} key={record.id} onClick={() => setSelectedMemoryId(record.id)} type="button"><span className={`memory-status-dot ${record.status}`} /><span><small>{record.scope}记忆 · {record.status}</small><b>{record.title}</b><em>{record.content}</em><i>{record.contributors}</i></span><ChevronRight size={15} /></button>)}
        {assets.filter((asset) => !memoryRecords.some((record) => record.id === asset.id)).map((asset) => <button key={asset.id} type="button"><span className="memory-status-dot 已确认" /><span><small>共享记忆空间</small><b>{asset.name}</b><em>{asset.description}</em><i>{asset.meta}</i></span><ChevronRight size={15} /></button>)}
      </div>
      <aside className="knowledge-detail-panel memory-detail">
        <header><span className={effectiveStatus}>{effectiveStatus}</span><h3>{selectedMemory.title}</h3><p>{selectedMemory.content}</p></header>
        <div className="knowledge-detail-grid"><span><small>生效范围</small><b>{selectedMemory.scope}</b></span><span><small>共同贡献</small><b>{selectedMemory.contributors}</b></span><span><small>来源证据</small><b>{selectedMemory.source}</b></span><span><small>有效期</small><b>{selectedMemory.validity}</b></span></div>
        <section><b><Bot size={14} />当前使用方式</b><p>{selectedMemory.usedBy}</p></section>
        <section className="memory-governance-note"><b><ShieldCheck size={14} />记忆治理原则</b><p>保留原始来源和确认人；新事实与旧记忆冲突时不覆盖，先进入待复核；删除源文档不会自动删除已确认记忆。</p></section>
        {(selectedMemory.status === "候选" || selectedMemory.status === "待复核") && !confirmed.includes(selectedMemory.id) && <button className="knowledge-query-action" onClick={() => setConfirmed((items) => [...items, selectedMemory.id])} type="button"><Check size={14} />确认当前记忆继续有效</button>}
        {confirmed.includes(selectedMemory.id) && <div className="memory-confirmed-feedback"><Check size={14} />已记录你的确认，本条记忆可被对应 Agent 使用</div>}
      </aside>
    </div>
  </section>;
}
