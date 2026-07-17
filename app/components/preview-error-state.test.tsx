import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { PreviewErrorState } from "./preview-error-state";

test("keeps the workspace usable when PDF generation fails", async () => {
  const onRetry = vi.fn();
  render(<PreviewErrorState kind="pdf" onRetry={onRetry} />);

  expect(screen.getByRole("alert")).toHaveTextContent("PDF 生成失败");
  expect(screen.getByText("其他项目内容仍可继续查看和编辑。")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "重试" }));
  expect(onRetry).toHaveBeenCalledOnce();
});
