import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  Database,
  FileCode2,
  Globe2,
  Monitor,
  Play,
  Plus,
  RefreshCw,
  Save,
  Send,
  Server,
  Smartphone,
  Tablet,
  Terminal,
  TestTube2,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type { PreviewKind, Requirement } from "../lib/types";

type Criterion = { id: string; text: string; confirmed: boolean };
type DemoTestCase = { id: string; title: string; type: "自动化" | "人工"; selected: boolean; status: "passed" | "failed" | "pending" };
type Defect = { id: string; title: string; severity: "P1" | "P2" | "P3"; status: "待处理" | "处理中" | "已修复" };

export function useAgentToolSession() {
  const [analysis, setAnalysis] = useState({
    goal: "统一项目成员与角色权限体验，降低误配置风险。",
    scope: "覆盖成员列表、角色调整、权限校验和审计记录；不包含租户计费权限。",
    dependency: "企业身份服务、权限中心、审计服务",
  });
  const [analysisSaved, setAnalysisSaved] = useState(false);
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: "AC-07", text: "项目管理员可以修改项目成员角色", confirmed: true },
    { id: "AC-09", text: "观察者只能查看项目内容", confirmed: true },
    { id: "AC-11", text: "批量修改角色前展示影响范围", confirmed: false },
    { id: "AC-12", text: "所有权限变更写入审计记录", confirmed: true },
  ]);
  const [newCriterion, setNewCriterion] = useState("");
  const [auditItems, setAuditItems] = useState([
    { id: "audit-1", title: "高风险操作具有二次确认", resolved: true },
    { id: "audit-2", title: "观察者状态缺少禁用原因提示", resolved: false },
    { id: "audit-3", title: "键盘焦点顺序符合页面结构", resolved: true },
  ]);
  const [frontendDevice, setFrontendDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectedElement, setSelectedElement] = useState("保存按钮");
  const [elementText, setElementText] = useState("保存角色");
  const [elementColor, setElementColor] = useState("#7053d8");
  const [frontendSaved, setFrontendSaved] = useState(false);
  const [consoleFilter, setConsoleFilter] = useState<"all" | "warn" | "error">("all");
  const [consoleLogs, setConsoleLogs] = useState([
    { level: "info", text: "Vite dev server ready in 418 ms" },
    { level: "warn", text: "RolePanel: deprecated roleName prop" },
    { level: "info", text: "GET /api/projects/customer-portal 200" },
  ]);
  const [buildStatus, setBuildStatus] = useState<"idle" | "success">("idle");
  const [apiMethod, setApiMethod] = useState("PATCH");
  const [apiUrl, setApiUrl] = useState("/api/projects/customer-portal/members/u-104/role");
  const [apiBody, setApiBody] = useState('{\n  "role": "project-admin"\n}');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [modelFields, setModelFields] = useState(["id · uuid · PK", "project_id · uuid · INDEX", "member_id · uuid", "role · varchar(32)", "updated_at · timestamp"]);
  const [newField, setNewField] = useState("");
  const [runtimeLogs, setRuntimeLogs] = useState([
    "10:42:18 INFO  PermissionService started on :8080",
    "10:42:23 INFO  PATCH /members/u-104/role 200 42ms",
    "10:42:26 WARN  audit queue latency 186ms",
  ]);
  const [testCases, setTestCases] = useState<DemoTestCase[]>([
    { id: "TC-101", title: "项目管理员可以修改成员角色", type: "自动化", selected: true, status: "passed" },
    { id: "TC-102", title: "观察者只能查看项目内容", type: "自动化", selected: true, status: "passed" },
    { id: "TC-103", title: "批量修改前展示影响范围", type: "人工", selected: true, status: "failed" },
    { id: "TC-104", title: "角色变更写入审计记录", type: "自动化", selected: false, status: "pending" },
  ]);
  const [newTestTitle, setNewTestTitle] = useState("");
  const [testRunCount, setTestRunCount] = useState(0);
  const [defects, setDefects] = useState<Defect[]>([
    { id: "BUG-184", title: "批量角色修改未展示影响成员数", severity: "P2", status: "待处理" },
  ]);

  return {
    analysis, setAnalysis, analysisSaved, setAnalysisSaved,
    criteria, setCriteria, newCriterion, setNewCriterion,
    auditItems, setAuditItems,
    frontendDevice, setFrontendDevice, selectedElement, setSelectedElement,
    elementText, setElementText, elementColor, setElementColor,
    frontendSaved, setFrontendSaved,
    consoleFilter, setConsoleFilter, consoleLogs, setConsoleLogs, buildStatus, setBuildStatus,
    apiMethod, setApiMethod, apiUrl, setApiUrl, apiBody, setApiBody, apiResponse, setApiResponse,
    modelFields, setModelFields, newField, setNewField,
    runtimeLogs, setRuntimeLogs,
    testCases, setTestCases, newTestTitle, setNewTestTitle, testRunCount, setTestRunCount,
    defects, setDefects,
  };
}

