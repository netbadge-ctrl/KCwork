import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { PrdDocumentSheet } from "./prd-document-sheet";

describe("PrdDocumentSheet", () => {
  test("renders sections as headings and paragraphs", () => {
    render(
      <PrdDocumentSheet
        title="角色与成员权限重构"
        meta="REQ-032 · Spec v1.4"
        body={`## 1. 背景与目标\n统一权限体验。\n\n## 2. 产品范围\n覆盖成员列表。`}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "1. 背景与目标" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "2. 产品范围" }),
    ).toBeInTheDocument();
    expect(screen.getByText("统一权限体验。")).toBeInTheDocument();
    expect(screen.getByText("覆盖成员列表。")).toBeInTheDocument();
  });

  test("renders acceptance lines as check items", () => {
    render(
      <PrdDocumentSheet
        title="t"
        meta="m"
        body={`## 6. 验收标准\n✓ AC-07 项目管理员可以修改成员角色`}
      />,
    );
    const item = screen.getByText("AC-07 项目管理员可以修改成员角色");
    expect(item.closest(".check-line")).not.toBeNull();
  });

  test("renders an editable textarea when editable", () => {
    render(
      <PrdDocumentSheet title="t" meta="m" body="## 1. x\ny" editable />,
    );
    expect(screen.getByLabelText("PRD 正文")).toBeInTheDocument();
  });
});
