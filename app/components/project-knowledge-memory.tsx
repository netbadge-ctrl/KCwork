import { Bot, BrainCircuit, Check, ChevronRight, Database, FileText, GitBranch, History, Plus, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useMemo, useState } from "react";

const projectKnowledge = [
  { id: "pk-domain", type: "项目知识", title: "权限域模型与边界", source: "代码 Wiki · permission-service", detail: "租户、项目、资源三级权限模型，包含核心实体、接口与依赖关系。", status: "自动同步", used: "后端 Agent · 18 次引用" },
  { id: "pk-product", type: "企业知识引用", title: "企业权限产品规范 v3", source: "产品与业务知识库", detail: "项目绑定发布版本；企业知识更新后先提示差异，不直接覆盖当前需求上下文。", status: "已固定版本", used: "产品 Agent · 12 次引用" },
  { id: "pk-test", type: "项目知识", title: "权限回归基线", source: "企业测试平台 · 286 条用例", detail: "沉淀本系统长期有效的回归范围、关键场景及已知薄弱点。", status: "每天同步", used: "测试 Agent · 9 次引用" },
  { id: "pk-history", type: "历史需求", title: "已完成需求方案集", source: "38 项历史需求", detail: "仅将已完成并确认的 PRD、Spec、验收结果纳入项目知识，不把进行中的讨论当作事实。", status: "按需求归档", used: "全部 Agent 可检索" },
];

const projectMemories = [
  { id: "pm-role", title: "角色变更必须记录审计信息", text: "角色变化记录操作者、变更前后值与原因，前后端和测试均按此约束执行。", status: "已确认", people: "陈楠、林川、周祺", source: "REQ-032 评审", time: "今天 11:20" },
  { id: "pm-compatible", title: "权限接口保持两个版本周期兼容", text: "新增字段保留旧字段两个版本周期，破坏性变更必须有迁移 Spec。", status: "已确认", people: "权限平台研发组", source: "ADR-018", time: "7 月 18 日" },
  { id: "pm-export", title: "观察者禁止导出审计记录", text: "当前只是讨论结论，尚未完成安全复核，因此不会自动进入 Agent 上下文。", status: "候选", people: "陈楠、周祺", source: "产品 Agent 对话", time: "35 分钟前" },
];

const agentContext = [
  { agent: "产品设计 Agent", includes: "产品规范、历史 PRD、业务术语、已确认产品决策", excludes: "代码实现细节、未确认候选记忆" },
  { agent: "前后端开发 Agent", includes: "当前需求、Spec、代码 Wiki、架构规范、技术决策记忆", excludes: "无关办公文档、未授权仓库" },
  { agent: "测试 Agent", includes: "验收标准、历史缺陷、测试基线、风险记忆", excludes: "未完成 PRD 草稿、无来源讨论结论" },
];

