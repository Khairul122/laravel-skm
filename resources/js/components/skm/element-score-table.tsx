import { GradeBadge } from '@/components/skm/grade-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatInt, formatScore, getGradeFromConversion } from '@/lib/skm-utils';
import { type ElementScore } from '@/types/skm';

interface ElementScoreTableProps {
    elements: ElementScore[];
    ikmWeighted?: number;
    ikmScore?: number;
    title?: string;
    description?: string;
}

export function ElementScoreTable({
    elements,
    ikmWeighted,
    ikmScore,
    title = 'Rincian Nilai Unsur Pelayanan (U1–U9)',
    description = 'Rekapitulasi NRR (Nilai Rata-Rata), NRR Tertimbang (bobot 1/9), dan Nilai Konversi (×25).',
}: ElementScoreTableProps) {
    const showTotalColumn = elements.some((el) => typeof el.total === 'number' && el.total > 0);

    return (
        <Card className="border-border/80 shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-16">Kode</TableHead>
                                <TableHead className="min-w-[200px]">Unsur Pelayanan</TableHead>
                                {showTotalColumn && <TableHead className="text-right">Jumlah Skor</TableHead>}
                                <TableHead className="text-right">NRR</TableHead>
                                <TableHead className="text-right">NRR Tertimbang</TableHead>
                                <TableHead className="text-right">Konversi</TableHead>
                                <TableHead className="text-center">Mutu</TableHead>
                                <TableHead className="text-center">Peringkat</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {elements.map((el) => {
                                const grade = getGradeFromConversion(el.conversion);
                                const isLowest = el.rank === elements.length;
                                return (
                                    <TableRow key={el.code} className={isLowest ? 'bg-amber-50/40 dark:bg-amber-950/20' : undefined}>
                                        <TableCell className="font-semibold text-primary">{el.code}</TableCell>
                                        <TableCell className="font-medium">{el.name}</TableCell>
                                        {showTotalColumn && (
                                            <TableCell className="text-right tabular-nums">{formatInt(el.total)}</TableCell>
                                        )}
                                        <TableCell className="text-right tabular-nums">{formatScore(el.nrr, 3)}</TableCell>
                                        <TableCell className="text-right tabular-nums">{formatScore(el.nrr_weighted, 4)}</TableCell>
                                        <TableCell className="text-right font-semibold tabular-nums">{formatScore(el.conversion)}</TableCell>
                                        <TableCell className="text-center">
                                            <GradeBadge grade={grade} size="sm" />
                                        </TableCell>
                                        <TableCell className="text-center font-semibold tabular-nums">#{el.rank}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                        {(ikmWeighted !== undefined || ikmScore !== undefined) && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={showTotalColumn ? 4 : 3} className="font-semibold">
                                        Total IKM Unit Pelayanan
                                    </TableCell>
                                    <TableCell className="text-right font-bold tabular-nums">
                                        {ikmWeighted !== undefined ? formatScore(ikmWeighted, 4) : '—'}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-primary tabular-nums">
                                        {ikmScore !== undefined ? formatScore(ikmScore) : '—'}
                                    </TableCell>
                                    <TableCell colSpan={2} className="text-center text-xs text-muted-foreground">
                                        Bobot per unsur: 1/9 (0,1111)
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
