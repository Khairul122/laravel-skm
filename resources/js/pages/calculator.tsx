import InputError from '@/components/input-error';
import { ElementBarChart } from '@/components/skm/element-bar-chart';
import { ElementScoreTable } from '@/components/skm/element-score-table';
import { IkmScoreCard } from '@/components/skm/ikm-score-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import PublicLayout from '@/layouts/public-layout';
import { formatScore, PERMENPAN_9_ELEMENTS_REFERENCE, skmRoute } from '@/lib/skm-utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { type Element, type IkmResult } from '@/types/skm';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Calculator as CalculatorIcon, RotateCcw, Sparkles } from 'lucide-react';
import { FormEventHandler } from 'react';

interface CalculatorProps {
    elements?: Element[];
    result?: IkmResult | null;
}

type RatingCode = 'U1' | 'U2' | 'U3' | 'U4' | 'U5' | 'U6' | 'U7' | 'U8' | 'U9';

const CODES: RatingCode[] = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9'];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kalkulator IKM', href: '/kalkulator' },
];

export default function Calculator({ elements = [], result = null }: CalculatorProps) {
    const { auth } = usePage<SharedData>().props;
    const activeElements = elements.length > 0 ? elements : PERMENPAN_9_ELEMENTS_REFERENCE.map((e, i) => ({ id: i + 1, ...e }));

    const { data, setData, post, processing, errors } = useForm<{ ratings: Record<RatingCode, number> }>({
        ratings: {
            U1: 3.2,
            U2: 3.3,
            U3: 2.9,
            U4: 3.8,
            U5: 3.2,
            U6: 3.2,
            U7: 3.3,
            U8: 3.0,
            U9: 3.1,
        },
    });

    const updateRating = (code: RatingCode, rawValue: string) => {
        const parsed = parseFloat(rawValue);
        const clamped = Number.isNaN(parsed) ? 1 : Math.min(4, Math.max(1, Math.round(parsed * 100) / 100));
        setData('ratings', {
            ...data.ratings,
            [code]: clamped,
        });
    };

    const applyPreset = (value: number | Record<RatingCode, number>) => {
        if (typeof value === 'number') {
            const next = {} as Record<RatingCode, number>;
            for (const c of CODES) {
                next[c] = value;
            }
            setData('ratings', next);
            return;
        }
        setData('ratings', value);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(skmRoute('calculator.calculate', undefined, '/kalkulator'), {
            preserveScroll: true,
        });
    };

    // Hitung estimasi langsung untuk membantu pratinjau sebelum klik Hitung
    const localWeighted = CODES.reduce((acc, c) => acc + (Number(data.ratings[c]) || 1) / 9, 0);
    const localConversion = Math.round(localWeighted * 25 * 100) / 100;

    const content = (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <Badge variant="outline" className="mb-2 border-primary/30 bg-primary/5 text-primary">
                        Simulasi &amp; Perhitungan Instan
                    </Badge>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Kalkulator Cepat IKM (9 Unsur)</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Masukkan skor rata-rata tiap unsur (skala 1,00 sampai 4,00) untuk menghitung nilai konversi IKM dan kategori mutu pelayanan.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => applyPreset(4)}>
                        <Sparkles className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                        Semua 4 (Mutu A)
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => applyPreset(1)}>
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-rose-600" />
                        Semua 1 (Mutu D)
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                <form onSubmit={submit} className="lg:col-span-5">
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Input Skor Rata-Rata Unsur</CardTitle>
                            <CardDescription>Gunakan angka 1,00 (Tidak Baik) hingga 4,00 (Sangat Baik).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {activeElements.map((el) => {
                                const code = el.code as RatingCode;
                                const val = data.ratings[code] ?? 3;
                                const fieldError = (errors as Record<string, string | undefined>)[`ratings.${code}`];

                                return (
                                    <div key={code} className="rounded-lg border bg-muted/25 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <Label htmlFor={`rating-${code}`} className="text-sm font-medium">
                                                <span className="mr-1.5 font-bold text-primary">{code}</span>
                                                {el.name}
                                            </Label>
                                            <Input
                                                id={`rating-${code}`}
                                                type="number"
                                                min={1}
                                                max={4}
                                                step={0.01}
                                                value={val}
                                                onChange={(e) => updateRating(code, e.target.value)}
                                                className="h-8 w-20 text-right font-semibold tabular-nums"
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            aria-label={`Geser skor ${code} ${el.name}`}
                                            min={1}
                                            max={4}
                                            step={0.05}
                                            value={val}
                                            onChange={(e) => updateRating(code, e.target.value)}
                                            className="mt-2.5 h-1.5 w-full cursor-pointer accent-[#0F2744]"
                                        />
                                        <InputError message={fieldError} className="mt-1" />
                                    </div>
                                );
                            })}

                            <div className="flex items-center justify-between rounded-lg border border-dashed bg-muted/40 px-3.5 py-2.5 text-xs">
                                <span className="text-muted-foreground">Pratinjau cepat (sebelum kirim):</span>
                                <span className="font-bold text-foreground tabular-nums">{formatScore(localConversion)} / 100</span>
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={processing}>
                                <CalculatorIcon className="mr-2 h-4 w-4" />
                                {processing ? 'Menghitung IKM...' : 'Hitung Skor IKM & Mutu'}
                            </Button>
                        </CardContent>
                    </Card>
                </form>

                <div className="space-y-6 lg:col-span-7" id="hasil-kalkulator">
                    {result ? (
                        <>
                            <IkmScoreCard
                                result={result}
                                title="Hasil Perhitungan Kalkulator IKM"
                                subtitle="Dihitung di server menggunakan rumus resmi Permenpan-RB 14/2017."
                            />
                            <ElementBarChart elements={result.elements} />
                            <ElementScoreTable
                                elements={result.elements}
                                ikmWeighted={result.ikm_weighted}
                                ikmScore={result.ikm_score}
                            />
                        </>
                    ) : (
                        <Card className="border-dashed border-border/90 bg-card/70">
                            <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                <img
                                    src="/images/skm/step-petakan.png"
                                    alt="Ilustrasi perhitungan 9 unsur pelayanan publik"
                                    className="mb-5 h-44 w-auto rounded-lg object-contain mix-blend-multiply dark:mix-blend-normal"
                                />
                                <h2 className="text-lg font-semibold">Hasil Perhitungan Akan Tampil di Sini</h2>
                                <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                                    Atur skor rata-rata U1 sampai U9 pada panel di sebelah kiri, lalu tekan tombol{' '}
                                    <strong>Hitung Skor IKM &amp; Mutu</strong> untuk menampilkan nilai konversi, kategori mutu A–D, dan grafik 9
                                    unsur.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );

    if (auth?.user) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Kalkulator IKM" />
                {content}
            </AppLayout>
        );
    }

    return (
        <PublicLayout>
            <Head title="Kalkulator IKM Cepat" />
            {content}
        </PublicLayout>
    );
}
