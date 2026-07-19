import type { ProductWorkMode } from "../lib/types";

const productModes = [
  { id: "analysis", label: "需求分析", detail: "澄清范围、依赖与验收边界" },
  { id: "prototype", label: "原型设计与审计", detail: "生成、修改并检查页面交互" },
  { id: "prd", label: "PRD 撰写", detail: "组织产品文档与可测试标准" },
] satisfies Array<{ id: ProductWorkMode; label: string; detail: string }>;

export interface ProductModePickerProps {
  value: ProductWorkMode;
  onChange(mode: ProductWorkMode): void;
  variant?: "default" | "compact" | "start";
}

export function ProductModePicker({
  value,
  onChange,
  variant = "default",
}: ProductModePickerProps) {
  return (
    <div
      aria-label="产品设计工作模式"
      className={`product-mode-picker ${variant}`}
      role="group"
    >
      {productModes.map((mode) => (
        <button
          aria-pressed={value === mode.id}
          className={value === mode.id ? "active" : ""}
          key={mode.id}
          onClick={() => onChange(mode.id)}
          type="button"
        >
          <strong>{mode.label}</strong>
          {variant !== "compact" && <small>{mode.detail}</small>}
        </button>
      ))}
    </div>
  );
}
