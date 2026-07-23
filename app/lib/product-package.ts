export type ProductStatus = "adjusting" | "complete" | "complete-incomplete";
export type ArtifactState = "missing" | "draft" | "confirmed" | "stale";

export interface PrototypeComponent {
  id: string;
  name: string;
  type: "text" | "button" | "input" | "table" | "dialog" | "navigation";
  text: string;
  color: string;
  state: "default" | "disabled" | "loading";
  target?: string;
  specRef?: string;
}

export interface PrototypePage {
  id: string;
  name: string;
  route: string;
  start?: boolean;
  changed?: boolean;
  components: PrototypeComponent[];
}

export interface PrototypeVersion {
  id: string;
  version: string;
  title: string;
  time: string;
  pages: number;
  affected: string[];
  sourceVersionId?: string;
}

export interface ProductDocumentVersion {
  id: string;
  version: string;
  title: string;
  time: string;
  prototypeVersion: string;
}

export interface ProductConflict {
  id: string;
  title: string;
  prototypeValue: string;
  prdValue: string;
  status: "open" | "resolved";
  resolution?: "prototype" | "prd" | "both";
}

export interface DownstreamSnapshot {
  id: string;
  agentId: string;
  prototypeVersion?: string;
  prdVersion?: string;
  specVersion?: string;
  acceptanceVersion?: string;
  createdAt: string;
}

export interface ProductPackageState {
  requirementId: string;
  productStatus: ProductStatus;
  prototypeStatus: ArtifactState;
  prdStatus: ArtifactState;
  pages: PrototypePage[];
  selectedPageId: string;
  selectedComponentId: string | null;
  prototypeVersions: PrototypeVersion[];
  prdVersions: ProductDocumentVersion[];
  conflicts: ProductConflict[];
  knowledgeIds: string[];
  downstreamSnapshots: DownstreamSnapshot[];
  prdBody: string;
  prdRevision: string;
  lastChange: string;
}

export type ProductPackageAction =
  | { type: "select-page"; pageId: string }
  | { type: "select-component"; componentId: string | null }
  | { type: "update-component"; patch: Partial<PrototypeComponent> }
  | { type: "add-page" }
  | { type: "copy-page"; pageId: string }
  | { type: "rename-page"; pageId: string; name: string }
  | { type: "delete-page"; pageId: string }
  | { type: "set-start-page"; pageId: string }
  | { type: "create-prototype-version"; title?: string }
  | { type: "rollback-prototype"; versionId: string }
  | { type: "set-prd-body"; body: string }
  | { type: "set-prd-revision"; revision: string }
  | { type: "confirm-prd-revision" }
  | { type: "rollback-prd"; versionId: string }
  | { type: "resolve-conflict"; conflictId: string; resolution: "prototype" | "prd" | "both" }
  | { type: "toggle-knowledge"; knowledgeId: string }
  | { type: "mark-product-complete" }
  | { type: "reopen-product" }
  | { type: "create-downstream-snapshot"; agentId: string };

const baseComponents: PrototypeComponent[] = [
  { id: "member-title", name: "页面标题", type: "text", text: "项目成员", color: "#20232b", state: "default", specRef: "PRD 2.1" },
  { id: "role-select", name: "角色选择器", type: "input", text: "项目管理员", color: "#ffffff", state: "default", specRef: "AC-07" },
  { id: "save-role", name: "保存角色按钮", type: "button", text: "保存角色", color: "#7053d8", state: "default", target: "保存并返回", specRef: "AC-07" },
  { id: "batch-dialog", name: "批量修改弹窗", type: "dialog", text: "确认修改 3 位成员的角色？", color: "#ffffff", state: "default", specRef: "AC-11" },
];

