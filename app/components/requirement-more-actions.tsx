import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

export interface RequirementMoreActionsProps {
  canEdit: boolean;
}

export function RequirementMoreActions({ canEdit }: RequirementMoreActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="requirement-more-actions">
      <button
        aria-expanded={isOpen}
        aria-label="更多需求操作"
        className="icon-button"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <MoreHorizontal size={18} />
      </button>
      {isOpen && (
        <div className="requirement-more-menu">
          <button disabled={!canEdit} type="button">编辑负责人</button>
          <button disabled={!canEdit} type="button">归档需求</button>
        </div>
      )}
    </div>
  );
}