export type AgentToolSession = ReturnType<typeof useAgentToolSession>;

function ContextStrip({ requirement, label }: { requirement: Requirement | null; label: string }) {
  return <div className="agent-panel-context"><span>{label}</span><b>{requirement?.code ?? "未关联需求"}</b><small>Spec {requirement?.specVersion ?? "-"} · 会话内联动</small></div>;
}

export function AgentToolPanel({
  kind,
  requirement,
  canEdit,
  session,
}: {
  kind: PreviewKind;
  requirement: Requirement | null;
  canEdit: boolean;
  session: AgentToolSession;
}) {
  switch (kind) {
    case "requirement-analysis": return <RequirementAnalysisPanel {...{ requirement, canEdit, session }} />;
    case "acceptance-criteria": return <AcceptancePanel {...{ requirement, canEdit, session }} />;
    case "prototype-audit": return <PrototypeAuditPanel {...{ requirement, canEdit, session }} />;
    case "frontend-preview": return <FrontendPreviewPanel {...{ requirement, canEdit, session }} />;
    case "console": return <ConsolePanel {...{ requirement, session }} />;
    case "api-debug": return <ApiDebugPanel {...{ requirement, canEdit, session }} />;
    case "data-model": return <DataModelPanel {...{ requirement, canEdit, session }} />;
    case "log": return <RuntimeLogPanel {...{ requirement, session }} />;
    case "test-cases": return <TestCasesPanel {...{ requirement, canEdit, session }} />;
    case "test-run": return <TestRunPanel {...{ requirement, session }} />;
    case "failures": return <FailureEvidencePanel {...{ requirement, session }} />;
    case "test": return <InteractiveReportPanel {...{ requirement, session }} />;
    case "defects": return <DefectsPanel {...{ requirement, canEdit, session }} />;
    default: return null;
  }
}

function RequirementAnalysisPanel({ requirement, canEdit, session }: PanelProps) {
  const fields = [
    ["目标", "goal"], ["范围与边界", "scope"], ["关键依赖", "dependency"],
  ] as const;
  return <section className="agent-tool-panel">
    <ContextStrip label="产品设计" requirement={requirement} />
    <div className="panel-intro"><div><h3>需求分析画布</h3><p>结构化结果会同步给原型、PRD 与验收标准。</p></div><span>3 项已识别</span></div>
    <div className="analysis-form">
      {fields.map(([label, key]) => <label key={key}><span>{label}</span><textarea disabled={!canEdit} value={session.analysis[key]} onChange={(event) => { session.setAnalysis({ ...session.analysis, [key]: event.target.value }); session.setAnalysisSaved(false); }} /></label>)}
    </div>
    <div className="panel-callout"><AlertTriangle size={15} /><span>待确认：普通成员是否允许导出审计记录？</span><button type="button">带入对话</button></div>
    <div className="panel-footer"><span>{session.analysisSaved ? <><Check size={14} />已保存并同步到对话</> : "修改仅在当前会话中保留"}</span><button disabled={!canEdit} onClick={() => session.setAnalysisSaved(true)} type="button"><Save size={14} />保存分析</button></div>
  </section>;
}

