"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PrototypePreviewShell } from "../components/prototype-preview-shell";
import { useProjectProductCapability } from "../lib/project-capability-store";

function PrototypeRouteContent() {
  const searchParams = useSearchParams();
  const requirement = searchParams.get("requirement") ?? "role-permissions";
  const version = searchParams.get("version") ?? "V3";
  const project = searchParams.get("project") ?? "customer-portal";
  const trustedCanEdit = useProjectProductCapability(project);
  const canEdit = trustedCanEdit && searchParams.get("readonly") !== "1";
  const initialInspection = searchParams.get("inspect") === "1";

  return (
    <main className="prototype-page">
      <header className="prototype-page-header">
        <div>
          <p className="eyebrow">KFlow Prototype · {project}</p>
          <h1>角色与成员权限重构</h1>
          <p>{requirement} · {version} · 可检查元素</p>
        </div>
        <span className="prototype-page-version">{version}</span>
      </header>
      <PrototypePreviewShell
        canEdit={canEdit}
        initialInspection={initialInspection}
        requirementId={requirement}
      />
    </main>
  );
}

export default function PrototypePage() {
  return (
    <Suspense fallback={<main className="prototype-page">正在加载原型…</main>}>
      <PrototypeRouteContent />
    </Suspense>
  );
}
