export type BaselineStatus = "draft" | "confirmed";

export interface AcceptanceItem {
  id: string;
  title: string;
  detail: string;
  confirmed: boolean;
}

export interface RequirementBaselineState {
  requirementId: string;
  specVersion: string;
  specStatus: BaselineStatus;
  specBody: string;
  acceptanceVersion: string;
  acceptanceStatus: BaselineStatus;
  acceptanceItems: AcceptanceItem[];
  updatedAt: string;
}

export type RequirementBaselineAction =
  | { type: "edit-spec"; body: string }
  | { type: "confirm-spec" }
  | { type: "edit-acceptance"; id: string; detail: string }
  | { type: "toggle-acceptance"; id: string }
  | { type: "add-acceptance" }
  | { type: "confirm-acceptance" };

export function createInitialRequirementBaseline(requirementId: string): RequirementBaselineState {
  return {
    requirementId,
    specVersion: "V1.4",
    specStatus: "confirmed",
    specBody: "## 目标\n统一项目成员与角色权限模型，并保持现有租户隔离策略。\n\n## 业务规则\n- 项目成员可以查看项目内全部需求、代码变更与测试资产。\n- 仅项目管理员可以调整成员角色。\n- 批量调整角色必须经过二次确认并写入审计日志。\n\n## 技术约束\n沿用现有 RBAC 接口，不改变租户与项目的归属关系。",
    acceptanceVersion: "V1.2",
    acceptanceStatus: "draft",
    acceptanceItems: [
      { id: "ac-01", title: "成员权限可见性", detail: "项目成员可以查看项目内全部需求、代码变更和测试结果。", confirmed: true },
      { id: "ac-02", title: "角色编辑权限", detail: "只有项目管理员能够修改成员角色，其他角色只读。", confirmed: true },
      { id: "ac-03", title: "批量修改确认", detail: "批量修改 2 名及以上成员时展示二次确认，并显示影响范围。", confirmed: true },
      { id: "ac-04", title: "审计记录", detail: "角色变更成功后生成包含操作者、时间、原角色和新角色的审计记录。", confirmed: true },
      { id: "ac-05", title: "越权拦截", detail: "无权限用户提交角色变更时，接口返回 403，页面保留原状态。", confirmed: true },
      { id: "ac-06", title: "失败恢复", detail: "部分成员修改失败时需要明确展示失败对象，并允许仅重试失败项。", confirmed: true },
      { id: "ac-07", title: "角色即时生效", detail: "角色修改成功后，新权限在下一次操作时立即生效。", confirmed: true },
      { id: "ac-08", title: "成员列表反馈", detail: "保存期间按钮进入加载状态，完成后更新对应成员的角色标签。", confirmed: true },
      { id: "ac-09", title: "原型一致性", detail: "实现页面的字段、确认弹窗与原型 V4 保持一致。", confirmed: true },
      { id: "ac-10", title: "项目隔离", detail: "任何成员均不能查询或修改其他项目的角色数据。", confirmed: true },
      { id: "ac-11", title: "观察者提示", detail: "观察者尝试进入编辑入口时展示只读原因和申请权限入口。", confirmed: false },
      { id: "ac-12", title: "并发修改处理", detail: "两位管理员同时编辑同一成员时，需要提示数据已更新并支持重新加载。", confirmed: false },
    ],
    updatedAt: "10 分钟前",
  };
}

export function requirementBaselineReducer(state: RequirementBaselineState, action: RequirementBaselineAction): RequirementBaselineState {
  switch (action.type) {
    case "edit-spec":
      return { ...state, specBody: action.body, specStatus: "draft", updatedAt: "刚刚" };
    case "confirm-spec":
      return { ...state, specStatus: "confirmed", specVersion: nextVersion(state.specVersion), updatedAt: "刚刚" };
    case "edit-acceptance":
      return { ...state, acceptanceStatus: "draft", acceptanceItems: state.acceptanceItems.map((item) => item.id === action.id ? { ...item, detail: action.detail, confirmed: false } : item), updatedAt: "刚刚" };
    case "toggle-acceptance":
      return { ...state, acceptanceStatus: "draft", acceptanceItems: state.acceptanceItems.map((item) => item.id === action.id ? { ...item, confirmed: !item.confirmed } : item), updatedAt: "刚刚" };
    case "add-acceptance": {
      const index = state.acceptanceItems.length + 1;
      return { ...state, acceptanceStatus: "draft", acceptanceItems: [...state.acceptanceItems, { id: `ac-${String(index).padStart(2, "0")}`, title: `新增验收项 ${index}`, detail: "描述可验证的预期结果", confirmed: false }], updatedAt: "刚刚" };
    }
    case "confirm-acceptance":
      return { ...state, acceptanceStatus: "confirmed", acceptanceVersion: nextVersion(state.acceptanceVersion), acceptanceItems: state.acceptanceItems.map((item) => ({ ...item, confirmed: true })), updatedAt: "刚刚" };
  }
}

function nextVersion(version: string) {
  const match = version.match(/V(\d+)\.(\d+)/);
  if (!match) return "V1.0";
  return `V${match[1]}.${Number(match[2]) + 1}`;
}
