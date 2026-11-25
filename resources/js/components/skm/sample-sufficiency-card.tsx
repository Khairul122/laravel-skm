import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatInt } from '@/lib/skm-utils';
import { type SampleSufficiency } from '@/types/skm';
import { CheckCircle2, Info, ShieldAlert } from 'lucide-react';

export function SampleSufficiencyCard({ sample }: { sample: SampleSufficiency }) {
    const hasPopulation = sample.population !== null && sample.population > 0;
    const ratio = sample.minimum > 0 ? Math.min(100, Math.round((sample.actual / sample.minimum) * 100)) : 0;

    return (
        <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-base font-semibold">Kecukupan Sampel (Krejcie &amp; Morgan)</CardTitle>
                        <CardDescription>Pedoman ukuran sampel minimum Permenpan-RB 14/2017 (galat 5%, kepercayaan 95%).</CardDescription>
                    </div>
                    {!hasPopulation ? (
                        <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700">
                            <Info className="mr-1 h-3.5 w-3.5" />
                            Populasi belum diisi
                        </Badge>
                    ) : sample.sufficient ? (
                        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Memenuhi Sampel Minimum
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                            <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                            Di Bawah Sampel Minimum
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
                    <div className="rounded-lg border bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Populasi (N)</p>
                        <p className="mt-1 text-lg font-bold tabular-nums">{hasPopulation ? formatInt(sample.population) : '—'}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Minimal (s)</p>
                        <p className="mt-1 text-lg font-bold tabular-nums">{hasPopulation ? formatInt(sample.minimum) : '—'}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/40 p-3">
                        <p className="text-xs text-muted-foreground">Responden Aktual</p>
                        <p className="mt-1 text-lg font-bold text-primary tabular-nums">{formatInt(sample.actual)}</p>
                    </div>
                </div>

                {hasPopulation && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                            <span>Ketercapaian sampel</span>
                            <span>
                                {formatInt(sample.actual)} / {formatInt(sample.minimum)} ({ratio}%)
                            </span>
                        </div>
                        <Progress value={ratio} className="h-2" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
