import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ContextSourcesPanel } from "./context-sources-panel";

describe("ContextSourcesPanel", () => {
  test("keeps unavailable context readable but prevents selecting it", () => {
    render(
      <ContextSourcesPanel
        lockedIds={[]}
        onToggle={vi.fn()}
        onToggleLock={vi.fn()}
        selectedIds={[]}
        sources={[
          {
            id: "unavailable-source",
            projectId: "customer-portal",
            kind: "document",
            name: "不可用访谈纪要",
            detail: "等待权限恢复后同步",
            status: "unavailable",
            autoSelected: false,
          },
        ]}
      />,
    );

    expect(screen.getByText("不可用访谈纪要")).toBeInTheDocument();
    expect(screen.getByText("等待权限恢复后同步")).toBeInTheDocument();
    expect(screen.getByText("当前不可用")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "引用不可用访谈纪要" })).toBeDisabled();
  });
});