function AcceptancePanel({ requirement, canEdit, session }: PanelProps) {
  return <section className="agent-tool-panel">
    <ContextStrip label="产品设计" requirement={requirement} />
    <div className="panel-intro"><div><h3>验收标准</h3><p>标准与测试用例保持追溯关系。</p></div><span>{session.criteria.filter((item) => item.confirmed).length}/{session.criteria.length} 已确认</span></div>
    <div className="criteria-list">{session.criteria.map((item) => <label key={item.id}><input checked={item.confirmed} disabled={!canEdit} onChange={() => session.setCriteria(session.criteria.map((current) => current.id === item.id ? { ...current, confirmed: !current.confirmed } : current))} type="checkbox" /><b>{item.id}</b><input disabled={!canEdit} value={item.text} onChange={(event) => session.setCriteria(session.criteria.map((current) => current.id === item.id ? { ...current, text: event.target.value } : current))} /><small>{item.id === "AC-11" ? "关联 TC-103 · 失败" : "已关联测试"}</small></label>)}</div>
    <div className="inline-add"><input disabled={!canEdit} placeholder="新增一条可测试的验收标准" value={session.newCriterion} onChange={(event) => session.setNewCriterion(event.target.value)} /><button disabled={!canEdit || !session.newCriterion.trim()} onClick={() => { const next = `AC-${13 + session.criteria.length - 4}`; session.setCriteria([...session.criteria, { id: next, text: session.newCriterion.trim(), confirmed: false }]); session.setNewCriterion(""); }} type="button"><Plus size={14} />添加</button></div>
  </section>;
}

function PrototypeAuditPanel({ requirement, canEdit, session }: PanelProps) {
  return <section className="agent-tool-panel">
    <ContextStrip label="产品设计" requirement={requirement} />
    <div className="panel-intro"><div><h3>原型审计</h3><p>检查需求覆盖、可用性和无障碍风险。</p></div><span>{session.auditItems.filter((item) => item.resolved).length} 通过 · {session.auditItems.filter((item) => !item.resolved).length} 待处理</span></div>
    <div className="audit-score"><strong>86</strong><span>审计评分</span><div><i style={{ width: "86%" }} /></div></div>
    <div className="audit-list">{session.auditItems.map((item) => <article className={item.resolved ? "resolved" : "warning"} key={item.id}>{item.resolved ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}<div><b>{item.title}</b><small>{item.resolved ? "已覆盖" : "建议补充禁用原因和恢复方式"}</small></div><button disabled={!canEdit} onClick={() => session.setAuditItems(session.auditItems.map((current) => current.id === item.id ? { ...current, resolved: !current.resolved } : current))} type="button">{item.resolved ? "重新打开" : "标记已处理"}</button></article>)}</div>
  </section>;
}

function FrontendPreviewPanel({ requirement, canEdit, session }: PanelProps) {
  const DeviceIcon = session.frontendDevice === "desktop" ? Monitor : session.frontendDevice === "tablet" ? Tablet : Smartphone;
  return <section className="agent-tool-panel">
    <ContextStrip label="前端开发" requirement={requirement} />
    <div className="browser-toolbar"><button type="button"><RefreshCw size={13} /></button><span><Globe2 size={13} />localhost:3000/projects/customer-portal/members</span>{(["desktop", "tablet", "mobile"] as const).map((device) => <button className={session.frontendDevice === device ? "active" : ""} key={device} onClick={() => session.setFrontendDevice(device)} type="button">{device === "desktop" ? <Monitor size={13} /> : device === "tablet" ? <Tablet size={13} /> : <Smartphone size={13} />}</button>)}</div>
    <div className="frontend-preview-layout">
      <div className={`runtime-preview ${session.frontendDevice}`}><div className="runtime-app"><aside>KC<br />项目<br />成员</aside><main><small>成员与角色</small><h4>项目成员</h4><div className="member-row"><span>陈楠<br /><small>产品负责人</small></span><button onClick={() => session.setSelectedElement("角色选择器")} type="button">项目管理员⌄</button></div><div className="member-row"><span>林川<br /><small>前端开发</small></span><button onClick={() => session.setSelectedElement("角色选择器")} type="button">研发⌄</button></div><button className="runtime-save" onClick={() => session.setSelectedElement("保存按钮")} style={{ background: session.elementColor }} type="button">{session.elementText}</button></main></div></div>
      <aside className="element-inspector"><div><DeviceIcon size={16} /><b>元素检查</b></div><label>当前元素<input readOnly value={session.selectedElement} /></label><label>文本<input disabled={!canEdit} value={session.elementText} onChange={(event) => { session.setElementText(event.target.value); session.setFrontendSaved(false); }} /></label><label>主色<input disabled={!canEdit} type="color" value={session.elementColor} onChange={(event) => { session.setElementColor(event.target.value); session.setFrontendSaved(false); }} /></label><button disabled={!canEdit} onClick={() => session.setFrontendSaved(true)} type="button">{session.frontendSaved ? "已保存并同步" : "保存元素修改"}</button></aside>
    </div>
  </section>;
}

