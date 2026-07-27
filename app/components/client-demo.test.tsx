import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import Page from "../page";

const storedValues = new Map<string, string>();
Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: {
    clear: () => storedValues.clear(),
    getItem: (key: string) => storedValues.get(key) ?? null,
    key: (index: number) => [...storedValues.keys()][index] ?? null,
    get length() {
      return storedValues.size;
    },
    removeItem: (key: string) => storedValues.delete(key),
    setItem: (key: string, value: string) => storedValues.set(key, value),
  } satisfies Storage,
});

beforeEach(() => {
  window.localStorage.clear();
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 1400,
    writable: true,
  });
});

const roleLabels: Record<string, string> = {
  product: "产品",
  development: "研发",
  testing: "测试",
  viewer: "观察者",
};

async function openFirstTask() {
  await userEvent.click(
    screen.getByRole("button", { name: "开发任务：完善角色管理 PRD14:32" }),
  );
}

async function openCustomerPortal() {
  await userEvent.click(screen.getByRole("button", { name: "项目" }));
  await userEvent.click(
    screen.getByRole("button", { name: "打开企业客户门户 V3.2" }),
  );
}

async function openRoleRequirement() {
  await openCustomerPortal();
  await userEvent.click(
    screen.getByRole("button", {
      name: "恢复角色与成员权限重构工作区",
    }),
  );
}

async function setCurrentUserRole(
  role: "product" | "development" | "testing" | "viewer",
) {
  await openCustomerPortal();
  await userEvent.click(screen.getByRole("button", { name: "项目设置" }));
  // 展开 ProjectSettingsPanel 的"成员与角色"区(用 aria-expanded 区分于工具栏同名按钮)
  await userEvent.click(
    screen.getByRole("button", { name: "成员与角色", expanded: false }),
  );
  // 取消陈楠所有已选角色(每次重新查询容器,因为点击会重渲染)
  for (const label of Object.values(roleLabels)) {
    const chip = within(
      screen.getByLabelText("修改陈楠的项目角色"),
    ).queryByRole("button", { name: `${label}（已选）` });
    if (chip) fireEvent.click(chip);
  }
  // 选中目标角色(若未选)
  const target = within(
    screen.getByLabelText("修改陈楠的项目角色"),
  ).queryByRole("button", { name: roleLabels[role] });
  if (target) fireEvent.click(target);
  await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));
}

