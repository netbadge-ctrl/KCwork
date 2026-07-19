import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { PrototypeEditor } from "./prototype-editor";

test("selects an element, previews a text change, applies it, and undoes it", async () => {
  render(<PrototypeEditor canEdit />);
  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  expect(screen.getByText("关联 Spec：AC-07")).toBeInTheDocument();
  expect(screen.getByText("元素类型：按钮")).toBeInTheDocument();
  expect(screen.getByText("所属页面：成员与角色")).toBeInTheDocument();
  await userEvent.clear(screen.getByLabelText("元素文案"));
  await userEvent.type(screen.getByLabelText("元素文案"), "邀请成员");
  await userEvent.click(screen.getByRole("button", { name: "预览修改" }));
  expect(screen.getByText(/添加成员 → 邀请成员/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "应用修改" }));
  expect(
    screen.getByRole("button", { name: "选择邀请成员按钮" }),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "撤销本次修改" }));
  expect(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  ).toBeInTheDocument();
});

test("keeps prototype edits read only for viewers", async () => {
  render(<PrototypeEditor canEdit={false} />);
  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  expect(screen.getByLabelText("元素文案")).toBeDisabled();
  expect(screen.getByRole("button", { name: "应用修改" })).toBeDisabled();
});

test("clears the selected element from the canvas or Escape", async () => {
  render(<PrototypeEditor canEdit />);
  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  expect(screen.getByLabelText("元素文案")).toBeInTheDocument();

  await userEvent.keyboard("{Escape}");
  expect(screen.queryByLabelText("元素文案")).not.toBeInTheDocument();

  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  await userEvent.click(screen.getByRole("application", { name: "原型画布" }));
  expect(screen.queryByLabelText("元素文案")).not.toBeInTheDocument();
});

test("interprets natural-language tone, read-only, and quoted text changes", async () => {
  render(<PrototypeEditor canEdit />);
  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  await userEvent.type(
    screen.getByLabelText("描述对选中元素的修改"),
    "改为次要按钮，文案改成“邀请成员”",
  );
  await userEvent.click(screen.getByRole("button", { name: "预览修改" }));
  expect(screen.getByText(/添加成员 → 邀请成员/)).toBeInTheDocument();
  expect(screen.getByText(/主要 → 次要/)).toBeInTheDocument();

  await userEvent.click(
    screen.getByRole("button", { name: "选择林川成员行" }),
  );
  await userEvent.type(
    screen.getByLabelText("描述对选中元素的修改"),
    "设为只读",
  );
  await userEvent.click(screen.getByRole("button", { name: "预览修改" }));
  expect(screen.getByText(/林川 · 研发 → 林川 · 研发 · 只读/)).toBeInTheDocument();
});

test("shows an uninterpreted natural-language instruction before confirmation", async () => {
  render(<PrototypeEditor canEdit />);
  await userEvent.click(
    screen.getByRole("button", { name: "选择成员搜索输入框" }),
  );
  await userEvent.type(
    screen.getByLabelText("描述对选中元素的修改"),
    "让搜索提示更简洁",
  );
  await userEvent.click(screen.getByRole("button", { name: "预览修改" }));
  expect(screen.getByText(/待执行指令：让搜索提示更简洁/)).toBeInTheDocument();
});

test("invalidates a preview whenever any draft field changes", async () => {
  render(<PrototypeEditor canEdit />);
  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  await userEvent.clear(screen.getByLabelText("元素文案"));
  await userEvent.type(screen.getByLabelText("元素文案"), "邀请成员");
  await userEvent.click(screen.getByRole("button", { name: "预览修改" }));
  expect(screen.getByRole("button", { name: "应用修改" })).toBeEnabled();

  await userEvent.type(screen.getByLabelText("元素文案"), "加入项目");
  expect(screen.getByRole("button", { name: "应用修改" })).toBeDisabled();
  expect(screen.queryByText(/添加成员 →/)).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "预览修改" }));
  expect(screen.getByRole("button", { name: "应用修改" })).toBeEnabled();
  await userEvent.selectOptions(screen.getByLabelText("视觉层级"), "secondary");
  expect(screen.getByRole("button", { name: "应用修改" })).toBeDisabled();

  await userEvent.click(screen.getByRole("button", { name: "预览修改" }));
  expect(screen.getByRole("button", { name: "应用修改" })).toBeEnabled();
  await userEvent.type(
    screen.getByLabelText("描述对选中元素的修改"),
    "稍微缩短",
  );
  expect(screen.getByRole("button", { name: "应用修改" })).toBeDisabled();
});

test("clears selection from nested blank canvas regions but not element clicks", async () => {
  render(<PrototypeEditor canEdit />);
  const selectAddMember = () =>
    userEvent.click(
      screen.getByRole("button", { name: "选择添加成员按钮" }),
    );

  await selectAddMember();
  await userEvent.click(screen.getByText("portal.local/members"));
  expect(screen.queryByLabelText("元素文案")).not.toBeInTheDocument();

  await selectAddMember();
  await userEvent.click(screen.getByText("KFlow"));
  expect(screen.queryByLabelText("元素文案")).not.toBeInTheDocument();

  await selectAddMember();
  await userEvent.click(screen.getByRole("heading", { name: "成员与角色管理" }));
  expect(screen.queryByLabelText("元素文案")).not.toBeInTheDocument();

  await selectAddMember();
  await userEvent.click(screen.getByRole("button", { name: "选择林川成员行" }));
  expect(screen.getByText("关联 Spec：AC-09")).toBeInTheDocument();
});