function ConsolePanel({ requirement, session }: PanelProps) {
  const visibleLogs = session.consoleLogs.filter((item) => session.consoleFilter === "all" || item.level === session.consoleFilter);
  return <section className="agent-tool-panel dark-panel">
    <ContextStrip label="前端开发" requirement={requirement} />
    <div className="console-toolbar"><div>{(["all", "warn", "error"] as const).map((filter) => <button className={session.consoleFilter === filter ? "active" : ""} key={filter} onClick={() => session.setConsoleFilter(filter)} type="button">{filter === "all" ? "全部" : filter === "warn" ? "警告" : "错误"}</button>)}</div><button onClick={() => session.setConsoleLogs([])} type="button"><Trash2 size={13} />清空</button><button onClick={() => { session.setBuildStatus("success"); session.setConsoleLogs([...session.consoleLogs, { level: "info", text: "✓ build completed · 0 errors · 2.4s" }]); }} type="button"><Play size={13} />运行构建</button></div>
    <div className="console-output">{visibleLogs.length ? visibleLogs.map((item, index) => <p className={item.level} key={`${item.text}-${index}`}><span>{item.level}</span>{item.text}</p>) : <div className="empty-console">暂无日志</div>}</div>
    <div className={`build-result ${session.buildStatus}`}><div>{session.buildStatus === "success" ? <CheckCircle2 size={18} /> : <CircleDashed size={18} />}<span><b>{session.buildStatus === "success" ? "构建通过" : "尚未运行构建"}</b><small>{session.buildStatus === "success" ? "126 modules · 0 errors · 2 warnings" : "点击“运行构建”生成结果"}</small></span></div>{session.buildStatus === "success" && <button type="button">带入对话</button>}</div>
  </section>;
}

function ApiDebugPanel({ requirement, canEdit, session }: PanelProps) {
  return <section className="agent-tool-panel">
    <ContextStrip label="后端开发" requirement={requirement} />
    <div className="api-request-line"><select disabled={!canEdit} value={session.apiMethod} onChange={(event) => session.setApiMethod(event.target.value)}><option>GET</option><option>POST</option><option>PATCH</option><option>DELETE</option></select><input disabled={!canEdit} value={session.apiUrl} onChange={(event) => session.setApiUrl(event.target.value)} /><button onClick={() => session.setApiResponse('{\n  "id": "u-104",\n  "role": "project-admin",\n  "updated": true\n}')} type="button"><Send size={14} />发送</button></div>
    <div className="api-editor-grid"><div><header>请求体 · JSON</header><textarea disabled={!canEdit} spellCheck={false} value={session.apiBody} onChange={(event) => session.setApiBody(event.target.value)} /></div><div><header>响应 {session.apiResponse ? <span>200 · 42 ms</span> : null}</header><pre>{session.apiResponse ?? "发送请求后在这里查看响应"}</pre></div></div>
    <div className="api-history"><b>最近请求</b>{["PATCH /members/u-104/role · 200", "GET /projects/customer-portal/roles · 200", "POST /audit/events · 201"].map((item) => <button key={item} type="button"><Clock3 size={13} />{item}<ChevronRight size={13} /></button>)}</div>
  </section>;
}

