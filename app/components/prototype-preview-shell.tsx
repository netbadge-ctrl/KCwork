"use client";

import { Monitor, MousePointer2, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";
import type { PrototypePageName } from "../lib/prototype-state";
import { PrototypeEditor } from "./prototype-editor";

export const prototypePages = [
  "总览",
  "成员与角色",
  "角色详情",
  "操作审计",
] as const;
type PrototypeDevice = "desktop" | "tablet" | "mobile";

export function PrototypePreviewShell({
  canEdit,
  compact = false,
  initialInspection = true,
  requirementId,
}: {
  canEdit: boolean;
  compact?: boolean;
  initialInspection?: boolean;
  requirementId: string;
}) {
  const [page, setPage] = useState<PrototypePageName>("成员与角色");
  const [device, setDevice] = useState<PrototypeDevice>("desktop");
  const [inspectionEnabled, setInspectionEnabled] = useState(initialInspection);

  return (
    <section
      aria-label="原型预览"
      className={`prototype-preview-control-shell ${compact ? "compact" : ""}`}
      data-device={device}
      data-page={page}
    >
      <div className="prototype-preview-controls">
        <nav aria-label="原型页面">
          {prototypePages.map((item, index) => (
            <button
              aria-label={`${item}页面`}
              aria-pressed={page === item}
              key={item}
              onClick={() => setPage(item)}
              type="button"
            >
              {compact ? index + 1 : item}
            </button>
          ))}
        </nav>
        <div aria-label="预览尺寸" className="prototype-device-controls">
          <button
            aria-label="桌面端预览"
            aria-pressed={device === "desktop"}
            onClick={() => setDevice("desktop")}
            type="button"
          ><Monitor size={15} /></button>
          <button
            aria-label="平板端预览"
            aria-pressed={device === "tablet"}
            onClick={() => setDevice("tablet")}
            type="button"
          ><Tablet size={15} /></button>
          <button
            aria-label="移动端预览"
            aria-pressed={device === "mobile"}
            onClick={() => setDevice("mobile")}
            type="button"
          ><Smartphone size={15} /></button>
        </div>
        <button
          aria-label="检查模式"
          aria-pressed={inspectionEnabled}
          className="prototype-inspection-toggle"
          onClick={() => setInspectionEnabled((enabled) => !enabled)}
          type="button"
        >
          <MousePointer2 size={15} /> 检查
        </button>
      </div>
      <div className={`prototype-preview-viewport ${device}`}>
        <PrototypeEditor
          activePage={page}
          canEdit={canEdit}
          compact={compact}
          inspectionEnabled={inspectionEnabled}
          requirementId={requirementId}
        />
      </div>
    </section>
  );
}
