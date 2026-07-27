import { Inbox } from "lucide-react";

export function WorkspaceEmptyState({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="workspace-empty-state">
      <Inbox size={24} />
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
  );
}