function DataModelPanel({ requirement, canEdit, session }: PanelProps) {
  return <section className="agent-tool-panel">
    <ContextStrip label="后端开发" requirement={requirement} />
    <div className="model-diagram"><article><Database size={18} /><b>project_members</b>{session.modelFields.map((field) => <span key={field}>{field}</span>)}</article><i>1 ─── N</i><article><Database size={18} /><b>role_audit_logs</b><span>id · uuid · PK</span><span>member_id · uuid</span><span>before_role · varchar</span><span>after_role · varchar</span></article></div>
    <div className="inline-add"><input disabled={!canEdit} placeholder="字段名 · 类型" value={session.newField} onChange={(event) => session.setNewField(event.target.value)} /><button disabled={!canEdit || !session.newField.trim()} onClick={() => { session.setModelFields([...session.modelFields, session.newField.trim()]); session.setNewField(""); }} type="button"><Plus size={14} />添加字段</button></div>
    <div className="migration-preview"><header><Terminal size={14} />迁移预览</header><code>ALTER TABLE project_members ADD COLUMN role varchar(32) NOT NULL;</code><button type="button">复制到对话</button></div>
  </section>;
}

function RuntimeLogPanel({ requirement, session }: PanelProps) {
  return <section className="agent-tool-panel dark-panel">
    <ContextStrip label="后端开发" requirement={requirement} />
    <div className="service-status"><span><i />permission-service</span><b>运行中 · :8080</b><button onClick={() => session.setRuntimeLogs([...session.runtimeLogs, `${new Date().toLocaleTimeString("zh-CN", { hour12: false })} INFO  service restarted`])} type="button"><RefreshCw size={13} />重启</button></div>
    <div className="runtime-log-output">{session.runtimeLogs.map((line, index) => <p className={line.includes("WARN") ? "warn" : ""} key={`${line}-${index}`}>{line}</p>)}</div>
    <button className="outline-action" onClick={() => session.setRuntimeLogs([])} type="button">清空日志</button>
  </section>;
}

function TestCasesPanel({ requirement, canEdit, session }: PanelProps) {
  return <section className="agent-tool-panel">
    <ContextStrip label="测试" requirement={requirement} />
    <div className="panel-intro"><div><h3>测试用例</h3><p>用例与验收标准双向追溯。</p></div><span>{session.testCases.length} 条</span></div>
    <div className="test-case-editor">{session.testCases.map((item) => <article key={item.id}><input checked={item.selected} disabled={!canEdit} onChange={() => session.setTestCases(session.testCases.map((current) => current.id === item.id ? { ...current, selected: !current.selected } : current))} type="checkbox" /><b>{item.id}</b><input disabled={!canEdit} value={item.title} onChange={(event) => session.setTestCases(session.testCases.map((current) => current.id === item.id ? { ...current, title: event.target.value } : current))} /><span>{item.type}</span><em className={item.status}>{item.status === "passed" ? "通过" : item.status === "failed" ? "失败" : "待执行"}</em></article>)}</div>
    <div className="inline-add"><input disabled={!canEdit} placeholder="新增测试用例" value={session.newTestTitle} onChange={(event) => session.setNewTestTitle(event.target.value)} /><button disabled={!canEdit || !session.newTestTitle.trim()} onClick={() => { session.setTestCases([...session.testCases, { id: `TC-${101 + session.testCases.length}`, title: session.newTestTitle.trim(), type: "人工", selected: true, status: "pending" }]); session.setNewTestTitle(""); }} type="button"><Plus size={14} />添加</button></div>
  </section>;
}

function TestRunPanel({ requirement, session }: PanelProps) {
  const selected = session.testCases.filter((item) => item.selected);
  const passed = session.testCases.filter((item) => item.status === "passed").length;
  return <section className="agent-tool-panel">
    <ContextStrip label="测试" requirement={requirement} />
    <div className="test-run-config"><label>测试环境<select><option>Chrome 126 · macOS</option><option>Chrome 126 · Windows</option><option>移动端模拟器</option></select></label><label>执行范围<select><option>已选 {selected.length} 条用例</option><option>当前需求全部用例</option></select></label><button onClick={() => { session.setTestRunCount(session.testRunCount + 1); session.setTestCases(session.testCases.map((item, index) => item.selected ? { ...item, status: index === 2 ? "failed" : "passed" } : item)); }} type="button"><Play size={15} />开始执行</button></div>
    <div className="test-run-progress"><div><strong>{session.testRunCount ? "75%" : "0%"}</strong><span>{session.testRunCount ? "执行完成" : "等待执行"}</span></div><div className="test-progress-bar"><i style={{ width: session.testRunCount ? "100%" : "0%" }} /></div><p><span className="pass">{passed} 通过</span><span className="fail">{session.testCases.filter((item) => item.status === "failed").length} 失败</span><span>{session.testCases.filter((item) => item.status === "pending").length} 待执行</span></p></div>
    <div className="run-timeline">{session.testCases.filter((item) => item.selected).map((item) => <div key={item.id}>{item.status === "passed" ? <CheckCircle2 size={15} /> : item.status === "failed" ? <XCircle size={15} /> : <CircleDashed size={15} />}<span>{item.id} · {item.title}</span><small>{item.status === "pending" ? "等待" : item.status === "passed" ? "1.2s" : "2.4s"}</small></div>)}</div>
  </section>;
}

