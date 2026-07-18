import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
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

  test("uses system development copy on the new-task page", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "新建任务" }));
    expect(screen.getByRole("button", { name: "系统开发" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "代码开发" }),
    ).not.toBeInTheDocument();
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

  test("keeps project role editing reachable from project settings", async () => {
    render(<Page />);
    await openCustomerPortal();
    await userEvent.click(screen.getByRole("button", { name: "项目设置" }));

    expect(screen.getByRole("complementary", { name: "项目设置" })).toBeInTheDocument();
    await userEvent.selectOptions(
      screen.getByLabelText("修改林川的项目角色"),
      "testing",
    );
    expect(screen.getByLabelText("修改林川的项目角色")).toHaveValue("testing");
  });

  test("opens a non-empty interim automatic context summary", async () => {
    render(<Page />);
    await openCustomerPortal();
    await userEvent.click(screen.getByRole("button", { name: "查看自动上下文来源" }));

    expect(screen.getByRole("complementary", { name: "自动上下文" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "本次引用 4 项上下文" })).toBeInTheDocument();
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

  test("warns before leaving an unconfirmed PRD revision", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<Page />);
    await openRoleRequirement();
    await userEvent.selectOptions(
      screen.getByLabelText("选择 Agent"),
      "prd-writer",
    );
    await userEvent.type(
      screen.getByLabelText("PRD 修改要求"),
      "调整角色批量操作说明",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "生成修订建议" }),
    );
    await userEvent.selectOptions(
      screen.getByLabelText("选择 Agent"),
      "prototype",
    );
    expect(confirmSpy).toHaveBeenCalledWith(
      "当前修订尚未确认，是否放弃并切换 Agent？",
    );
    expect(
      screen.getByRole("heading", { name: "PRD 撰写工作台" }),
    ).toBeInTheDocument();
    confirmSpy.mockRestore();
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
