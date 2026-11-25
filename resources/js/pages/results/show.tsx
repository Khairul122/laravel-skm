import { ElementBarChart } from '@/components/skm/element-bar-chart';
import { ElementScoreTable } from '@/components/skm/element-score-table';
import { EmptyState } from '@/components/skm/empty-state';
import { GradeBadge, PeriodStatusBadge } from '@/components/skm/grade-badge';
import { IkmScoreCard } from '@/components/skm/ikm-score-card';
import { SampleSufficiencyCard } from '@/components/skm/sample-sufficiency-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { formatDateId, formatInt, formatScore, GRADE_META, skmRoute } from '@/lib/skm-utils';
import { type BreadcrumbItem } from '@/types';
import { type Grade, type IkmResult, type Period, type SampleSufficiency, type ServiceResult } from '@/types/skm';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Building2, Calendar, Download, FileCode2, FileSpreadsheet, FileText, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface ResultsShowProps {
    period: Period;
    overall: IkmResult | null;
    services: ServiceResult[];
    sample: SampleSufficiency;
}

function getCsrfToken(): string {
    if (typeof document === 'undefined') return '';
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

export default function ResultsShow({ period, overall, services = [], sample }: ResultsShowProps) {
    const [recalculating, setRecalculating] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Periode Survei', href: '/periode' },
        { title: period.label, href: `/periode/${period.id}` },
        { title: 'Hasil IKM', href: '#' },
    ];

    const handleRecalculate = () => {
        setRecalculating(true);
        router.post(
            skmRoute('results.recalculate', { period: period.id }, `/periode/${period.id}/hitung-ulang`),
            {},
            {
                preserveScroll: true,
                onFinish: () => setRecalculating(false),
            },
        );
    };

    const csrfToken = getCsrfToken();
    const docxUrl = skmRoute('reports.generate', { period: period.id, format: 'docx' }, `/periode/${period.id}/laporan/docx`);
    const mdUrl = skmRoute('reports.generate', { period: period.id, format: 'md' }, `/periode/${period.id}/laporan/md`);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Hasil IKM — ${period.label}`} />

            <div className="space-y-6">
                {/* Header & Aksi Utama */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight">Hasil Analisis &amp; Laporan IKM</h1>
                            <PeriodStatusBadge status={period.status} />
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                                <Building2 className="h-4 w-4 text-primary" />
                                {period.agency?.name ?? 'Unit Pelayanan'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 tabular-nums">
                                <Calendar className="h-4 w-4" />
                                {period.label} ({formatDateId(period.start_date)} – {formatDateId(period.end_date)})
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={skmRoute('periods.show', { periode: period.id, period: period.id }, `/periode/${period.id}`)}>
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Detail Periode
                            </Link>
                        </Button>

                        {period.status !== 'closed' && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={skmRoute('imports.create', { period: period.id }, `/periode/${period.id}/impor`)}>
                                    <FileSpreadsheet className="mr-1.5 h-4 w-4" />
                                    Impor Data
                                </Link>
                            </Button>
                        )}

                        <Button type="button" variant="outline" size="sm" onClick={handleRecalculate} disabled={recalculating}>
                            <RefreshCw className={`mr-1.5 h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} />
                            {recalculating ? 'Menghitung...' : 'Hitung Ulang'}
                        </Button>

                        {overall && (
                            <>
                                <form method="POST" action={docxUrl} className="inline-flex">
                                    <input type="hidden" name="_token" value={csrfToken} />
                                    <Button type="submit" size="sm" className="bg-[#0F2744] text-white hover:bg-[#173A63]">
                                        <FileText className="mr-1.5 h-4 w-4" />
                                        Unduh Word (.docx)
                                    </Button>
                                </form>
                                <form method="POST" action={mdUrl} className="inline-flex">
                                    <input type="hidden" name="_token" value={csrfToken} />
                                    <Button type="submit" variant="secondary" size="sm">
                                        <FileCode2 className="mr-1.5 h-4 w-4" />
                                        Unduh Markdown (.md)
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                {!overall ? (
                    <EmptyState
                        title="Belum Ada Data Responden untuk Dihitung"
                        description="Silakan unggah berkas CSV/Excel responden terlebih dahulu, atau tekan Hitung Ulang jika data responden sudah masuk."
                        actionLabel={period.status !== 'closed' ? 'Impor Data Responden' : 'Kembali ke Periode'}
                        actionHref={
                            period.status !== 'closed'
                                ? skmRoute('imports.create', { period: period.id }, `/periode/${period.id}/impor`)
                                : skmRoute('periods.show', { periode: period.id, period: period.id }, `/periode/${period.id}`)
                        }
                    />
                ) : (
                    <>
                        {/* Skor IKM Besar + Kecukupan Sampel */}
                        <div className="grid gap-6 lg:grid-cols-12">
                            <div className="lg:col-span-7">
                                <IkmScoreCard
                                    result={overall}
                                    title={`IKM Unit Pelayanan — ${period.label}`}
                                    subtitle={period.agency?.unit_name || period.agency?.name || 'Keseluruhan jenis layanan'}
                                />
                            </div>
                            <div className="flex flex-col justify-between gap-4 lg:col-span-5">
                                <SampleSufficiencyCard sample={sample} />

                                <Card className="border-border/80 bg-muted/30 shadow-xs">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                            <Download className="h-4 w-4 text-primary" />
                                            Paket Laporan Resmi (BAB I–IV)
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Dokumen mencakup pendahuluan, metodologi 9 unsur, tabel rincian NRR, per jenis layanan, dan lembar
                                            pengesahan kepala instansi.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-wrap gap-2">
                                        <form method="POST" action={docxUrl}>
                                            <input type="hidden" name="_token" value={csrfToken} />
                                            <Button type="submit" size="sm" variant="default">
                                                <FileText className="mr-1.5 h-3.5 w-3.5" />
                                                Unduh Laporan Word
                                            </Button>
                                        </form>
                                        <form method="POST" action={mdUrl}>
                                            <input type="hidden" name="_token" value={csrfToken} />
                                            <Button type="submit" size="sm" variant="outline">
                                                <FileCode2 className="mr-1.5 h-3.5 w-3.5" />
                                                Unduh Markdown
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Tabs Rincian */}
                        <Tabs defaultValue="elements" className="space-y-4">
                            <TabsList className="grid w-full max-w-xl grid-cols-3">
                                <TabsTrigger value="elements">9 Unsur Pelayanan</TabsTrigger>
                                <TabsTrigger value="services">Per Jenis Layanan ({services.length})</TabsTrigger>
                                <TabsTrigger value="intervals">Interval Mutu</TabsTrigger>
                            </TabsList>

                            <TabsContent value="elements" className="space-y-6">
                                <ElementBarChart elements={overall.elements} />
                                <ElementScoreTable
                                    elements={overall.elements}
                                    ikmWeighted={overall.ikm_weighted}
                                    ikmScore={overall.ikm_score}
                                />
                            </TabsContent>

                            <TabsContent value="services" className="space-y-4">
                                <Card className="border-border/80 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Rekapitulasi IKM per Jenis Layanan</CardTitle>
                                        <CardDescription>
                                            Perbandingan capaian mutu antar jenis layanan pada periode {period.label}.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                                        {services.length === 0 ? (
                                            <p className="p-6 text-sm text-muted-foreground">
                                                Belum ada rincian per jenis layanan untuk periode ini.
                                            </p>
                                        ) : (
                                            <div className="overflow-x-auto rounded-md border">
                                                <Table>
                                                    <TableHeader className="bg-muted/50">
                                                        <TableRow>
                                                            <TableHead className="min-w-[220px]">Jenis Layanan</TableHead>
                                                            <TableHead className="text-right">Responden</TableHead>
                                                            <TableHead className="text-right">IKM Tertimbang</TableHead>
                                                            <TableHead className="text-right">Nilai Konversi</TableHead>
                                                            <TableHead className="text-center">Mutu</TableHead>
                                                            <TableHead className="min-w-[180px]">Unsur Terendah</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {services.map((svc) => {
                                                            const sorted = [...(svc.elements ?? [])].sort((a, b) => a.nrr - b.nrr);
                                                            const weakest = sorted[0];
                                                            return (
                                                                <TableRow key={svc.service_type_id}>
                                                                    <TableCell className="font-semibold">{svc.service_name}</TableCell>
                                                                    <TableCell className="text-right tabular-nums">
                                                                        {formatInt(svc.respondent_count)}
                                                                    </TableCell>
                                                                    <TableCell className="text-right tabular-nums">
                                                                        {formatScore(svc.ikm_weighted, 4)}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-bold text-primary tabular-nums">
                                                                        {formatScore(svc.ikm_score)}
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        <GradeBadge grade={svc.grade} performance={svc.performance} size="sm" />
                                                                    </TableCell>
                                                                    <TableCell className="text-xs text-muted-foreground">
                                                                        {weakest ? (
                                                                            <span>
                                                                                <strong className="text-foreground">{weakest.code}</strong> ·{' '}
                                                                                {weakest.name} ({formatScore(weakest.conversion)})
                                                                            </span>
                                                                        ) : (
                                                                            '—'
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="intervals">
                                <Card className="border-border/80 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Acuan Kategori Mutu Pelayanan</CardTitle>
                                        <CardDescription>Berdasarkan Lampiran Permenpan-RB Nomor 14 Tahun 2017.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                        {(['A', 'B', 'C', 'D'] as Grade[]).map((g) => {
                                            const meta = GRADE_META[g];
                                            const isCurrent = overall.grade === g;
                                            return (
                                                <div
                                                    key={g}
                                                    className={`rounded-xl border p-4 ${isCurrent ? `${meta.softClass} ring-2 ${meta.ringClass}` : 'bg-card'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <GradeBadge grade={g} performance={meta.performance} size="sm" />
                                                        {isCurrent && (
                                                            <span className="text-[11px] font-semibold text-primary">Capaian Saat Ini</span>
                                                        )}
                                                    </div>
                                                    <p className="mt-3 text-lg font-bold tabular-nums">{meta.interval}</p>
                                                    <p className="text-xs text-muted-foreground">Skala Nilai Konversi</p>
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
