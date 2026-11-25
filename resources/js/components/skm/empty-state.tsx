import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref, onAction, className }: EmptyStateProps) {
    return (
        <Card className={cn('border-dashed border-border/90 bg-card/60', className)}>
            <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <img
                    src="/images/skm/empty-state.png"
                    alt="Ilustrasi belum ada data"
                    className="mb-5 h-40 w-auto rounded-lg object-contain mix-blend-multiply dark:mix-blend-normal"
                />
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p>
                {actionLabel && actionHref && (
                    <Button asChild className="mt-5">
                        <Link href={actionHref}>{actionLabel}</Link>
                    </Button>
                )}
                {actionLabel && !actionHref && onAction && (
                    <Button className="mt-5" onClick={onAction}>
                        {actionLabel}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
