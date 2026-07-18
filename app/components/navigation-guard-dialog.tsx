import { AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";

export function NavigationGuardDialog({
  destination,
  onDiscard,
  onRetain,
  onReturn,
}: {
  destination: string;
  onDiscard(): void;
  onRetain(): void;
  onReturn(): void;
}) {
  const returnButton = useRef<HTMLButtonElement>(null);

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
          <h2 id="navigation-guard-title">未确认的 PRD 修订</h2>
          <p id="navigation-guard-description">
            前往“{destination}”前，请选择保留草稿、放弃草稿，或返回继续确认。
          </p>
        </div>
        <div className="navigation-guard-actions">
          <button onClick={onDiscard} type="button">放弃修订并离开</button>
          <button className="secondary-button" onClick={onRetain} type="button">保留修订并离开</button>
          <button className="primary-small" onClick={onReturn} ref={returnButton} type="button">返回继续确认</button>
        </div>
      </section>
    </div>
  );
}