function FailureEvidencePanel({ requirement, session }: PanelProps) {
  const failure = session.testCases.find((item) => item.status === "failed");
  return <section className="agent-tool-panel">
    <ContextStrip label="测试" requirement={requirement} />
    {failure ? <><div className="failure-heading"><XCircle size={20} /><div><b>{failure.id} · {failure.title}</b><small>Chrome 126 · macOS · 2.4s</small></div><span>失败</span></div><div className="failure-evidence-grid"><div className="failure-shot"><header>页面截图</header><div><AlertTriangle size={24} /><span>影响范围弹窗未出现</span></div></div><div className="failure-stack"><header>错误信息</header><pre>Expected: dialog visible{`\n`}Received: no element found{`\n`}at RoleBatchEdit.spec.ts:48</pre></div></div><div className="panel-callout"><AlertTriangle size={15} /><span>与验收标准 AC-11 不一致</span><button onClick={() => session.setTestRunCount(session.testRunCount + 1)} type="button">重新执行</button></div></> : <div className="empty-panel-state"><CheckCircle2 size={28} /><b>当前没有失败证据</b></div>}
  </section>;
}

function InteractiveReportPanel({ requirement, session }: PanelProps) {
  const passed = session.testCases.filter((item) => item.status === "passed").length;
  const failed = session.testCases.filter((item) => item.status === "failed").length;
  const rate = Math.round((passed / Math.max(session.testCases.length, 1)) * 100);
  return <section className="agent-tool-panel">
    <ContextStrip label="测试" requirement={requirement} />
    <div className="report-score"><strong>{rate}%</strong><span>通过率</span><div><i style={{ width: `${rate}%` }} /></div></div>
    <div className="report-metrics"><article><b>{session.testCases.length}</b><span>用例</span></article><article><b>{passed}</b><span>通过</span></article><article><b>{failed}</b><span>失败</span></article><article><b>{session.defects.length}</b><span>缺陷</span></article></div>
    <div className="report-section"><h4>测试结论</h4><p>角色管理核心路径基本可用，批量修改流程存在 1 项与 AC-11 不一致的问题，建议修复后执行定向回归。</p><button type="button">保存报告到项目</button></div>
  </section>;
}

function DefectsPanel({ requirement, canEdit, session }: PanelProps) {
  return <section className="agent-tool-panel">
    <ContextStrip label="测试" requirement={requirement} />
    <div className="panel-intro"><div><h3>缺陷记录</h3><p>从失败证据创建，状态由项目成员确认。</p></div><button disabled={!canEdit || session.defects.length > 1} onClick={() => session.setDefects([...session.defects, { id: `BUG-${184 + session.defects.length}`, title: "观察者角色提示缺少权限说明", severity: "P3", status: "待处理" }])} type="button"><Plus size={14} />从失败证据创建</button></div>
    <div className="defect-list">{session.defects.map((defect) => <article key={defect.id}><span className={`severity ${defect.severity.toLowerCase()}`}>{defect.severity}</span><div><b>{defect.id} · {defect.title}</b><small>关联 AC-11 · TC-103</small></div><select disabled={!canEdit} value={defect.status} onChange={(event) => session.setDefects(session.defects.map((current) => current.id === defect.id ? { ...current, status: event.target.value as Defect["status"] } : current))}><option>待处理</option><option>处理中</option><option>已修复</option></select></article>)}</div>
  </section>;
}

type PanelProps = { requirement: Requirement | null; canEdit?: boolean; session: AgentToolSession };