export function ProjectKnowledgeMemory({ query }: { query: string }) {
  const [tab, setTab] = useState<"knowledge" | "memory" | "agent">("knowledge");
  const [selectedId, setSelectedId] = useState(projectKnowledge[0].id);
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const knowledge = useMemo(() => projectKnowledge.filter((item) => `${item.title}${item.detail}${item.source}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const memories = useMemo(() => projectMemories.filter((item) => `${item.title}${item.text}${item.people}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const selectedKnowledge = projectKnowledge.find((item) => item.id === selectedId) ?? projectKnowledge[0];
  const selectedMemory = projectMemories.find((item) => item.id === selectedId) ?? projectMemories[0];

  return <section className="project-knowledge-memory">
    <div className="project-context-principle"><span><Sparkles size={16} /></span><div><b>一个项目，一套持续演进的系统上下文</b><p>知识保存“可查证的内容”，记忆保存“经成员确认的稳定结论”；Agent 每次工作只装配与角色、需求和权限相关的子集。</p></div><dl><div><dt>4</dt><dd>知识源</dd></div><div><dt>23</dt><dd>有效记忆</dd></div><div><dt>96%</dt><dd>上下文健康度</dd></div></dl></div>
    <div className="project-knowledge-tabs">
      <button className={tab === "knowledge" ? "active" : ""} onClick={() => { setTab("knowledge"); setSelectedId(projectKnowledge[0].id); }} type="button"><Database size={14} />项目知识</button>
      <button className={tab === "memory" ? "active" : ""} onClick={() => { setTab("memory"); setSelectedId(projectMemories[0].id); }} type="button"><BrainCircuit size={14} />多人记忆</button>
      <button className={tab === "agent" ? "active" : ""} onClick={() => setTab("agent")} type="button"><Bot size={14} />Agent 上下文</button>
      {tab !== "agent" && <button className="project-knowledge-add" onClick={() => setIsAdding(!isAdding)} type="button"><Plus size={13} />{tab === "knowledge" ? "关联知识" : "记录候选记忆"}</button>}
    </div>
    {isAdding && <div className="project-memory-create"><div><b>{tab === "knowledge" ? "关联项目知识" : "记录候选记忆"}</b><small>{tab === "knowledge" ? "选择企业知识库并固定引用范围" : "候选内容需要项目成员确认后才会影响 Agent"}</small></div><input onChange={(event) => setDraft(event.target.value)} placeholder={tab === "knowledge" ? "搜索知识库或代码 Wiki" : "写下稳定事实、决策或团队约定"} value={draft} /><button disabled={!draft.trim()} onClick={() => { setDraft(""); setIsAdding(false); }} type="button">保存</button></div>}
    {tab === "knowledge" && <div className="project-knowledge-layout">
      <div className="project-knowledge-list">{knowledge.map((item) => <button className={selectedKnowledge.id === item.id ? "active" : ""} key={item.id} onClick={() => setSelectedId(item.id)} type="button"><span>{item.type === "项目知识" ? <Database size={15} /> : item.type === "历史需求" ? <History size={15} /> : <FileText size={15} />}</span><span><small>{item.type}</small><b>{item.title}</b><em>{item.detail}</em><i>{item.source} · {item.status}</i></span><ChevronRight size={14} /></button>)}</div>
      <aside className="project-knowledge-detail"><span>{selectedKnowledge.type}</span><h3>{selectedKnowledge.title}</h3><p>{selectedKnowledge.detail}</p><dl><div><dt>来源</dt><dd>{selectedKnowledge.source}</dd></div><div><dt>同步策略</dt><dd>{selectedKnowledge.status}</dd></div><div><dt>Agent 使用</dt><dd>{selectedKnowledge.used}</dd></div></dl><div><ShieldCheck size={15} /><p><b>项目边界优先</b><small>企业知识提供底座，项目固定版本和覆盖项决定本系统实际采用的内容。</small></p></div><button type="button">查看引用与影响范围</button></aside>
    </div>}
    {tab === "memory" && <div className="project-knowledge-layout">
      <div className="project-knowledge-list memory">{memories.map((item) => <button className={selectedMemory.id === item.id ? "active" : ""} key={item.id} onClick={() => setSelectedId(item.id)} type="button"><span><BrainCircuit size={15} /></span><span><small>{confirmed.includes(item.id) ? "已确认" : item.status}</small><b>{item.title}</b><em>{item.text}</em><i>{item.people} · {item.time}</i></span><ChevronRight size={14} /></button>)}</div>
      <aside className="project-knowledge-detail"><span>{confirmed.includes(selectedMemory.id) ? "已确认" : selectedMemory.status}</span><h3>{selectedMemory.title}</h3><p>{selectedMemory.text}</p><dl><div><dt>共同贡献</dt><dd>{selectedMemory.people}</dd></div><div><dt>来源证据</dt><dd>{selectedMemory.source}</dd></div><div><dt>更新时间</dt><dd>{selectedMemory.time}</dd></div></dl><div><Users size={15} /><p><b>多人记忆不是聊天记录</b><small>系统保留来源，但只把成员确认后的原子结论注入后续 Agent。</small></p></div>{selectedMemory.status === "候选" && !confirmed.includes(selectedMemory.id) ? <button onClick={() => setConfirmed((items) => [...items, selectedMemory.id])} type="button"><Check size={13} />确认并设为有效</button> : <button type="button">查看引用记录</button>}</aside>
    </div>}
    {tab === "agent" && <div className="agent-context-assembly"><header><div><b>按任务自动装配，不把整个知识库塞给 Agent</b><p>先按项目和用户权限过滤，再按 Agent 角色与当前需求召回，最后在回答和产物中保留引用。</p></div><span>当前需求 REQ-032</span></header><div className="context-assembly-flow"><span><GitBranch size={14} />项目与权限边界</span><i /><span><Database size={14} />相关知识召回</span><i /><span><BrainCircuit size={14} />有效记忆补充</span><i /><span><Bot size={14} />Agent 执行</span></div><div className="agent-context-cards">{agentContext.map((item) => <article key={item.agent}><span><Bot size={15} /></span><div><b>{item.agent}</b><p><strong>自动包含</strong>{item.includes}</p><p><strong>主动排除</strong>{item.excludes}</p></div></article>)}</div></div>}
  </section>;
}