export function createInitialProductPackage(requirementId: string): ProductPackageState {
  return {
    requirementId,
    productStatus: "adjusting",
    prototypeStatus: "confirmed",
    prdStatus: "confirmed",
    pages: [
      { id: "overview", name: "权限概览", route: "/settings/roles", start: true, components: [{ id: "overview-nav", name: "角色导航", type: "navigation", text: "成员与角色", color: "#7053d8", state: "default", target: "成员列表" }] },
      { id: "members", name: "成员列表", route: "/settings/members", changed: true, components: baseComponents },
      { id: "role-edit", name: "角色编辑", route: "/settings/roles/edit", components: [{ id: "role-name", name: "角色名称", type: "input", text: "项目管理员", color: "#ffffff", state: "default", specRef: "PRD 3.2" }, { id: "permission-table", name: "权限表格", type: "table", text: "查看 · 编辑 · 管理成员", color: "#ffffff", state: "default", specRef: "BR-12" }] },
    ],
    selectedPageId: "members",
    selectedComponentId: "save-role",
    prototypeVersions: [
      { id: "proto-v1", version: "V1", title: "角色管理基础页面", time: "7 月 18 日", pages: 2, affected: ["权限概览", "成员列表"] },
      { id: "proto-v2", version: "V2", title: "补充成员角色编辑", time: "7 月 19 日", pages: 3, affected: ["成员列表", "角色编辑"] },
      { id: "proto-v3", version: "V3", title: "增加批量修改确认", time: "昨天 16:20", pages: 3, affected: ["成员列表"] },
      { id: "proto-v4", version: "V4", title: "完善角色配置交互", time: "今天 10:42", pages: 3, affected: ["成员列表", "角色编辑"] },
    ],
    prdVersions: [
      { id: "prd-v1", version: "V1", title: "首版需求范围", time: "7 月 18 日", prototypeVersion: "V1" },
      { id: "prd-v2", version: "V2", title: "补充权限边界", time: "7 月 20 日", prototypeVersion: "V3" },
      { id: "prd-v3", version: "V3", title: "完善批量操作与审计", time: "今天 10:50", prototypeVersion: "V4" },
    ],
    conflicts: [
      { id: "conflict-batch", title: "批量调整角色的确认方式", prototypeValue: "弹窗二次确认", prdValue: "在列表内直接保存", status: "open" },
    ],
    knowledgeIds: ["context-role-memory", "context-role-spec"],
    downstreamSnapshots: [],
    prdBody: "## 1. 背景与目标\n统一企业客户门户中的项目成员和角色管理体验，使产品、研发与测试围绕同一份可追溯规格协作。本次重构聚焦权限边界清晰化与批量操作安全，不调整租户级组织架构与外部身份源。\n\n## 2. 产品范围\n覆盖成员列表、角色调整、批量操作、权限校验与审计记录四个能力域。项目管理员可调整成员角色，观察者保持只读，高风险批量操作必须二次确认。范围不包含租户计费权限与跨项目的成员同步。\n\n## 3. 核心方案\n成员列表以表格呈现，每行展示姓名、当前角色与操作入口。角色变更通过统一的权限接口完成，权限在下一次操作即时生效。批量调整 2 名及以上成员时弹出影响范围确认弹窗，确认后逐项执行并对失败项支持单独重试。\n\n## 4. 权限规则\n项目管理员可管理成员、项目设置与全部资产；产品维护需求、原型与产品文档；研发维护开发任务和代码变更；测试维护用例、报告与缺陷。无权限用户提交角色变更时接口返回 403 并保留原状态，观察者进入编辑入口时展示只读原因与申请权限入口。\n\n## 5. 异常处理\n部分成员修改失败时明确展示失败对象并允许仅重试失败项；两位管理员同时编辑同一成员时提示数据已更新并支持重新加载。所有角色变更均写入审计记录，包含操作者、时间、原角色与新角色，任何成员均不能查询或修改其他项目的角色数据。\n\n## 6. 验收标准\n✓ AC-07 项目管理员可以修改成员角色\n✓ AC-09 观察者只能查看项目内容\n✓ AC-11 批量修改角色前展示影响范围\n✓ AC-12 所有权限变更写入审计记录",
    prdRevision: "",
    lastChange: "原型 V4 与 PRD V3 已确认，存在 1 项待解决差异",
  };
}

export function getProductReadiness(state: ProductPackageState) {
  const missing: string[] = [];
  if (state.prototypeStatus === "missing") missing.push("原型");
  if (state.prdStatus === "missing") missing.push("PRD");
  const warnings = [...missing.map((item) => `缺少${item}`)];
  if (state.conflicts.some((item) => item.status === "open")) warnings.push("原型与 PRD 存在未处理冲突");
  return { complete: missing.length === 0 && warnings.length === 0, missing, warnings };
}

const nextVersion = (items: Array<{ version: string }>) => `V${items.length + 1}`;

