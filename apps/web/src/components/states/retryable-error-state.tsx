import { RefreshCw, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "./empty-state";

export function RetryableErrorState({
  description,
  icon,
  onRetry,
  secondaryAction,
  title,
}: {
  description: string;
  icon?: LucideIcon;
  onRetry: () => void;
  secondaryAction?: ReactNode;
  title: string;
}) {
  return (
    <EmptyState
      description={description}
      icon={icon}
      role="alert"
      title={title}
      action={
        <div className="heading-actions">
          <button
            className="button button--primary"
            onClick={onRetry}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={17} /> Thử lại
          </button>
          {secondaryAction}
        </div>
      }
    />
  );
}
