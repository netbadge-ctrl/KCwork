import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test } from "vitest";
import { PrototypeEditor } from "./prototype-editor";

const storedPrototypeValues = new Map<string, string>();
Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: {
    clear: () => storedPrototypeValues.clear(),
    getItem: (key: string) => storedPrototypeValues.get(key) ?? null,
    key: (index: number) => [...storedPrototypeValues.keys()][index] ?? null,
    get length() {
      return storedPrototypeValues.size;
    },
    removeItem: (key: string) => storedPrototypeValues.delete(key),
    setItem: (key: string, value: string) =>
      storedPrototypeValues.set(key, value),
  } satisfies Storage,
});

beforeEach(() => {
  window.localStorage.clear();
});

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

test("rejects an unsupported instruction and enables apply after a corrected change", async () => {
  render(<PrototypeEditor canEdit />);
  await userEvent.click(
    screen.getByRole("button", { name: "选择成员搜索输入框" }),
  );
  await userEvent.type(
    screen.getByLabelText("描述对选中元素的修改"),
    "让搜索提示更简洁",
  );
  await userEvent.click(screen.getByRole("button", { name: "预览修改" }));
  expect(
    screen.getByText("无法理解这条修改要求，请调整文案、视觉层级或使用支持的描述。"),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "应用修改" })).toBeDisabled();

  await userEvent.clear(screen.getByLabelText("描述对选中元素的修改"));
  await userEvent.type(
    screen.getByLabelText("描述对选中元素的修改"),
    "文案改成“搜索姓名或邮箱”",
  );
  await userEvent.click(screen.getByRole("button", { name: "预览修改" }));
  expect(screen.getByText(/搜索成员、邮箱或角色 → 搜索姓名或邮箱/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "应用修改" })).toBeEnabled();
});

