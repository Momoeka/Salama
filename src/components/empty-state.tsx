import { type ReactNode } from "react";
import Link from "next/link";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-6 text-sm text-muted-foreground">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
