import { Badge } from '@/components/ui/badge';
import { GRADE_META, PERIOD_STATUS_META } from '@/lib/skm-utils';
import { cn } from '@/lib/utils';
import { type Grade, type PeriodStatus } from '@/types/skm';

interface GradeBadgeProps {
    grade: Grade;
    performance?: string;
    showInterval?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function GradeBadge({ grade, performance, showInterval = false, size = 'md', className }: GradeBadgeProps) {
    const meta = GRADE_META[grade] ?? GRADE_META.D;
    const label = performance ?? meta.performance;

    return (
        <Badge
            variant="outline"
            className={cn(
                'font-semibold tracking-tight',
                meta.badgeClass,
                size === 'sm' && 'px-2 py-0.5 text-xs',
                size === 'md' && 'px-2.5 py-1 text-xs',
                size === 'lg' && 'px-3.5 py-1.5 text-sm',
                className,
            )}
        >
            <span className="font-bold">Mutu {grade}</span>
            <span className="mx-1 opacity-50">·</span>
            <span>{label}</span>
            {showInterval && <span className="ml-1.5 font-normal opacity-80">({meta.interval})</span>}
        </Badge>
    );
}

export function PeriodStatusBadge({ status, className }: { status: PeriodStatus; className?: string }) {
    const meta = PERIOD_STATUS_META[status] ?? PERIOD_STATUS_META.draft;

    return (
        <Badge variant="outline" className={cn('font-medium', meta.className, className)}>
            {meta.label}
        </Badge>
    );
}
