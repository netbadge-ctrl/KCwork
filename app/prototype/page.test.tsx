import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import PrototypePage from "./page";

const { useSearchParamsMock } = vi.hoisted(() => ({
  useSearchParamsMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: useSearchParamsMock,
}));

beforeEach(() => {
  useSearchParamsMock.mockReset();
});

test("keeps the standalone prototype editable without a read-only marker", async () => {
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
});

test("honors the read-only marker in the standalone prototype", async () => {
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
  expect(screen.getByRole("button", { name: "应用修改" })).toBeDisabled();
});
