import { CircleAlert } from "lucide-react";

const labels = {
  pdf: "PDF 生成失败",
  diff: "代码比较失败",
  test: "测试执行失败",
} as const;

export type PreviewErrorKind = keyof typeof labels;

export function PreviewErrorState({
  kind,
  onRetry,
}: {
  kind: PreviewErrorKind;
  onRetry(): void;
}) {
  return (
    <div className="preview-error" role="alert">
      <CircleAlert size={22} />
      <strong>{labels[kind]}</strong>
      <p>其他项目内容仍可继续查看和编辑。</p>
      <button onClick={onRetry} type="button">重试</button>
    </div>
  );
}
