import { GradeBadge } from '@/components/skm/grade-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatInt, formatScore, GRADE_META } from '@/lib/skm-utils';
import { cn } from '@/lib/utils';
import { type ElementScore, type IkmResult } from '@/types/skm';
import { AlertTriangle, Award, Users } from 'lucide-react';

interface IkmScoreCardProps {
    result: IkmResult;
    title?: string;
    subtitle?: string;
    showHighlights?: boolean;
    className?: string;
}

export function IkmScoreCard({
    result,
    title = 'Indeks Kepuasan Masyarakat (IKM)',
    subtitle = 'Nilai konversi skala 25–100 sesuai Permenpan-RB No. 14 Tahun 2017',
    showHighlights = true,
    className,
}: IkmScoreCardProps) {
    const meta = GRADE_META[result.grade] ?? GRADE_META.D;

    const sortedByRank = [...(result.elements ?? [])].sort((a, b) => a.rank - b.rank);
    const strongest: ElementScore | undefined = sortedByRank[0];
    const weakest: ElementScore | undefined = sortedByRank[sortedByRank.length - 1];

    return (
        <Card className={cn('overflow-hidden border-border/80 shadow-sm', className)}>
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0F2744] via-[#1E4E8C] to-[#C9962B]" />
            <CardHeader className="pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
                        <CardDescription className="mt-1">{subtitle}</CardDescription>
                    </div>
                    <GradeBadge grade={result.grade} performance={result.performance} size="lg" />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className={cn('grid gap-4 rounded-xl border p-5 sm:grid-cols-3', meta.softClass)}>
                    <div className="sm:col-span-2">
                        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Skor Konversi IKM</p>
                        <div className="mt-1 flex items-baseline gap-3">
                            <span className={cn('text-5xl font-bold tracking-tight tabular-nums', meta.textClass)}>
                                {formatScore(result.ikm_score)}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">/ 100,00</span>
                        </div>
                        <div className="mt-4 space-y-1.5">
                            <Progress value={Math.min(100, Math.max(0, result.ikm_score))} className="h-2.5 bg-background/80" />
                            <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
                                <span>25,00 (D)</span>
                                <span>65,00 (C)</span>
                                <span>76,61 (B)</span>
                                <span>88,31 (A)</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-3 border-t pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Nilai Rata-Rata Tertimbang</p>
                            <p className="mt-0.5 text-xl font-bold text-foreground tabular-nums">
                                {formatScore(result.ikm_weighted, 4)}{' '}
                                <span className="text-xs font-normal text-muted-foreground">(skala 1–4)</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-semibold tabular-nums">{formatInt(result.respondent_count)}</span>
                            <span className="text-muted-foreground">responden valid</span>
                        </div>
                    </div>
                </div>

                {showHighlights && strongest && weakest && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-lg border bg-card p-3.5">
                            <div className="rounded-md bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <Award className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">Unsur Tertinggi (Peringkat 1)</p>
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {strongest.code} · {strongest.name}
                                </p>
                                <p className="mt-0.5 text-xs text-emerald-700 tabular-nums dark:text-emerald-400">
                                    NRR {formatScore(strongest.nrr, 3)} · Konversi {formatScore(strongest.conversion)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border bg-card p-3.5">
                            <div className="rounded-md bg-amber-50 p-2 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">Prioritas Perbaikan (Terendah)</p>
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {weakest.code} · {weakest.name}
                                </p>
                                <p className="mt-0.5 text-xs text-amber-700 tabular-nums dark:text-amber-400">
                                    NRR {formatScore(weakest.nrr, 3)} · Konversi {formatScore(weakest.conversion)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
