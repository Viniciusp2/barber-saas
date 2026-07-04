import Link from "next/link";
import { Button } from "./button";
import { Card } from "./card";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-3 p-16 text-center">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        {actionHref ? (
          <Link href={actionHref} className="mt-2">
            <Button>{actionLabel}</Button>
          </Link>
        ) : (
          <Button disabled className="mt-2">
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
