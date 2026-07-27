import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import PrototypePage from "./page";

const { useSearchParamsMock } = vi.hoisted(() => ({
  useSearchParamsMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: useSearchParamsMock,
}));

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
  useSearchParamsMock.mockReset();
  window.localStorage.clear();
});

function setTrustedProductCapability(canEditProductArtifacts: boolean) {
  const key = "kflow.projectCapability.customer-portal";
  const value = JSON.stringify({
    canEditProductArtifacts,
    projectId: "customer-portal",
    roles: canEditProductArtifacts ? ["product"] : ["viewer"],
  });
  window.localStorage.setItem(key, value);
  return { key, value };
}

test("defaults direct standalone access to read only without trusted role state", async () => {
  useSearchParamsMock.mockReturnValue(
    new URLSearchParams(
      "project=customer-portal&requirement=role-permissions&version=V3&inspect=1",
    ),
  );
  render(<PrototypePage />);

  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  expect(screen.getByLabelText("元素文案")).toBeDisabled();
});

test("does not grant editing from a modified URL", async () => {
  useSearchParamsMock.mockReturnValue(
    new URLSearchParams(
      "project=customer-portal&requirement=role-permissions&version=V3&inspect=1&readonly=0",
    ),
  );
  render(<PrototypePage />);

  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  expect(screen.getByLabelText("元素文案")).toBeDisabled();
  expect(screen.getByRole("button", { name: "应用修改" })).toBeDisabled();
});

test("uses trusted project capability while readonly remains an extra restriction", async () => {
  setTrustedProductCapability(true);
  useSearchParamsMock.mockReturnValue(
    new URLSearchParams(
      "project=customer-portal&requirement=role-permissions&version=V3&inspect=1",
    ),
  );
  const editable = render(<PrototypePage />);
  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  expect(screen.getByLabelText("元素文案")).toBeEnabled();
  editable.unmount();

  useSearchParamsMock.mockReturnValue(
    new URLSearchParams(
      "project=customer-portal&requirement=role-permissions&version=V3&inspect=1&readonly=1",
    ),
  );
  render(<PrototypePage />);
  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  expect(screen.getByLabelText("元素文案")).toBeDisabled();
});

test("subscribes to a live trusted-role downgrade", async () => {
  setTrustedProductCapability(true);
  useSearchParamsMock.mockReturnValue(
    new URLSearchParams(
      "project=customer-portal&requirement=role-permissions&version=V3&inspect=1",
    ),
  );
  render(<PrototypePage />);
  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  expect(screen.getByLabelText("元素文案")).toBeEnabled();

  const downgraded = setTrustedProductCapability(false);
  act(() => {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: downgraded.key,
        newValue: downgraded.value,
      }),
    );
  });
  await waitFor(() => expect(screen.getByLabelText("元素文案")).toBeDisabled());
});

test("provides page, device, and inspection controls", async () => {
  setTrustedProductCapability(true);
  useSearchParamsMock.mockReturnValue(
    new URLSearchParams(
      "project=customer-portal&requirement=role-permissions&version=V3&inspect=1",
    ),
  );
  render(<PrototypePage />);

  const inspect = screen.getByRole("button", { name: "检查模式" });
  expect(inspect).toHaveAttribute("aria-pressed", "true");
  await userEvent.click(screen.getByRole("button", { name: "操作审计页面" }));
  expect(screen.getByLabelText("原型预览")).toHaveAttribute(
    "data-page",
    "操作审计",
  );
  await userEvent.click(screen.getByRole("button", { name: "移动端预览" }));
  expect(screen.getByLabelText("原型预览")).toHaveAttribute(
    "data-device",
    "mobile",
  );

  await userEvent.click(screen.getByRole("button", { name: "成员与角色页面" }));
  await userEvent.click(
    screen.getByRole("button", { name: "选择添加成员按钮" }),
  );
  expect(screen.getByLabelText("元素文案")).toBeInTheDocument();
  await userEvent.click(inspect);
  expect(screen.queryByLabelText("元素文案")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "应用修改" }),
  ).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "选择林川成员行" }));
  await userEvent.click(inspect);
  expect(screen.getByText("关联 Spec：AC-07")).toBeInTheDocument();
  expect(screen.queryByText("关联 Spec：AC-09")).not.toBeInTheDocument();
});
