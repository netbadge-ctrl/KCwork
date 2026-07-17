import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import Page from "../page";

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

  test("opens project context without showing a fixed workflow", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "项目" }));
    await userEvent.click(
      screen.getByRole("button", { name: "打开企业客户门户 V3.2" }),
    );
    expect(screen.getByText("共享项目上下文")).toBeInTheDocument();
    expect(screen.queryByText("研发流程")).not.toBeInTheDocument();
  });

  test("shows clickable project assets and multiple requirements", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: "项目" }));
    await userEvent.click(
      screen.getByRole("button", { name: "打开企业客户门户 V3.2" }),
    );

    for (const label of ["产品文档", "项目记忆", "代码库", "测试资产"]) {
      expect(
        screen.getByRole("button", { name: new RegExp(label) }),
      ).toBeInTheDocument();
    }
    expect(screen.getByText("角色与成员权限重构")).toBeInTheDocument();
    expect(screen.getByText("企业 SSO 登录体验优化")).toBeInTheDocument();
    expect(screen.getByText("权限审计记录导出")).toBeInTheDocument();
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
});
