import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import Page from "../page";

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
  role: "admin" | "product" | "development" | "testing" | "viewer",
) {
  await openCustomerPortal();
  await userEvent.click(screen.getByRole("button", { name: "项目设置" }));
  await userEvent.click(screen.getByRole("button", { name: "成员与角色" }));
  await userEvent.selectOptions(
    screen.getByLabelText("修改陈楠的项目角色"),
    role,
  );
  await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));
}

describe("enterprise AI client demo", () => {
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
    expect(screen.queryByText("前端开发 Agent")).not.toBeInTheDocument();
  });

  test("preserves office mode and all Agent-specific evidence workspaces", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "新建任务" }));
    await userEvent.click(screen.getByRole("button", { name: "日常办公" }));
    expect(screen.getByRole("button", { name: /会议纪要 Agent/ })).toBeInTheDocument();

    await openRoleRequirement();
    await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "frontend-dev");
    expect(screen.getByRole("heading", { name: "开发工作台" })).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("选择 Agent"), "testing");
    expect(screen.getByRole("heading", { name: "测试工作台" })).toBeInTheDocument();
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
    expect(screen.getByRole("button", { name: "继续 PRD 撰写 Agent 对话" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "从需求开始" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "查看自动上下文来源" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "切换 角色与成员权限重构 状态" })).not.toBeInTheDocument();
  });

  test("keeps governance editable in secondary project settings", async () => {
    render(<Page />);
    await openCustomerPortal();
    expect(screen.queryByRole("button", { name: "管理成员" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "项目设置" }));

    expect(screen.getByRole("complementary", { name: "项目设置" })).toBeInTheDocument();
    expect(screen.getByText("当前角色：项目管理员")).toBeInTheDocument();
    expect(screen.queryByLabelText("修改林川的项目角色")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("设置角色与成员权限重构状态")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "成员与角色" }));
    await userEvent.selectOptions(
      screen.getByLabelText("修改林川的项目角色"),
      "testing",
    );
    expect(screen.getByLabelText("修改林川的项目角色")).toHaveValue("testing");
    await userEvent.click(screen.getByRole("button", { name: "需求状态与门禁" }));
    await userEvent.selectOptions(screen.getByLabelText("设置角色与成员权限重构状态"), "testing");
    expect(screen.getByLabelText("设置角色与成员权限重构状态")).toHaveValue("testing");
    expect(screen.getByText(/产品方案已确认/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "上下文维护" }));
    await userEvent.click(screen.getByRole("button", { name: "管理全部产品文档" }));
    expect(screen.getByRole("heading", { name: "产品文档" })).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "项目设置" })).not.toBeInTheDocument();
  });

  test("enforces the signed-in project role and updates controls immediately", async () => {
    render(<Page />);
    await openCustomerPortal();
    await userEvent.click(screen.getByRole("button", { name: "项目设置" }));
    await userEvent.click(screen.getByRole("button", { name: "成员与角色" }));
    await userEvent.selectOptions(
      screen.getByLabelText("修改陈楠的项目角色"),
      "viewer",
    );

    expect(screen.getByText("当前角色仅可查看")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "添加成员" })).toBeDisabled();
    expect(screen.getByLabelText("修改林川的项目角色")).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));
    await userEvent.click(
      screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" }),
    );
    expect(screen.getByText("当前角色仅可查看")).toBeInTheDocument();
    expect(screen.getByLabelText("任务输入")).toBeDisabled();
    await userEvent.click(
      screen.getByRole("button", { name: "查看本次 6 项自动上下文" }),
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
      screen.getByRole("button", { name: "完善角色管理 PRD14:32" }),
    );
    expect(screen.getByText("当前角色仅可查看")).toBeInTheDocument();
    expect(screen.getByLabelText("任务输入")).toBeDisabled();
  });

  test("keeps unscoped office work editable without a selected project", async () => {
    render(<Page />);

    await userEvent.click(
      screen.getByRole("button", { name: "Q3 经营分析报告7 月 12 日" }),
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

  test("opens login-failure work with its own project, Agent, and conversation", async () => {
    render(<Page />);

    await userEvent.click(
      screen.getByRole("button", { name: "分析登录失败问题周一" }),
    );

    expect(screen.getByRole("heading", { name: "分析登录失败问题" })).toBeInTheDocument();
    expect(screen.getByText("任务 · 周一")).toBeInTheDocument();
    expect(screen.getAllByText("智能报销系统").length).toBeGreaterThan(0);
    expect(screen.getByText("✦ 后端开发 Agent")).toBeInTheDocument();
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

    expect(screen.getByLabelText("PRD 修改要求")).toBeEnabled();
    await userEvent.selectOptions(screen.getByLabelText("切换工作台 Agent"), "prototype");
    await userEvent.click(screen.getByRole("button", { name: "预览角色配置页面" }));
    expect(screen.getByRole("button", { name: "在画布中编辑" })).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));
    await userEvent.selectOptions(screen.getByLabelText("切换工作台 Agent"), "testing");
    await userEvent.click(screen.getByRole("button", { name: "查看角色管理测试报告" }));
    expect(screen.getByRole("button", { name: "创建修复任务" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "关闭预览" }));
    await userEvent.selectOptions(screen.getByLabelText("切换工作台 Agent"), "frontend-dev");
    expect(screen.getByLabelText("角色面板任务状态")).toBeDisabled();
    expect(screen.getByLabelText("任务输入")).toBeDisabled();
  });

  test("lets development edit code artifacts but not PRD artifacts", async () => {
    render(<Page />);
    await setCurrentUserRole("development");
    await userEvent.click(
      screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" }),
    );

    expect(screen.getByLabelText("PRD 修改要求")).toBeDisabled();
    await userEvent.selectOptions(screen.getByLabelText("切换工作台 Agent"), "frontend-dev");
    expect(screen.getByLabelText("角色面板任务状态")).toBeEnabled();
    expect(screen.getByLabelText("任务输入")).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "查看角色面板代码差异" }));
    expect(screen.getByRole("button", { name: "接受变更" })).toBeEnabled();
  });

  test("lets testing edit test artifacts but not development artifacts", async () => {
    render(<Page />);
    await setCurrentUserRole("testing");
    await userEvent.click(
      screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" }),
    );

    await userEvent.selectOptions(screen.getByLabelText("切换工作台 Agent"), "frontend-dev");
    expect(screen.getByLabelText("角色面板任务状态")).toBeDisabled();
    await userEvent.selectOptions(screen.getByLabelText("切换工作台 Agent"), "testing");
    expect(screen.getByLabelText("任务输入")).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "查看角色管理测试报告" }));
    expect(screen.getByRole("button", { name: "创建修复任务" })).toBeEnabled();
  });

  test("shows and adjusts Agent-selected context", async () => {
    render(<Page />);
    await openCustomerPortal();
    await userEvent.click(screen.getByRole("button", { name: "查看自动上下文来源" }));

    expect(screen.getByRole("complementary", { name: "自动上下文" })).toBeInTheDocument();
    expect(screen.getByText("本次自动引用 6 项上下文")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: "引用角色权限访谈纪要" }));
    expect(screen.getByText("本次自动引用 5 项上下文")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "锁定项目决策记忆" }));
    expect(screen.getByRole("button", { name: "解除锁定项目决策记忆" })).toBeInTheDocument();
  });

  test("closes automatic context and project settings with Escape", async () => {
    render(<Page />);
    await openCustomerPortal();
    await userEvent.click(screen.getByRole("button", { name: "查看自动上下文来源" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("complementary", { name: "自动上下文" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "项目设置" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("complementary", { name: "项目设置" })).not.toBeInTheDocument();
  });

  test("continues the latest Agent conversation from the project", async () => {
    render(<Page />);
    await openCustomerPortal();
    await userEvent.click(screen.getByRole("button", { name: "继续 PRD 撰写 Agent 对话" }));

    expect(screen.getByRole("heading", { name: "PRD 撰写工作台" })).toBeInTheDocument();
    expect(screen.getAllByText("角色与成员权限重构").length).toBeGreaterThan(0);
  });

  test("shows resumable Agent sessions and multiple requirements", async () => {
    render(<Page />);
    await openCustomerPortal();

    for (const label of ["继续 PRD 撰写 Agent 对话", "继续 测试 Agent 对话"]) {
      expect(
        screen.getByRole("button", { name: label }),
      ).toBeInTheDocument();
    }
    expect(screen.getAllByText("角色与成员权限重构").length).toBeGreaterThan(0);
    expect(screen.getAllByText("企业 SSO 登录体验优化").length).toBeGreaterThan(0);
    expect(screen.getByText("权限审计记录导出")).toBeInTheDocument();
  });

  test("shows an accurate empty project state without an empty recent section", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "项目" }));
    await userEvent.click(screen.getByRole("button", { name: "打开智能报销系统" }));

    expect(screen.queryByRole("heading", { name: "继续 Agent 工作" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "还没有需求" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新建需求" })).toBeInTheDocument();
    expect(screen.getByText("尚未为该项目连接自动上下文来源")).toBeInTheDocument();
    expect(screen.getByText("项目上下文尚未连接")).toBeInTheDocument();
    expect(screen.queryByText("Agent 协作上下文已就绪")).not.toBeInTheDocument();
  });

  test("opens a requirement and changes workspace with the selected Agent", async () => {
    render(<Page />);
    await openRoleRequirement();
    expect(screen.getByText("Spec v1.4")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "PRD 撰写工作台" }),
    ).toBeInTheDocument();

    await userEvent.selectOptions(
      screen.getByLabelText("选择 Agent"),
      "prototype",
    );
    expect(
      screen.getByRole("heading", { name: "原型设计工作台" }),
    ).toBeInTheDocument();
  });

  test("keeps Agent and automatic context primary inside a requirement", async () => {
    render(<Page />);
    await openRoleRequirement();

    expect(screen.getByLabelText("切换工作台 Agent")).toHaveValue("prd-writer");
    expect(
      screen.getByRole("button", { name: "查看本次 6 项自动上下文" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("任务输入")).toBeInTheDocument();
    expect(screen.queryByLabelText("切换需求状态")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "更多需求操作" })).toBeInTheDocument();
  });

  test("opens automatic context from the requirement composer", async () => {
    render(<Page />);
    await openRoleRequirement();

    await userEvent.click(
      screen.getByRole("button", { name: "查看本次 6 项自动上下文" }),
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
    expect(screen.getByText("本轮 Agent 执行已完成")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "PRD 撰写工作台" })).toBeInTheDocument();
  });

  test("resumes SSO with requirement-bound tests and context", async () => {
    render(<Page />);
    await openCustomerPortal();
    await userEvent.click(screen.getByRole("button", { name: "继续 测试 Agent 对话" }));

    expect(screen.getAllByText("企业 SSO 登录体验优化").length).toBeGreaterThan(0);
    expect(screen.getByText("租户选择失败时可重新发起 SSO")).toBeInTheDocument();
    expect(screen.queryByText("AC-07")).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "查看本次 5 项自动上下文" }),
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
      screen.getByRole("button", { name: "查看本次 6 项自动上下文" }),
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

  test("routes requirement governance through more actions", async () => {
    render(<Page />);
    await openRoleRequirement();

    await userEvent.click(screen.getByRole("button", { name: "更多需求操作" }));
    expect(screen.getByRole("button", { name: "编辑负责人" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "归档需求" })).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "调整状态与门禁" }),
    );

    expect(screen.getByRole("complementary", { name: "项目设置" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "需求状态与门禁" }));
    await userEvent.selectOptions(
      screen.getByLabelText("设置角色与成员权限重构状态"),
      "testing",
    );
    expect(screen.getByLabelText("设置角色与成员权限重构状态")).toHaveValue("testing");
    expect(screen.getByText(/产品方案已确认/)).toBeInTheDocument();
  });

  test("previews the prototype from the prototype Agent", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.selectOptions(
      screen.getByLabelText("选择 Agent"),
      "prototype",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "预览角色配置页面" }),
    );
    expect(
      screen.getByRole("complementary", { name: "页面预览" }),
    ).toBeInTheDocument();
    expect(screen.getByText("成员与角色")).toBeInTheDocument();
  });

  test("revises a PRD with natural language and opens PDF preview", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.selectOptions(
      screen.getByLabelText("选择 Agent"),
      "prd-writer",
    );
    const input = screen.getByLabelText("PRD 修改要求");
    await userEvent.type(input, "增加批量修改角色的二次确认说明");
    await userEvent.click(
      screen.getByRole("button", { name: "生成修订建议" }),
    );
    expect(screen.getByText(/二次确认说明/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "预览 PDF" }));
    expect(
      screen.getByRole("complementary", { name: "PDF 预览" }),
    ).toBeInTheDocument();
  });

  test("retains an unconfirmed PRD revision when leaving with the back button", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.type(
      screen.getByLabelText("PRD 修改要求"),
      "调整角色批量操作说明",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "生成修订建议" }),
    );
    await userEvent.click(screen.getByRole("button", { name: /企业客户门户 V3.2/ }));
    expect(screen.getByRole("dialog", { name: "未确认的 PRD 修订" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "保留修订并离开" }));
    await userEvent.click(
      screen.getByRole("button", { name: "恢复角色与成员权限重构工作区" }),
    );
    expect(screen.getByText("调整角色批量操作说明")).toBeInTheDocument();
  });

  test("discards an unconfirmed PRD revision before sidebar navigation", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.type(screen.getByLabelText("PRD 修改要求"), "这条修订应被放弃");
    await userEvent.click(screen.getByRole("button", { name: "生成修订建议" }));
    await userEvent.click(screen.getByRole("button", { name: "智能资产" }));
    await userEvent.click(screen.getByRole("button", { name: "放弃修订并离开" }));

    expect(screen.getByRole("heading", { name: "智能资产" })).toBeInTheDocument();
    await openRoleRequirement();
    expect(screen.queryByText("这条修订应被放弃")).not.toBeInTheDocument();
  });

  test("returns to an unconfirmed PRD revision from guarded sidebar navigation", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.type(screen.getByLabelText("PRD 修改要求"), "继续确认这条修订");
    await userEvent.click(screen.getByRole("button", { name: "生成修订建议" }));
    await userEvent.click(screen.getByRole("button", { name: "项目" }));
    await userEvent.click(screen.getByRole("button", { name: "返回继续确认" }));

    expect(screen.getByRole("heading", { name: "PRD 撰写工作台" })).toBeInTheDocument();
    expect(screen.getByText("继续确认这条修订")).toBeInTheDocument();
  });

  test("guards project asset navigation from settings when a PRD draft is pending", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.type(screen.getByLabelText("PRD 修改要求"), "保留后再查看产品文档");
    await userEvent.click(screen.getByRole("button", { name: "生成修订建议" }));
    await userEvent.click(screen.getByRole("button", { name: "更多需求操作" }));
    await userEvent.click(screen.getByRole("button", { name: "调整状态与门禁" }));
    await userEvent.click(screen.getByRole("button", { name: "上下文维护" }));
    await userEvent.click(screen.getByRole("button", { name: "管理全部产品文档" }));

    expect(screen.getByRole("dialog", { name: "未确认的 PRD 修订" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保留修订并离开" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "放弃修订并离开" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "返回继续确认" }));
    expect(screen.getByRole("complementary", { name: "项目设置" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "管理全部产品文档" }));
    await userEvent.click(screen.getByRole("button", { name: "保留修订并离开" }));
    expect(screen.getByRole("heading", { name: "产品文档" })).toBeInTheDocument();
  });

  test("marks a development task and opens the code diff", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.selectOptions(
      screen.getByLabelText("选择 Agent"),
      "frontend-dev",
    );
    await userEvent.selectOptions(
      screen.getByLabelText("角色面板任务状态"),
      "in-progress",
    );
    expect(screen.getByLabelText("角色面板任务状态")).toHaveValue(
      "in-progress",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "查看角色面板代码差异" }),
    );
    expect(
      screen.getByRole("complementary", { name: "代码差异" }),
    ).toBeInTheDocument();
    expect(screen.getByText("AI 修改说明")).toBeInTheDocument();
  });

  test("shows Spec-linked test cases and a test report", async () => {
    render(<Page />);
    await openRoleRequirement();
    await userEvent.selectOptions(
      screen.getByLabelText("选择 Agent"),
      "testing",
    );
    expect(screen.getByText("AC-07")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "查看角色管理测试报告" }),
    );
    expect(
      screen.getByRole("complementary", { name: "测试报告" }),
    ).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
  });

  test("shows all governed smart asset categories", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "智能资产" }));
    for (const label of ["Agent", "知识库", "记忆库", "代码库", "工具"]) {
      expect(screen.getByRole("tab", { name: label })).toBeInTheDocument();
    }
  });

  test("sends a task with the selected Agent", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "新建任务" }));
    await userEvent.selectOptions(
      screen.getByLabelText("选择 Agent"),
      "frontend-dev",
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
    await userEvent.click(
      screen.getByRole("button", { name: "查看角色管理模块 PRD v1.3" }),
    );
    expect(
      screen.getByRole("complementary", { name: "产物预览" }),
    ).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(
      screen.queryByRole("complementary", { name: "产物预览" }),
    ).not.toBeInTheDocument();
  });

  test("exposes the three product regions", () => {
    render(<Page />);
    expect(screen.getByRole("navigation", { name: "主导航" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByLabelText("辅助工具")).toBeInTheDocument();
  });

  test("keeps the three product regions and office mode", async () => {
    render(<Page />);
    expect(screen.getByRole("navigation", { name: "主导航" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByLabelText("辅助工具")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "新建任务" }));
    await userEvent.click(screen.getByRole("button", { name: "日常办公" }));
    expect(screen.getByRole("button", { name: /会议纪要 Agent/ })).toBeInTheDocument();
  });

});
