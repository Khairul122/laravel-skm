import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { formatScore, getGradeFromConversion, GRADE_META } from '@/lib/skm-utils';
import { type ElementScore } from '@/types/skm';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from 'recharts';

interface ElementBarChartProps {
    elements: ElementScore[];
    title?: string;
    description?: string;
}

const chartConfig: ChartConfig = {
    conversion: {
        label: 'Nilai Konversi',
        color: 'var(--chart-1)',
    },
};

export function ElementBarChart({
    elements,
    title = 'Grafik Nilai Konversi per Unsur (U1–U9)',
    description = 'Garis putus-putus menandai batas minimal kategori Baik (76,61) dan Sangat Baik (88,31).',
}: ElementBarChartProps) {
    const data = elements.map((el) => ({
        ...el,
        fill: GRADE_META[getGradeFromConversion(el.conversion)].barHex,
    }));

    return (
        <Card className="border-border/80 shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/60" />
                        <XAxis dataKey="code" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} width={36} />
                        <ReferenceLine y={76.61} stroke="#1E4E8C" strokeDasharray="4 4" strokeOpacity={0.65} />
                        <ReferenceLine y={88.31} stroke="#059669" strokeDasharray="4 4" strokeOpacity={0.65} />
                        <ChartTooltip
                            cursor={{ fill: 'rgba(15, 39, 68, 0.06)' }}
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) {
                                    return null;
                                }
                                const item = payload[0].payload as ElementScore & { fill: string };
                                const grade = getGradeFromConversion(item.conversion);
                                return (
                                    <div className="min-w-[210px] rounded-lg border bg-background p-3 text-xs shadow-lg">
                                        <p className="font-semibold text-foreground">
                                            {item.code} · {item.name}
                                        </p>
                                        <div className="mt-2 space-y-1 text-muted-foreground tabular-nums">
                                            <div className="flex justify-between gap-4">
                                                <span>Konversi (×25):</span>
                                                <span className="font-bold text-foreground">
                                                    {formatScore(item.conversion)} (Mutu {grade})
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span>NRR (skala 1–4):</span>
                                                <span className="font-medium text-foreground">{formatScore(item.nrr, 3)}</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span>NRR Tertimbang:</span>
                                                <span className="font-medium text-foreground">{formatScore(item.nrr_weighted, 4)}</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span>Peringkat Unsur:</span>
                                                <span className="font-medium text-foreground">#{item.rank}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        <Bar dataKey="conversion" radius={[6, 6, 0, 0]} maxBarSize={44}>
                            {data.map((entry) => (
                                <Cell key={entry.code} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-[#059669]" />A (≥ 88,31)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-[#1E4E8C]" />B (76,61–88,30)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-[#D97706]" />C (65,00–76,60)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-[#DC2626]" />D (&lt; 65,00)
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