export function productPackageReducer(state: ProductPackageState, action: ProductPackageAction): ProductPackageState {
  switch (action.type) {
    case "select-page": return { ...state, selectedPageId: action.pageId, selectedComponentId: null };
    case "select-component": return { ...state, selectedComponentId: action.componentId };
    case "update-component": return {
      ...state,
      pages: state.pages.map((page) => page.id !== state.selectedPageId ? page : {
        ...page,
        changed: true,
        components: page.components.map((component) => component.id === state.selectedComponentId ? { ...component, ...action.patch } : component),
      }),
      prototypeStatus: "draft",
      lastChange: "组件修改尚未保存为新版本",
    };
    case "add-page": {
      const id = `page-${state.pages.length + 1}`;
      return { ...state, selectedPageId: id, selectedComponentId: null, prototypeStatus: "draft", pages: [...state.pages, { id, name: `新页面 ${state.pages.length + 1}`, route: `/page-${state.pages.length + 1}`, changed: true, components: [] }] };
    }
    case "copy-page": {
      const source = state.pages.find((page) => page.id === action.pageId);
      if (!source) return state;
      const id = `${source.id}-copy-${state.pages.length}`;
      return { ...state, selectedPageId: id, prototypeStatus: "draft", pages: [...state.pages, { ...source, id, name: `${source.name} 副本`, start: false, changed: true, components: source.components.map((item) => ({ ...item, id: `${item.id}-${state.pages.length}` })) }] };
    }
    case "rename-page": return { ...state, pages: state.pages.map((page) => page.id === action.pageId ? { ...page, name: action.name, changed: true } : page), prototypeStatus: "draft" };
    case "delete-page": {
      if (state.pages.length <= 1) return state;
      const pages = state.pages.filter((page) => page.id !== action.pageId);
      return { ...state, pages, selectedPageId: state.selectedPageId === action.pageId ? pages[0].id : state.selectedPageId, selectedComponentId: null, prototypeStatus: "draft" };
    }
    case "set-start-page": return { ...state, pages: state.pages.map((page) => ({ ...page, start: page.id === action.pageId })), prototypeStatus: "draft" };
    case "create-prototype-version": {
      const version = nextVersion(state.prototypeVersions);
      return { ...state, prototypeStatus: "confirmed", pages: state.pages.map((page) => ({ ...page, changed: false })), prototypeVersions: [...state.prototypeVersions, { id: `proto-${version.toLowerCase()}`, version, title: action.title ?? "根据本轮对话更新原型", time: "刚刚", pages: state.pages.length, affected: state.pages.filter((page) => page.changed).map((page) => page.name) }], lastChange: `原型 ${version} 已生成并可直接预览` };
    }
    case "rollback-prototype": {
      const source = state.prototypeVersions.find((item) => item.id === action.versionId);
      if (!source) return state;
      const version = nextVersion(state.prototypeVersions);
      return { ...state, prototypeStatus: "confirmed", prototypeVersions: [...state.prototypeVersions, { ...source, id: `proto-${version.toLowerCase()}`, version, title: `从 ${source.version} 恢复`, time: "刚刚", sourceVersionId: source.id }], lastChange: `${version} · 从 ${source.version} 恢复` };
    }
    case "set-prd-body": return { ...state, prdBody: action.body, prdStatus: "draft" };
    case "set-prd-revision": return { ...state, prdRevision: action.revision };
    case "confirm-prd-revision": {
      const version = nextVersion(state.prdVersions);
      return { ...state, prdStatus: "confirmed", prdBody: state.prdRevision ? `${state.prdBody}\n\n## 本轮补充\n${state.prdRevision}` : state.prdBody, prdRevision: "", prdVersions: [...state.prdVersions, { id: `prd-${version.toLowerCase()}`, version, title: "根据自然语言修订 PRD", time: "刚刚", prototypeVersion: state.prototypeVersions.at(-1)?.version ?? "未关联" }], lastChange: `PRD ${version} 已确认` };
    }
    case "rollback-prd": {
      const source = state.prdVersions.find((item) => item.id === action.versionId);
      if (!source) return state;
      const version = nextVersion(state.prdVersions);
      return { ...state, prdStatus: "confirmed", prdVersions: [...state.prdVersions, { ...source, id: `prd-${version.toLowerCase()}`, version, title: `从 ${source.version} 恢复`, time: "刚刚" }], lastChange: `PRD ${version} 已从 ${source.version} 恢复` };
    }
    case "resolve-conflict": return { ...state, conflicts: state.conflicts.map((item) => item.id === action.conflictId ? { ...item, status: "resolved", resolution: action.resolution } : item), lastChange: "原型与 PRD 差异已处理" };
    case "toggle-knowledge": return { ...state, knowledgeIds: state.knowledgeIds.includes(action.knowledgeId) ? state.knowledgeIds.filter((id) => id !== action.knowledgeId) : [...state.knowledgeIds, action.knowledgeId] };
    case "mark-product-complete": return { ...state, productStatus: getProductReadiness(state).complete ? "complete" : "complete-incomplete", lastChange: "产品已标记需求完成，同项目研发与测试现在可见" };
    case "reopen-product": return { ...state, productStatus: "adjusting", lastChange: "需求已重新进入产品调整中" };
    case "create-downstream-snapshot": {
      const currentPrototype = state.prototypeVersions.at(-1)?.version;
      const currentPrd = state.prdVersions.at(-1)?.version;
      const withoutAgent = state.downstreamSnapshots.filter((item) => item.agentId !== action.agentId);
      return { ...state, downstreamSnapshots: [...withoutAgent, { id: `${action.agentId}-${Date.now()}`, agentId: action.agentId, prototypeVersion: currentPrototype, prdVersion: currentPrd, createdAt: "刚刚" }] };
    }
  }
}