describe("enterprise AI client demo", () => {
  test("collapses the left navigation and remembers the state", async () => {
    render(<Page />);
    await userEvent.click(
      screen.getByRole("button", { name: "收起左侧导航" }),
    );
    expect(screen.getByRole("navigation", { name: "主导航" })).toHaveClass(
      "collapsed",
    );
    expect(window.localStorage.getItem("kflow.sidebar.collapsed")).toBe("collapsed");
  });

  test("does not overwrite a sidebar toggle made during preference hydration", async () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "收起左侧导航" }));
    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "主导航" })).toHaveClass(
        "collapsed",
      );
      expect(window.localStorage.getItem("kflow.sidebar.collapsed")).toBe(
        "collapsed",
      );
    });
  });

  test("opens a wider adjustable right panel", async () => {
    render(<Page />);
    await openFirstTask();
    await userEvent.click(screen.getByRole("button", { name: "23 项上下文" }));
    expect(
      screen.getByRole("separator", { name: "调整辅助面板宽度" }),
    ).toHaveAttribute("aria-valuenow", "560");
  });

  test("restores the collapsed navigation preference", async () => {
    window.localStorage.setItem("kflow.sidebar.collapsed", "true");
    render(<Page />);
    await screen.findByRole("button", { name: "展开左侧导航" });
    expect(screen.getByRole("navigation", { name: "主导航" })).toHaveClass(
      "collapsed",
    );
    expect(
      screen.getByRole("button", { name: "展开左侧导航" }),
    ).toBeInTheDocument();
  });

  test("restores the saved right panel width", async () => {
    window.localStorage.setItem("kflow.rightPanel.width", "640");
    render(<Page />);
    await openFirstTask();
    await userEvent.click(screen.getByRole("button", { name: "23 项上下文" }));
    expect(
      screen.getByRole("separator", { name: "调整辅助面板宽度" }),
    ).toHaveAttribute("aria-valuenow", "640");
  });

  test("resizes the right panel from the keyboard and persists the width", async () => {
    render(<Page />);
    await openFirstTask();
    await userEvent.click(screen.getByRole("button", { name: "23 项上下文" }));
    const separator = screen.getByRole("separator", {
      name: "调整辅助面板宽度",
    });
    separator.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(separator).toHaveAttribute("aria-valuenow", "576");
    expect(window.localStorage.getItem("kflow.rightPanel.width")).toBe("576");
    await userEvent.keyboard("{ArrowRight}");
    expect(separator).toHaveAttribute("aria-valuenow", "560");
  });

  test("resets the right panel width on double click", async () => {
    window.localStorage.setItem("kflow.rightPanel.width", "640");
    render(<Page />);
    await openFirstTask();
    await userEvent.click(screen.getByRole("button", { name: "23 项上下文" }));
    const separator = screen.getByRole("separator", {
      name: "调整辅助面板宽度",
    });
    await userEvent.dblClick(separator);
    expect(separator).toHaveAttribute("aria-valuenow", "560");
  });

  test("resizes the right panel with a pointer within its bounds", async () => {
    render(<Page />);
    await openFirstTask();
    await userEvent.click(screen.getByRole("button", { name: "展开左侧导航" }));
    await userEvent.click(screen.getByRole("button", { name: "23 项上下文" }));
    const separator = screen.getByRole("separator", {
      name: "调整辅助面板宽度",
    });
    fireEvent.pointerDown(separator, {
      button: 0,
      clientX: 800,
      isPrimary: true,
      pointerId: 1,
    });
    fireEvent.pointerMove(separator, {
      clientX: 700,
      isPrimary: true,
      pointerId: 1,
    });
    expect(separator).toHaveAttribute("aria-valuenow", "660");
    fireEvent.pointerMove(separator, { clientX: -1000, pointerId: 1 });
    expect(separator).toHaveAttribute("aria-valuenow", "732");
    fireEvent.pointerMove(separator, { clientX: 2000, pointerId: 1 });
    expect(separator).toHaveAttribute("aria-valuenow", "420");
    fireEvent.pointerUp(separator, { pointerId: 1 });
  });

  test("ignores non-primary pointer resizing", async () => {
    render(<Page />);
    await openFirstTask();
    await userEvent.click(screen.getByRole("button", { name: "23 项上下文" }));
    const separator = screen.getByRole("separator", {
      name: "调整辅助面板宽度",
    });
    fireEvent.pointerDown(separator, {
      button: 2,
      clientX: 800,
      isPrimary: true,
      pointerId: 1,
    });
    fireEvent.pointerMove(separator, { clientX: 700, pointerId: 1 });
    expect(separator).toHaveAttribute("aria-valuenow", "560");
  });

  test("reclamps a saved right panel width when the viewport narrows", async () => {
    window.localStorage.setItem("kflow.rightPanel.width", "900");
    render(<Page />);
    await openFirstTask();
    await userEvent.click(screen.getByRole("button", { name: "23 项上下文" }));
    const separator = screen.getByRole("separator", {
      name: "调整辅助面板宽度",
    });
    expect(separator).toHaveAttribute("aria-valuenow", "732");
    window.innerWidth = 1000;
    fireEvent(window, new Event("resize"));
    expect(separator).toHaveAttribute("aria-valuemax", "700");
    expect(separator).toHaveAttribute("aria-valuenow", "700");
  });

  test("matches the overlay resize bounds to the space beside the sidebar", async () => {
    window.innerWidth = 800;
    render(<Page />);
    await openFirstTask();
    await userEvent.click(screen.getByRole("button", { name: "展开左侧导航" }));
    await userEvent.click(screen.getByRole("button", { name: "23 项上下文" }));
    const separator = screen.getByRole("separator", {
      name: "调整辅助面板宽度",
    });
    expect(separator).toHaveAttribute("aria-valuemax", "552");
    expect(separator).toHaveAttribute("aria-valuenow", "552");
  });

  test("preserves the center stage at the inline breakpoint for both sidebar states", async () => {
    window.innerWidth = 1121;
    render(<Page />);
    await openFirstTask();
    await userEvent.click(screen.getByRole("button", { name: "展开左侧导航" }));
    await userEvent.click(screen.getByRole("button", { name: "23 项上下文" }));
    const separator = screen.getByRole("separator", {
      name: "调整辅助面板宽度",
    });
    expect(separator).toHaveAttribute("aria-valuemax", "453");
    expect(separator).toHaveAttribute("aria-valuenow", "453");

    await userEvent.click(screen.getByRole("button", { name: "收起左侧导航" }));
    expect(separator).toHaveAttribute("aria-valuemax", "637");
    expect(separator).toHaveAttribute("aria-valuenow", "453");
  });

  test("preserves the desktop panel preference across the mobile overlay", async () => {
    window.localStorage.setItem("kflow.rightPanel.width", "640");
    render(<Page />);
    await openFirstTask();
    await userEvent.click(screen.getByRole("button", { name: "23 项上下文" }));
    const separator = screen.getByRole("separator", {
      name: "调整辅助面板宽度",
    });

    window.innerWidth = 700;
    fireEvent(window, new Event("resize"));

    expect(separator).toHaveAttribute("aria-valuenow", "632");
    expect(window.localStorage.getItem("kflow.rightPanel.width")).toBe("640");
    expect(screen.getByRole("main")).toHaveStyle({
      "--right-panel-width": "640px",
    });

    window.innerWidth = 1400;
    fireEvent(window, new Event("resize"));
    expect(separator).toHaveAttribute("aria-valuenow", "640");
    expect(window.localStorage.getItem("kflow.rightPanel.width")).toBe("640");
  });

  test("navigates to projects from the fixed sidebar", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "项目" }));
    expect(screen.getByRole("heading", { name: "项目" })).toBeInTheDocument();
  });

  test("switches between research and office recommendations", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "新建任务" }));
    await userEvent.click(screen.getByRole("button", { name: "日常办公" }));
    expect(
      screen.getByRole("button", { name: /会议纪要 Agent/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText("开发 Agent")).not.toBeInTheDocument();
  });

  test("preserves office mode and all Agent-specific evidence workspaces", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "新建任务" }));
    await userEvent.click(screen.getByRole("button", { name: "日常办公" }));
    expect(screen.getByRole("button", { name: /会议纪要 Agent/ })).toBeInTheDocument();

    await openRoleRequirement();
    await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "development");
    expect(screen.getByRole("button", { name: "代码差异" })).toBeInTheDocument();
    expect(screen.queryByText("开发工作台")).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "testing");
    expect(screen.getByRole("button", { name: "测试报告" })).toBeInTheDocument();
    expect(screen.queryByText("测试工作台")).not.toBeInTheDocument();
  });

  test("uses system development copy on the new-task page", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "新建任务" }));
    expect(screen.getByRole("button", { name: "系统开发" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "代码开发" }),
    ).not.toBeInTheDocument();
  });

  test("opens adjustable automatic context from the task context count", async () => {
    render(<Page />);

    await openFirstTask();
    await userEvent.click(screen.getByRole("button", { name: "23 项上下文" }));

    expect(screen.getByRole("complementary", { name: "自动上下文" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "本次自动引用 6 项上下文" })).toBeInTheDocument();
  });

  test("opens the Agent-first project launcher without a fixed workflow", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "项目" }));
    await userEvent.click(
      screen.getByRole("button", { name: "打开企业客户门户 V3.2" }),
    );
    expect(screen.getByRole("heading", { name: "继续 Agent 工作" })).toBeInTheDocument();
    expect(screen.queryByText("研发流程")).not.toBeInTheDocument();
  });

  test("centers a project on Agent work and requirement entry", async () => {
    render(<Page />);
    await openCustomerPortal();

    expect(screen.getByRole("heading", { name: "继续 Agent 工作" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "继续 产品设计 Agent 对话" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "切换 角色与成员权限重构 状态" })).not.toBeInTheDocument();
  });


  test("enforces the signed-in project role and updates controls immediately", async () => {
    render(<Page />);
    await setCurrentUserRole("viewer");
    await userEvent.click(
      screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" }),
    );
    expect(screen.getByText("当前角色仅可查看")).toBeInTheDocument();
    expect(screen.getByLabelText("任务输入")).toBeDisabled();
    await userEvent.click(
      screen.getByRole("button", { name: "6 项上下文" }),
    );
    const interview = screen.getByRole("checkbox", { name: "引用角色权限访谈纪要" });
    const memoryLock = screen.getByRole("button", { name: "锁定项目决策记忆" });
    expect(interview).toBeDisabled();
    expect(memoryLock).toBeDisabled();
    expect(interview).toBeChecked();
    await userEvent.click(interview);
    expect(interview).toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));
    await userEvent.click(
      screen.getByRole("button", { name: "开发任务：完善角色管理 PRD14:32" }),
    );
    expect(screen.getByText("当前角色仅可查看")).toBeInTheDocument();
    expect(screen.getByLabelText("任务输入")).toBeDisabled();
  });

  test("keeps unscoped office work editable without a selected project", async () => {
    render(<Page />);

    await userEvent.click(
      screen.getByRole("button", { name: "办公任务：Q3 经营分析报告7 月 12 日" }),
    );

    expect(screen.getByRole("heading", { name: "Q3 经营分析报告" })).toBeInTheDocument();
    expect(screen.getByText("任务 · 7 月 12 日")).toBeInTheDocument();
    expect(screen.getByText(/Q3 营收同比增长/)).toBeInTheDocument();
    expect(screen.getByText("✦ 数据分析 Agent")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "完善角色管理 PRD" })).not.toBeInTheDocument();
    expect(screen.queryByText(/租户管理员、项目管理员和普通成员/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "查看角色管理模块 PRD v1.3" })).not.toBeInTheDocument();
    expect(screen.queryByText("当前角色仅可查看")).not.toBeInTheDocument();
    expect(screen.getByLabelText("任务输入")).toBeEnabled();
    await userEvent.type(screen.getByLabelText("任务输入"), "总结本季度趋势");
    await userEvent.click(screen.getByRole("button", { name: "发送" }));
    expect(screen.getByText("总结本季度趋势")).toBeInTheDocument();
    expect(screen.getByText("读取项目上下文")).toBeInTheDocument();
  });

  test("opens every recent task with its own content and active Agent", async () => {
    render(<Page />);
    const taskCases = [
      ["开发任务：完善角色管理 PRD14:32", "完善角色管理 PRD", /租户管理员、项目管理员和普通成员/, "product-design"],
      ["开发任务：实现权限配置页面昨天", "实现权限配置页面", /观察者的操作范围已分别覆盖/, "development"],
      ["开发任务：分析登录失败问题周一", "分析登录失败问题", /登录失败集中在过期会话/, "development"],
      ["办公任务：Q3 经营分析报告7 月 12 日", "Q3 经营分析报告", /Q3 营收同比增长/, "data-analysis"],
    ] as const;

    for (const [buttonName, title, content, agentId] of taskCases) {
      await userEvent.click(screen.getByRole("button", { name: buttonName }));
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      expect(screen.getByText(content)).toBeInTheDocument();
      expect(screen.getByLabelText("选择 Agent")).toHaveValue(agentId);
    }
  });

  test("restores a task-specific Agent after switching tasks", async () => {
    render(<Page />);
    await userEvent.click(
      screen.getByRole("button", { name: "开发任务：实现权限配置页面昨天" }),
    );
    await userEvent.selectOptions(
      screen.getByLabelText("选择 Agent"),
      "development",
    );
    expect(screen.getByLabelText("选择 Agent")).toHaveValue("development");

    await userEvent.click(
      screen.getByRole("button", { name: "办公任务：Q3 经营分析报告7 月 12 日" }),
    );
    expect(screen.getByLabelText("选择 Agent")).toHaveValue("data-analysis");
    await userEvent.click(
      screen.getByRole("button", { name: "开发任务：实现权限配置页面昨天" }),
    );

    expect(screen.getByLabelText("选择 Agent")).toHaveValue("development");
  });

  test("opens login-failure work with its own project, Agent, and conversation", async () => {
    render(<Page />);

    await userEvent.click(
      screen.getByRole("button", { name: "开发任务：分析登录失败问题周一" }),
    );

    expect(screen.getByRole("heading", { name: "分析登录失败问题" })).toBeInTheDocument();
    expect(screen.getByText("任务 · 周一")).toBeInTheDocument();
    expect(screen.getAllByText("智能报销系统").length).toBeGreaterThan(0);
    expect(screen.getByText("✦ 开发 Agent")).toBeInTheDocument();
    expect(screen.getByText(/登录失败集中在过期会话/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "完善角色管理 PRD" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "查看角色管理模块 PRD v1.3" })).not.toBeInTheDocument();
  });

  test("lets product edit product artifacts but not development or test artifacts", async () => {
    render(<Page />);
    await setCurrentUserRole("product");
    await userEvent.click(
      screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" }),
    );

    await userEvent.click(screen.getByRole("button", { name: "PRD" }));
    expect(screen.getByLabelText("精准引用修改要求")).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));
    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
    await userEvent.click(screen.getByRole("button", { name: "原型" }));
    expect(screen.getByRole("button", { name: "组件可选" })).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));
    await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "testing");
    expect(screen.getByLabelText("任务输入")).toBeDisabled();
    await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "development");
    expect(screen.getByLabelText("任务输入")).toBeDisabled();
  });

  test("lets development edit code artifacts but not PRD artifacts", async () => {
    render(<Page />);
    await setCurrentUserRole("development");
    await userEvent.click(
      screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" }),
    );

    await userEvent.click(screen.getByRole("button", { name: "PRD" }));
    expect(screen.getByLabelText("精准引用修改要求")).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));
    await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "development");
    expect(screen.getByLabelText("任务输入")).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "代码差异" }));
    // development 可编辑代码：切到代码视图，编辑区非只读
    await userEvent.click(screen.getByRole("tab", { name: "代码" }));
    const codeArea = within(screen.getByLabelText("代码查看与编辑")).getByRole("textbox");
    expect(codeArea).not.toHaveAttribute("readOnly");
  });

  test("lets testing edit test artifacts but not development artifacts", async () => {
    render(<Page />);
    await setCurrentUserRole("testing");
    await userEvent.click(
      screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" }),
    );

    await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "development");
    expect(screen.getByLabelText("任务输入")).toBeDisabled();
    await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "testing");
    expect(screen.getByLabelText("任务输入")).toBeEnabled();
  });

  test("closes project settings with Escape", async () => {
    render(<Page />);
    await openCustomerPortal();
    await userEvent.click(screen.getByRole("button", { name: "项目设置" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("complementary", { name: "项目设置" })).not.toBeInTheDocument();
  });

  test("continues the latest Agent conversation from the project", async () => {
    render(<Page />);
    await openCustomerPortal();
    await userEvent.click(screen.getByRole("button", { name: "继续 产品设计 Agent 对话" }));

    expect(
      screen.getAllByRole("heading", { name: "角色与成员权限重构" }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("PRD 撰写工作台")).not.toBeInTheDocument();
    expect(screen.getAllByText("角色与成员权限重构").length).toBeGreaterThan(0);
  });

  test("shows resumable Agent sessions and multiple requirements", async () => {
    render(<Page />);
    await openCustomerPortal();

    for (const label of ["继续 产品设计 Agent 对话", "继续 测试 Agent 对话"]) {
      expect(
        screen.getByRole("button", { name: label }),
      ).toBeInTheDocument();
    }
    expect(screen.getAllByText("角色与成员权限重构").length).toBeGreaterThan(0);
    expect(screen.getAllByText("企业 SSO 登录体验优化").length).toBeGreaterThan(0);
    expect(screen.getAllByText("权限审计记录导出").length).toBeGreaterThan(0);
  });

  test("shows an accurate empty project state without an empty recent section", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "项目" }));
    await userEvent.click(screen.getByRole("button", { name: "打开智能报销系统" }));

    expect(screen.queryByRole("heading", { name: "继续 Agent 工作" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "还没有需求" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新建需求" })).toBeInTheDocument();
    expect(screen.getByText("项目上下文尚未连接")).toBeInTheDocument();
    expect(screen.queryByText("Agent 协作上下文已就绪")).not.toBeInTheDocument();
  });

  test("uses the canonical conversation page for requirement Agent work", async () => {
    render(<Page />);
    await openRoleRequirement();

    expect(
      screen.getAllByRole("heading", { name: "角色与成员权限重构" }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByLabelText("任务输入")).toBeInTheDocument();
    expect(screen.getByLabelText("选择 Agent")).toHaveValue("product-design");
    expect(screen.getByRole("button", { name: "PRD 撰写" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "6 项上下文" })).toBeInTheDocument();
    expect(screen.queryByText("PRD 撰写工作台")).not.toBeInTheDocument();
    expect(screen.queryByText("原型设计工作台")).not.toBeInTheDocument();
  });

  test("opens a requirement and changes workspace with the selected Agent", async () => {
    render(<Page />);
    await openRoleRequirement();
    expect(screen.getByText("任务 · REQ-032 · Spec v1.4")).toBeInTheDocument();
    expect(screen.queryByText("PRD 撰写工作台")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
    expect(screen.getByRole("button", { name: "原型" })).toBeInTheDocument();
    expect(screen.queryByText("原型设计工作台")).not.toBeInTheDocument();
  });

  test("uses one product Agent with freely switchable work modes", async () => {
    render(<Page />);
    await openRoleRequirement();
    expect(screen.getByLabelText("选择 Agent")).toHaveValue("product-design");
    expect(screen.getByRole("button", { name: "PRD 撰写" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
    expect(screen.getByRole("button", { name: "原型设计与审计" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("任务输入")).toBeInTheDocument();
  });

  test("keeps Agent and automatic context primary inside a requirement", async () => {
    render(<Page />);
    await openRoleRequirement();

    expect(screen.getByLabelText("选择 Agent")).toHaveValue("product-design");
    expect(
      screen.getByRole("button", { name: "6 项上下文" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("任务输入")).toBeInTheDocument();
    expect(screen.queryByLabelText("切换需求状态")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "更多需求操作" })).toBeInTheDocument();
  });

  test("opens automatic context from the requirement composer", async () => {
    render(<Page />);
    await openRoleRequirement();

    await userEvent.click(
      screen.getByRole("button", { name: "6 项上下文" }),
    );

    expect(screen.getByRole("complementary", { name: "自动上下文" })).toBeInTheDocument();
  });

  test("keeps requirement Agent execution and result visible in its workspace", async () => {
    render(<Page />);
    await openRoleRequirement();

    await userEvent.type(screen.getByLabelText("任务输入"), "补充观察者权限边界");
    await userEvent.click(screen.getByRole("button", { name: "发送" }));

    expect(screen.getByText("补充观察者权限边界")).toBeInTheDocument();
    expect(screen.getByText(/REQ-032 的本轮处理已完成/)).toBeInTheDocument();
    expect(screen.getByText("执行产物已生成，下一步由你决定。")).toBeInTheDocument();
    expect(screen.queryByText("PRD 撰写工作台")).not.toBeInTheDocument();
  });

  test("resumes SSO with requirement-bound tests and context", async () => {
    render(<Page />);
    await openCustomerPortal();
    await userEvent.click(screen.getByRole("button", { name: "继续 测试 Agent 对话" }));

    expect(screen.getAllByText("企业 SSO 登录体验优化").length).toBeGreaterThan(0);
    expect(screen.queryByText("AC-07")).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "5 项上下文" }),
    );
    expect(screen.getByText("REQ-029 Spec v2.1")).toBeInTheDocument();
    expect(screen.queryByText("REQ-032 Spec v1.4")).not.toBeInTheDocument();
  });

  test("keeps a requirement atomically attached to its project", async () => {
    render(<Page />);
    await openRoleRequirement();

    expect(screen.queryByLabelText("选择项目")).not.toBeInTheDocument();
    expect(screen.getByText("已关联项目：企业客户门户 V3.2")).toBeInTheDocument();
  });

  test("requires unlocking a source before it can be removed", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.click(
      screen.getByRole("button", { name: "6 项上下文" }),
    );

    const lockedSpec = screen.getByRole("checkbox", { name: "引用REQ-032 Spec v1.4" });
    expect(lockedSpec).toBeDisabled();
    await userEvent.click(
      screen.getByRole("button", { name: "解除锁定REQ-032 Spec v1.4" }),
    );
    expect(lockedSpec).toBeEnabled();
    await userEvent.click(lockedSpec);
    expect(screen.getByText("本次自动引用 5 项上下文")).toBeInTheDocument();
  });

  test("opens more requirement actions without governance entry", async () => {
    render(<Page />);
    await openRoleRequirement();

    await userEvent.click(screen.getByRole("button", { name: "更多需求操作" }));
    expect(screen.getByRole("button", { name: "编辑负责人" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "归档需求" })).toBeInTheDocument();
    // 需求状态与门禁已移除
    expect(screen.queryByRole("button", { name: "调整状态与门禁" })).not.toBeInTheDocument();
  });

  test("previews the prototype from Product Design prototype mode", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
    await userEvent.click(
      screen.getByRole("button", { name: "原型" }),
    );
    expect(
      screen.getByRole("complementary", { name: "页面预览" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/权限概览|成员列表/).length).toBeGreaterThan(0);
  });

  test("opens the editable prototype drawer with a standalone browser link", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
    await userEvent.click(
      screen.getByRole("button", { name: "原型" }),
    );

    const drawer = screen.getByRole("complementary", { name: "页面预览" });
    expect(
      within(drawer).getByRole("link", { name: "浏览器打开" }),
    ).toHaveAttribute("href", "/prototype?mode=inspect");
    await userEvent.click(
      within(drawer).getByRole("button", { name: "保存角色" }),
    );
    expect(within(drawer).getByText("AC-07")).toBeInTheDocument();
  });

  test("keeps applied prototype edits after closing and reopening the drawer", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
    await userEvent.click(
      screen.getByRole("button", { name: "原型" }),
    );
    let drawer = screen.getByRole("complementary", { name: "页面预览" });
    await userEvent.click(
      within(drawer).getByRole("button", { name: "选择添加成员按钮" }),
    );
    await userEvent.clear(within(drawer).getByLabelText("元素文案"));
    await userEvent.type(within(drawer).getByLabelText("元素文案"), "邀请成员");
    await userEvent.click(within(drawer).getByRole("button", { name: "预览修改" }));
    await userEvent.click(within(drawer).getByRole("button", { name: "应用修改" }));
    await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));

    await userEvent.click(screen.getByRole("button", { name: "原型" }));
    drawer = screen.getByRole("complementary", { name: "页面预览" });
    expect(
      within(drawer).getByRole("button", { name: "选择邀请成员按钮" }),
    ).toBeInTheDocument();
  });

  test("retains an unconfirmed prototype preview when closing the drawer", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
    await userEvent.click(
      screen.getByRole("button", { name: "原型" }),
    );
    const drawer = screen.getByRole("complementary", { name: "页面预览" });
    await userEvent.click(
      within(drawer).getByRole("button", { name: "选择添加成员按钮" }),
    );
    await userEvent.clear(within(drawer).getByLabelText("元素文案"));
    await userEvent.type(within(drawer).getByLabelText("元素文案"), "邀请同事");
    await userEvent.click(within(drawer).getByRole("button", { name: "预览修改" }));
    expect(document.querySelector(".client-shell")).toHaveAttribute(
      "data-prototype-pending",
      "true",
    );
    await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));

    expect(
      screen.getByRole("dialog", { name: "未确认的原型修改" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "保留修改并离开" }));
    await userEvent.click(screen.getByRole("button", { name: "原型" }));
    expect(screen.getByText(/添加成员 → 邀请同事/)).toBeInTheDocument();
  });

  test("discards only the pending prototype draft on a product-mode switch", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
    await userEvent.click(
      screen.getByRole("button", { name: "原型" }),
    );
    const drawer = screen.getByRole("complementary", { name: "页面预览" });
    await userEvent.click(
      within(drawer).getByRole("button", { name: "选择添加成员按钮" }),
    );
    await userEvent.clear(within(drawer).getByLabelText("元素文案"));
    await userEvent.type(within(drawer).getByLabelText("元素文案"), "邀请成员");
    await userEvent.click(within(drawer).getByRole("button", { name: "预览修改" }));
    await userEvent.click(within(drawer).getByRole("button", { name: "应用修改" }));
    await userEvent.clear(within(drawer).getByLabelText("元素文案"));
    await userEvent.type(within(drawer).getByLabelText("元素文案"), "邀请同事");
    await userEvent.click(within(drawer).getByRole("button", { name: "预览修改" }));

    await userEvent.click(screen.getByRole("button", { name: "PRD 撰写" }));
    expect(
      screen.getByRole("dialog", { name: "未确认的原型修改" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "放弃修改并离开" }));
    expect(screen.getByRole("button", { name: "PRD 撰写" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
    await userEvent.click(
      screen.getByRole("button", { name: "原型" }),
    );
    const updatedDrawer = screen.getByRole("complementary", {
      name: "页面预览",
    });
    expect(
      within(updatedDrawer).getByRole("button", { name: "选择邀请成员按钮" }),
    ).toBeInTheDocument();
    expect(
      within(updatedDrawer).queryByText(/邀请成员 → 邀请同事/),
    ).not.toBeInTheDocument();
  });

  test("guards requirement navigation from a resumed Agent session", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
    await userEvent.click(
      screen.getByRole("button", { name: "原型" }),
    );
    const drawer = screen.getByRole("complementary", { name: "页面预览" });
    await userEvent.click(
      within(drawer).getByRole("button", { name: "选择添加成员按钮" }),
    );
    await userEvent.clear(within(drawer).getByLabelText("元素文案"));
    await userEvent.type(within(drawer).getByLabelText("元素文案"), "邀请同事");
    await userEvent.click(within(drawer).getByRole("button", { name: "预览修改" }));
    await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));
    await userEvent.click(screen.getByRole("button", { name: "保留修改并离开" }));

    await userEvent.click(
      screen.getByRole("button", { name: /企业客户门户 V3.2/ }),
    );
    await userEvent.click(screen.getByRole("button", { name: "保留修改并离开" }));
    await userEvent.click(
      screen.getByRole("button", { name: "继续 测试 Agent 对话" }),
    );

    expect(
      screen.getByRole("dialog", { name: "未确认的原型修改" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "放弃修改并离开" }));
    expect(
      screen.getByRole("heading", { name: "企业 SSO 登录体验优化" }),
    ).toBeInTheDocument();
  });

  test("publishes the signed-in project product capability for standalone tabs", async () => {
    render(<Page />);
    await waitFor(() => {
      expect(
        JSON.parse(
          window.localStorage.getItem(
            "kflow.projectCapability.customer-portal",
          ) ?? "{}",
        ),
      ).toMatchObject({ canEditProductArtifacts: true, roles: ["product", "development"] });
    });

    await setCurrentUserRole("viewer");
    await waitFor(() => {
      expect(
        JSON.parse(
          window.localStorage.getItem(
            "kflow.projectCapability.customer-portal",
          ) ?? "{}",
        ),
      ).toMatchObject({ canEditProductArtifacts: false, roles: ["viewer"] });
    });
  });

  test("keeps viewer prototype browser links and drawer controls read only", async () => {
    render(<Page />);
    await setCurrentUserRole("viewer");
    await userEvent.click(
      screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));

    await userEvent.click(
      screen.getByRole("button", { name: "原型" }),
    );
    const drawer = screen.getByRole("complementary", { name: "页面预览" });
    // viewer 只读：ProductPanel 编辑控件应 disabled
    expect(within(drawer).getByRole("button", { name: "新增页面" })).toBeDisabled();
    await userEvent.click(within(drawer).getByRole("button", { name: "保存角色" }));
    expect(within(drawer).getByLabelText("组件文案")).toBeDisabled();
  });

  test("revises a PRD with natural language and opens PDF preview", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.click(screen.getByRole("button", { name: "PRD 撰写" }));
    await userEvent.click(screen.getByRole("button", { name: "PRD" }));
    const input = screen.getByLabelText("精准引用修改要求");
    await userEvent.type(input, "增加批量修改角色的二次确认说明");
    await userEvent.click(
      screen.getByRole("button", { name: "发送到主对话" }),
    );
    expect(screen.getAllByText(/二次确认说明/).length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("button", { name: "确认并生成新版本" }));
    expect(
      screen.getByRole("complementary", { name: "产物预览" }),
    ).toBeInTheDocument();
  });

  test("retains an unconfirmed PRD revision when leaving with the back button", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.click(screen.getByRole("button", { name: "PRD" }));
    await userEvent.type(
      screen.getByLabelText("精准引用修改要求"),
      "调整角色批量操作说明",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "发送到主对话" }),
    );
    await userEvent.click(screen.getByRole("button", { name: /企业客户门户 V3.2/ }));
    expect(screen.getByRole("dialog", { name: "未确认的 PRD 修订" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "保留修订并离开" }));
    await userEvent.click(
      screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "PRD" }));
    expect(screen.getByText("调整角色批量操作说明")).toBeInTheDocument();
  });

  test("discards an unconfirmed PRD revision before sidebar navigation", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.click(screen.getByRole("button", { name: "PRD" }));
    await userEvent.type(screen.getByLabelText("精准引用修改要求"), "这条修订应被放弃");
    await userEvent.click(screen.getByRole("button", { name: "发送到主对话" }));
    await userEvent.click(screen.getByRole("button", { name: "智能资产" }));
    await userEvent.click(screen.getByRole("button", { name: "放弃修订并离开" }));

    expect(screen.getByRole("heading", { name: "智能资产" })).toBeInTheDocument();
    await openRoleRequirement();
    expect(screen.queryByText("这条修订应被放弃")).not.toBeInTheDocument();
  });

  test("returns to an unconfirmed PRD revision from guarded sidebar navigation", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.click(screen.getByRole("button", { name: "PRD" }));
    await userEvent.type(screen.getByLabelText("精准引用修改要求"), "继续确认这条修订");
    await userEvent.click(screen.getByRole("button", { name: "发送到主对话" }));
    await userEvent.click(screen.getByRole("button", { name: "项目" }));
    await userEvent.click(screen.getByRole("button", { name: "返回继续确认" }));

    expect(
      screen.getAllByRole("heading", { name: "角色与成员权限重构" }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("继续确认这条修订")).toBeInTheDocument();
  });


  test("keeps PRD and prototype document previews open from Project Assets", async () => {
    render(<Page />);
    await openCustomerPortal();
    await userEvent.click(screen.getByRole("button", { name: "项目设置" }));
    await userEvent.click(screen.getByRole("button", { name: "上下文维护" }));
    await userEvent.click(screen.getByRole("button", { name: "管理全部产品文档" }));

    await userEvent.click(
      screen.getByRole("button", { name: "查看角色与成员权限 PRD" }),
    );
    expect(
      screen.getByRole("complementary", { name: "产物预览" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));

    await userEvent.click(
      screen.getByRole("button", { name: "查看角色配置交互原型" }),
    );
    expect(
      screen.getByRole("complementary", { name: "页面预览" }),
    ).toBeInTheDocument();
  });

  test("guards a Project Assets prototype View while prototype work is pending", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
    await userEvent.click(
      screen.getByRole("button", { name: "原型" }),
    );
    const drawer = screen.getByRole("complementary", { name: "页面预览" });
    await userEvent.click(
      within(drawer).getByRole("button", { name: "选择添加成员按钮" }),
    );
    await userEvent.clear(within(drawer).getByLabelText("元素文案"));
    await userEvent.type(within(drawer).getByLabelText("元素文案"), "邀请同事");
    await userEvent.click(
      within(drawer).getByRole("button", { name: "预览修改" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));
    await userEvent.click(screen.getByRole("button", { name: "保留修改并离开" }));
    await userEvent.click(screen.getByRole("button", { name: "更多需求操作" }));
    await userEvent.click(screen.getByRole("button", { name: "调整状态与门禁" }));
    await userEvent.click(screen.getByRole("button", { name: "上下文维护" }));
    await userEvent.click(screen.getByRole("button", { name: "管理全部产品文档" }));
    await userEvent.click(screen.getByRole("button", { name: "保留修改并离开" }));

    await userEvent.click(
      screen.getByRole("button", { name: "查看角色配置交互原型" }),
    );
    expect(
      screen.getByRole("dialog", { name: "未确认的原型修改" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "保留修改并离开" }));
    expect(
      screen.getByRole("complementary", { name: "页面预览" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/添加成员 → 邀请同事/)).toBeInTheDocument();
  });



  test("opens the code diff from a development Agent conversation", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.selectOptions(
      screen.getByLabelText("选择 Agent"),
      "development",
    );
    expect(screen.getByLabelText("任务输入")).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "代码差异" }));
    expect(
      screen.getByRole("complementary", { name: "代码差异" }),
    ).toBeInTheDocument();
  });

  test("shows Spec-linked test cases and a test report", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.selectOptions(
      screen.getByLabelText("选择 Agent"),
      "testing",
    );
    await userEvent.click(screen.getByRole("button", { name: "测试报告" }));
    expect(
      screen.getByRole("complementary", { name: "测试报告" }),
    ).toBeInTheDocument();
    expect(screen.getByText("用例")).toBeInTheDocument();
    expect(screen.getByText("通过率")).toBeInTheDocument();
  });

  test("shows all governed smart asset categories", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "智能资产" }));
    for (const label of [
      "Skill",
      "插件",
      "MCP",
      "Agent",
      "代码库",
      "知识库",
      "记忆库",
    ]) {
      expect(screen.getByRole("tab", { name: label })).toBeInTheDocument();
    }
  });

  test("shows reusable Skills and connected plugins as Agent assets", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "智能资产" }));

    await userEvent.click(screen.getByRole("tab", { name: "Skill" }));
    expect(screen.getByRole("heading", { name: "PRD 专业写作" })).toBeInTheDocument();
    expect(screen.getByText("团队 Skill")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "插件" }));
    expect(screen.getByRole("heading", { name: "GitHub" })).toBeInTheDocument();
    expect(screen.getByText("代码、Pull Request 与 Issue")).toBeInTheDocument();
  });

  test("opens a Codex-inspired personal Agent settings page", async () => {
    render(<Page />);
    await userEvent.click(
      screen.getByRole("button", { name: "打开陈楠个人页面" }),
    );

    expect(screen.getByRole("heading", { name: "个人设置" })).toBeInTheDocument();
    for (const section of [
      "账号与企业工作区",
      "Agent 偏好",
      "Skill 与插件",
      "连接与权限",
      "通知",
    ]) {
      expect(screen.getByRole("heading", { name: section })).toBeInTheDocument();
    }
  });

  test("sends a task with the selected Agent", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "新建任务" }));
    await userEvent.selectOptions(
      screen.getByLabelText("选择 Agent"),
      "development",
    );
    await userEvent.type(
      screen.getByLabelText("任务输入"),
      "实现权限配置页面",
    );
    await userEvent.click(screen.getByRole("button", { name: "发送" }));
    expect(screen.getByText("读取项目上下文")).toBeInTheDocument();
  });

  test("opens a PRD preview and closes it with Escape", async () => {
    render(<Page />);
    await openFirstTask();
    expect(
      screen.getByRole("complementary", { name: "产物预览" }),
    ).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(
      screen.queryByRole("complementary", { name: "产物预览" }),
    ).not.toBeInTheDocument();
  });

  test("exposes the three product regions", async () => {
    render(<Page />);
    await openFirstTask();
    expect(screen.getByRole("navigation", { name: "主导航" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByLabelText("辅助工具")).toBeInTheDocument();
  });

  test("keeps the three product regions and office mode", async () => {
    render(<Page />);
    await openFirstTask();
    expect(screen.getByRole("navigation", { name: "主导航" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByLabelText("辅助工具")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "新建任务" }));
    await userEvent.click(screen.getByRole("button", { name: "日常办公" }));
    expect(screen.getByRole("button", { name: /会议纪要 Agent/ })).toBeInTheDocument();
  });

  test("changes the auxiliary rail with the active office and product Agent", async () => {
    render(<Page />);
    await userEvent.click(
      screen.getByRole("button", { name: "办公任务：Q3 经营分析报告7 月 12 日" }),
    );
    expect(screen.getByRole("button", { name: "图表预览" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "代码差异" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "测试报告" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "项目" }));
    await userEvent.click(
      screen.getByRole("button", { name: "打开企业客户门户 V3.2" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
    expect(screen.getByRole("button", { name: "原型" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "交付检查" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "测试报告" })).not.toBeInTheDocument();
  });

  test("closes task-specific evidence when switching to an incompatible Agent", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "testing");
    await userEvent.click(screen.getByRole("button", { name: "测试报告" }));
    expect(screen.getByRole("complementary", { name: "测试报告" })).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "product-design");
    await userEvent.click(screen.getByRole("button", { name: "原型设计与审计" }));
    expect(screen.queryByRole("complementary", { name: "测试报告" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "原型" })).toBeInTheDocument();
  });

});
