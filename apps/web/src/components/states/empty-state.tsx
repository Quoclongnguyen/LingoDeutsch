import { BookOpenText, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  action,
  description,
  icon: Icon = BookOpenText,
  role,
  title,
}: {
  action?: ReactNode;
  description: string;
  icon?: LucideIcon;
  role?: "alert" | "status";
  title: string;
}) {
  return (
    <section
      className="empty-state"
      aria-labelledby="empty-state-title"
      role={role}
    >
      <span className="empty-state__icon" aria-hidden="true">
        <Icon size={24} strokeWidth={1.7} />
      </span>
      <div>
        <h2 id="empty-state-title">{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </section>
  );
}
