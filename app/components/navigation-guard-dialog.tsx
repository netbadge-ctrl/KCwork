import { AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";

export function NavigationGuardDialog({
  destination,
  kind = "prd",
  onDiscard,
  onRetain,
  onReturn,
}: {
  destination: string;
  kind?: "prd" | "prototype" | "combined";
  onDiscard(): void;
  onRetain(): void;
  onReturn(): void;
}) {
  const returnButton = useRef<HTMLButtonElement>(null);
  const copy =
    kind === "prd"
      ? {
          title: "未确认的 PRD 修订",
          noun: "草稿",
          discard: "放弃修订并离开",
          retain: "保留修订并离开",
        }
      : kind === "prototype"
        ? {
            title: "未确认的原型修改",
            noun: "修改",
            discard: "放弃修改并离开",
            retain: "保留修改并离开",
          }
        : {
            title: "未确认的修改",
            noun: "修改",
            discard: "放弃修改并离开",
            retain: "保留修改并离开",
          };

  useEffect(() => {
    returnButton.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onReturn();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onReturn]);

  return (
    <div className="navigation-guard-backdrop">
      <section
        aria-describedby="navigation-guard-description"
        aria-labelledby="navigation-guard-title"
        aria-modal="true"
        className="navigation-guard-dialog"
        role="dialog"
      >
        <span className="navigation-guard-icon"><AlertTriangle size={22} /></span>
        <div>
          <h2 id="navigation-guard-title">{copy.title}</h2>
          <p id="navigation-guard-description">
            前往“{destination}”前，请选择保留{copy.noun}、放弃{copy.noun}，或返回继续确认。
          </p>
        </div>
        <div className="navigation-guard-actions">
          <button onClick={onDiscard} type="button">{copy.discard}</button>
          <button className="secondary-button" onClick={onRetain} type="button">{copy.retain}</button>
          <button className="primary-small" onClick={onReturn} ref={returnButton} type="button">返回继续确认</button>
        </div>
      </section>
    </div>
  );
}