test("persists applied edits and an unconfirmed preview by requirement", async () => {
  const first = render(
    <PrototypeEditor canEdit requirementId="role-permissions" />,
  );
  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  await userEvent.clear(screen.getByLabelText("元素文案"));
  await userEvent.type(screen.getByLabelText("元素文案"), "邀请成员");
  await userEvent.click(screen.getByRole("button", { name: "预览修改" }));
  await userEvent.click(screen.getByRole("button", { name: "应用修改" }));
  await userEvent.clear(screen.getByLabelText("元素文案"));
  await userEvent.type(screen.getByLabelText("元素文案"), "邀请同事");
  await userEvent.click(screen.getByRole("button", { name: "预览修改" }));
  first.unmount();

  const reopened = render(
    <PrototypeEditor canEdit requirementId="role-permissions" />,
  );
  expect(
    screen.getByRole("button", { name: "选择邀请成员按钮" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/邀请成员 → 邀请同事/)).toBeInTheDocument();
  reopened.unmount();

  render(<PrototypeEditor canEdit requirementId="sso-login" />);
  expect(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  ).toBeInTheDocument();
  expect(screen.queryByText(/邀请成员 → 邀请同事/)).not.toBeInTheDocument();
});

test("subscribes to prototype document updates from another same-origin tab", async () => {
  render(<PrototypeEditor canEdit requirementId="role-permissions" />);
  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  const key = "kflow.prototype.requirement.role-permissions";
  const stored = JSON.parse(window.localStorage.getItem(key) ?? "{}") as {
    elements: Array<{ id: string; text: string }>;
  };
  stored.elements = stored.elements.map((element) =>
    element.id === "add-member"
      ? { ...element, text: "跨页邀请成员" }
      : element,
  );
  const nextValue = JSON.stringify(stored);
  window.localStorage.setItem(key, nextValue);

  fireEvent(
    window,
    new StorageEvent("storage", { key, newValue: nextValue }),
  );
  expect(
    await screen.findByRole("button", { name: "选择跨页邀请成员按钮" }),
  ).toBeInTheDocument();
});

test("makes heading and navigation selectable with size and interaction metadata", async () => {
  render(<PrototypeEditor canEdit />);
  const heading = screen.getByRole("button", {
    name: "选择成员与角色管理标题",
  });
  expect(heading).toHaveAttribute("data-size", "large");
  expect(heading).toHaveAttribute("data-interaction-state", "default");
  await userEvent.click(heading);
  expect(screen.getByText("元素类型：标题")).toBeInTheDocument();

  const navigation = screen.getByRole("button", {
    name: "选择成员管理导航",
  });
  expect(navigation).toHaveAttribute("data-size", "medium");
  expect(navigation).toHaveAttribute("data-interaction-state", "active");
  await userEvent.click(navigation);
  expect(screen.getByText("元素类型：导航")).toBeInTheDocument();
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

test("cannot undo after an in-place permission downgrade", async () => {
  const { rerender } = render(<PrototypeEditor canEdit />);
  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  await userEvent.clear(screen.getByLabelText("元素文案"));
  await userEvent.type(screen.getByLabelText("元素文案"), "邀请成员");
  await userEvent.click(screen.getByRole("button", { name: "预览修改" }));
  await userEvent.click(screen.getByRole("button", { name: "应用修改" }));
  expect(
    screen.getByRole("button", { name: "选择邀请成员按钮" }),
  ).toBeInTheDocument();

  rerender(<PrototypeEditor canEdit={false} />);
  const undo = screen.getByRole("button", { name: "撤销本次修改" });
  expect(undo).toBeDisabled();
  fireEvent.click(undo);
  expect(
    screen.getByRole("button", { name: "选择邀请成员按钮" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "选择添加成员按钮" }),
  ).not.toBeInTheDocument();
});

test("keeps viewer inspection local without clearing another surface's pending diff", async () => {
  const author = render(
    <PrototypeEditor canEdit requirementId="role-permissions" />,
  );
  await userEvent.click(
    within(author.container).getByRole("button", { name: "选择添加成员按钮" }),
  );
  await userEvent.clear(within(author.container).getByLabelText("元素文案"));
  await userEvent.type(
    within(author.container).getByLabelText("元素文案"),
    "邀请同事",
  );
  await userEvent.click(
    within(author.container).getByRole("button", { name: "预览修改" }),
  );
  const key = "kflow.prototype.requirement.role-permissions";
  const storedBefore = window.localStorage.getItem(key);

  const viewer = render(
    <PrototypeEditor canEdit={false} requirementId="role-permissions" />,
  );
  await userEvent.click(
    within(viewer.container).getByRole("button", { name: "选择林川成员行" }),
  );
  await userEvent.click(
    within(viewer.container).getByRole("application", { name: "原型画布" }),
  );

  expect(window.localStorage.getItem(key)).toBe(storedBefore);
  expect(
    within(author.container).getByText(/添加成员 → 邀请同事/),
  ).toBeInTheDocument();
});

test("keeps shared pending work after a live permission downgrade", async () => {
  const author = render(
    <PrototypeEditor canEdit requirementId="role-permissions" />,
  );
  await userEvent.click(
    within(author.container).getByRole("button", { name: "选择添加成员按钮" }),
  );
  await userEvent.clear(within(author.container).getByLabelText("元素文案"));
  await userEvent.type(
    within(author.container).getByLabelText("元素文案"),
    "邀请同事",
  );
  await userEvent.click(
    within(author.container).getByRole("button", { name: "预览修改" }),
  );
  const key = "kflow.prototype.requirement.role-permissions";
  const storedBefore = window.localStorage.getItem(key);

  const inspectedSurface = render(
    <PrototypeEditor canEdit requirementId="role-permissions" />,
  );
  inspectedSurface.rerender(
    <PrototypeEditor canEdit={false} requirementId="role-permissions" />,
  );
  await userEvent.click(
    within(inspectedSurface.container).getByRole("button", {
      name: "选择林川成员行",
    }),
  );
  await userEvent.keyboard("{Escape}");

  expect(window.localStorage.getItem(key)).toBe(storedBefore);
  expect(
    within(author.container).getByText(/添加成员 → 邀请同事/),
  ).toBeInTheDocument();
});

test("hides inspection actions without clearing pending work when inspection is off", async () => {
  const { container, rerender } = render(
    <PrototypeEditor canEdit requirementId="role-permissions" />,
  );
  await userEvent.click(
    within(container).getByRole("button", { name: "选择添加成员按钮" }),
  );
  await userEvent.clear(within(container).getByLabelText("元素文案"));
  await userEvent.type(within(container).getByLabelText("元素文案"), "邀请同事");
  await userEvent.click(
    within(container).getByRole("button", { name: "预览修改" }),
  );
  const key = "kflow.prototype.requirement.role-permissions";
  const pendingBefore = JSON.parse(
    window.localStorage.getItem(key) ?? "{}",
  ).pendingDiff;

  rerender(
    <PrototypeEditor
      canEdit
      inspectionEnabled={false}
      requirementId="role-permissions"
    />,
  );
  expect(within(container).queryByLabelText("元素文案")).not.toBeInTheDocument();
  expect(
    within(container).queryByRole("heading", { name: "添加成员按钮" }),
  ).not.toBeInTheDocument();
  expect(
    within(container).queryByRole("button", { name: "预览修改" }),
  ).not.toBeInTheDocument();
  expect(
    within(container).queryByRole("button", { name: "应用修改" }),
  ).not.toBeInTheDocument();
  expect(
    within(container).queryByRole("button", { name: "撤销本次修改" }),
  ).not.toBeInTheDocument();
  expect(
    JSON.parse(window.localStorage.getItem(key) ?? "{}").pendingDiff,
  ).toEqual(pendingBefore);

  rerender(
    <PrototypeEditor canEdit requirementId="role-permissions" />,
  );
  expect(
    within(container).getByText(/添加成员 → 邀请同事/),
  ).toBeInTheDocument();
});

test("previews, applies, persists, and undoes color, size, and interaction changes", async () => {
  const first = render(
    <PrototypeEditor canEdit requirementId="role-permissions" />,
  );
  await userEvent.click(
    within(first.container).getByRole("button", { name: "选择添加成员按钮" }),
  );
  await userEvent.selectOptions(within(first.container).getByLabelText("颜色"), "blue");
  await userEvent.selectOptions(within(first.container).getByLabelText("尺寸"), "large");
  await userEvent.selectOptions(
    within(first.container).getByLabelText("交互状态"),
    "active",
  );
  await userEvent.click(
    within(first.container).getByRole("button", { name: "预览修改" }),
  );
  expect(within(first.container).getByText(/紫色 → 蓝色/)).toBeInTheDocument();
  expect(within(first.container).getByText(/中号 → 大号/)).toBeInTheDocument();
  expect(within(first.container).getByText(/默认 → 激活/)).toBeInTheDocument();
  await userEvent.click(
    within(first.container).getByRole("button", { name: "应用修改" }),
  );
  expect(
    within(first.container).getByRole("button", { name: "选择添加成员按钮" }),
  ).toHaveAttribute("data-color", "blue");
  expect(
    within(first.container).getByRole("button", { name: "选择添加成员按钮" }),
  ).toHaveAttribute("data-size", "large");
  expect(
    within(first.container).getByRole("button", { name: "选择添加成员按钮" }),
  ).toHaveAttribute("data-interaction-state", "active");
  first.unmount();

  const reopened = render(
    <PrototypeEditor canEdit requirementId="role-permissions" />,
  );
  const persisted = within(reopened.container).getByRole("button", {
    name: "选择添加成员按钮",
  });
  expect(persisted).toHaveAttribute("data-color", "blue");
  expect(persisted).toHaveAttribute("data-size", "large");
  expect(persisted).toHaveAttribute("data-interaction-state", "active");
  await userEvent.click(
    within(reopened.container).getByRole("button", { name: "撤销本次修改" }),
  );
  const restored = within(reopened.container).getByRole("button", {
    name: "选择添加成员按钮",
  });
  expect(restored).toHaveAttribute("data-color", "purple");
  expect(restored).toHaveAttribute("data-size", "medium");
  expect(restored).toHaveAttribute("data-interaction-state", "default");
});
