import { EmptyState } from '@/components/skm/empty-state';
import { GradeBadge, PeriodStatusBadge } from '@/components/skm/grade-badge';
import { IkmScoreCard } from '@/components/skm/ikm-score-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatDateId, formatInt, formatScore, GRADE_META, skmRoute } from '@/lib/skm-utils';
import { type BreadcrumbItem } from '@/types';
import { type DashboardLatestResult, type DashboardStats, type IkmResult, type Period } from '@/types/skm';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, Building2, ClipboardList, FileSpreadsheet, Plus, TrendingUp, Users } from 'lucide-react';

interface DashboardProps {
    stats?: DashboardStats;
    latestResult?: DashboardLatestResult | IkmResult | null;
    recentPeriods?: Period[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

function isFullIkmResult(res: DashboardLatestResult | IkmResult): res is IkmResult {
    return Array.isArray((res as IkmResult).elements) && (res as IkmResult).elements.length > 0;
}

export default function Dashboard({
    stats = { agencies: 0, periods: 0, respondents: 0, latestScore: null },
    latestResult = null,
    recentPeriods = [],
}: DashboardProps) {
    const latestSummary = latestResult as DashboardLatestResult | null;
    const latestMeta = latestResult ? GRADE_META[latestResult.grade] ?? GRADE_META.D : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard SKM" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Survei Kepuasan Masyarakat</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Ringkasan instansi, periode survei aktif, jumlah responden anonim, serta capaian nilai IKM terbaru.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button asChild variant="outline">
                            <Link href={skmRoute('agencies.create', undefined, '/instansi/create')}>
                                <Building2 className="mr-2 h-4 w-4" />
                                Tambah Instansi
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={skmRoute('periods.create', undefined, '/periode/create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Buat Periode Survei
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 4 Kartu Statistik */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Instansi Terdaftar</CardTitle>
                            <Building2 className="h-4 w-4 text-[#1E4E8C]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tabular-nums">{formatInt(stats.agencies)}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Unit penyelenggara pelayanan</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Periode Survei</CardTitle>
                            <ClipboardList className="h-4 w-4 text-[#C9962B]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tabular-nums">{formatInt(stats.periods)}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Total periode tercatat</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Responden</CardTitle>
                            <Users className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tabular-nums">{formatInt(stats.respondents)}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Tersimpan secara anonim</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Skor IKM Terakhir</CardTitle>
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tabular-nums">
                                {stats.latestScore !== null ? formatScore(stats.latestScore) : '—'}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Skala konversi 25,00–100,00</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Hasil IKM Terakhir */}
                {latestResult ? (
                    isFullIkmResult(latestResult) ? (
                        <IkmScoreCard
                            result={latestResult}
                            title={`Capaian IKM Terakhir${latestSummary?.period_label ? ` — ${latestSummary.period_label}` : ''}`}
                            subtitle={latestSummary?.agency_name ?? 'Ringkasan indeks kepuasan masyarakat periode terbaru'}
                        />
                    ) : (
                        <Card className="overflow-hidden border-border/80 shadow-sm">
                            <div className="h-1.5 w-full bg-gradient-to-r from-[#0F2744] via-[#1E4E8C] to-[#C9962B]" />
                            <CardHeader className="pb-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Capaian IKM Terakhir{latestSummary?.period_label ? ` — ${latestSummary.period_label}` : ''}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {latestSummary?.agency_name ?? 'Unit Pelayanan Publik'} ·{' '}
                                            <span className="font-medium text-foreground tabular-nums">
                                                {formatInt(latestResult.respondent_count)} responden
                                            </span>
                                        </CardDescription>
                                    </div>
                                    <GradeBadge grade={latestResult.grade} performance={latestResult.performance} size="lg" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col justify-between gap-4 rounded-xl border bg-muted/35 p-5 sm:flex-row sm:items-center">
                                    <div className="space-y-2 sm:w-2/3">
                                        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Skor Konversi IKM</p>
                                        <div className="flex items-baseline gap-2.5">
                                            <span className={`text-4xl font-bold tabular-nums sm:text-5xl ${latestMeta?.textClass ?? ''}`}>
                                                {formatScore(latestResult.ikm_score)}
                                            </span>
                                            <span className="text-sm text-muted-foreground">/ 100,00</span>
                                        </div>
                                        <Progress value={Math.min(100, Math.max(0, latestResult.ikm_score))} className="h-2.5" />
                                    </div>

                                    {latestSummary?.period_id && (
                                        <Button asChild size="lg">
                                            <Link
                                                href={skmRoute(
                                                    'results.show',
                                                    { period: latestSummary.period_id },
                                                    `/periode/${latestSummary.period_id}/hasil`,
                                                )}
                                            >
                                                <BarChart3 className="mr-2 h-4 w-4" />
                                                Buka Rincian &amp; Unduh Laporan
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                ) : (
                    <EmptyState
                        title="Belum Ada Hasil Perhitungan IKM"
                        description="Buat periode survei lalu unggah berkas CSV/Excel responden untuk menampilkan grafik 9 unsur dan laporan SKM."
                        actionLabel="Kelola Periode Survei"
                        actionHref={skmRoute('periods.index', undefined, '/periode')}
                    />
                )}

                {/* Daftar Periode Terbaru */}
                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">Periode Survei Terbaru</CardTitle>
                            <CardDescription>Akses cepat menuju detail periode, impor responden, dan hasil analisis IKM.</CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href={skmRoute('periods.index', undefined, '/periode')}>
                                Lihat Semua
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        {recentPeriods.length > 0 ? (
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Periode</TableHead>
                                            <TableHead>Instansi</TableHead>
                                            <TableHead>Rentang Tanggal</TableHead>
                                            <TableHead className="text-right">Responden</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-right">Tindakan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentPeriods.map((period) => (
                                            <TableRow key={period.id}>
                                                <TableCell className="font-semibold">
                                                    <Link
                                                        href={skmRoute('periods.show', { period: period.id }, `/periode/${period.id}`)}
                                                        className="hover:text-primary hover:underline"
                                                    >
                                                        {period.label}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{period.agency?.name ?? '—'}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground tabular-nums">
                                                    {formatDateId(period.start_date)} – {formatDateId(period.end_date)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium tabular-nums">
                                                    {formatInt(period.respondents_count ?? 0)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <PeriodStatusBadge status={period.status} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        {period.status !== 'closed' && (
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link
                                                                    href={skmRoute(
                                                                        'imports.create',
                                                                        { period: period.id },
                                                                        `/periode/${period.id}/impor`,
                                                                    )}
                                                                >
                                                                    <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
                                                                    Impor
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        <Button asChild size="sm">
                                                            <Link
                                                                href={skmRoute(
                                                                    'results.show',
                                                                    { period: period.id },
                                                                    `/periode/${period.id}/hasil`,
                                                                )}
                                                            >
                                                                Hasil IKM
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                                Belum ada periode survei. Klik tombol <strong>Buat Periode Survei</strong> untuk memulai.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
