import { EmptyState } from '@/components/skm/empty-state';
import { GradeBadge, PeriodStatusBadge } from '@/components/skm/grade-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatDateId, formatInt, formatScore, skmRoute } from '@/lib/skm-utils';
import { type BreadcrumbItem } from '@/types';
import { type Period } from '@/types/skm';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Building2, Calendar, FileSpreadsheet, Pencil, Users } from 'lucide-react';

interface PeriodShowProps {
    period: Period;
}

export default function PeriodShow({ period }: PeriodShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Periode Survei', href: '/periode' },
        { title: period.label, href: `/periode/${period.id}` },
    ];

    const overallSnapshot = period.results?.find((r) => r.service_type_id === null);
    const serviceSnapshots = period.results?.filter((r) => r.service_type_id !== null) ?? [];
    const imports = period.imports ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Periode — ${period.label}`} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight">{period.label}</h1>
                            <PeriodStatusBadge status={period.status} />
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <Building2 className="h-4 w-4" />
                                {period.agency?.name ?? 'Instansi'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 tabular-nums">
                                <Calendar className="h-4 w-4" />
                                {formatDateId(period.start_date)} – {formatDateId(period.end_date)}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={skmRoute('periods.index', undefined, '/periode')}>
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Daftar Periode
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href={skmRoute('periods.edit', { periode: period.id, period: period.id }, `/periode/${period.id}/edit`)}>
                                <Pencil className="mr-1.5 h-4 w-4" />
                                Ubah
                            </Link>
                        </Button>
                        {period.status !== 'closed' && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={skmRoute('imports.create', { period: period.id }, `/periode/${period.id}/impor`)}>
                                    <FileSpreadsheet className="mr-1.5 h-4 w-4" />
                                    Impor CSV/Excel
                                </Link>
                            </Button>
                        )}
                        <Button asChild size="sm">
                            <Link href={skmRoute('results.show', { period: period.id }, `/periode/${period.id}/hasil`)}>
                                <BarChart3 className="mr-1.5 h-4 w-4" />
                                Hasil &amp; Laporan IKM
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Ringkasan Angka */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-2">
                            <CardDescription>Total Responden</CardDescription>
                            <CardTitle className="flex items-center gap-2 text-2xl tabular-nums">
                                <Users className="h-5 w-5 text-primary" />
                                {formatInt(period.respondents_count ?? 0)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Populasi tercatat: {period.population ? `${formatInt(period.population)} orang` : 'Belum diisi'}
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-2">
                            <CardDescription>Skor IKM Terakhir</CardDescription>
                            <CardTitle className="text-2xl tabular-nums">
                                {overallSnapshot ? formatScore(overallSnapshot.ikm_score) : 'Belum dihitung'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {overallSnapshot ? (
                                <GradeBadge grade={overallSnapshot.grade} performance={overallSnapshot.performance} size="sm" />
                            ) : (
                                <span className="text-xs text-muted-foreground">Impor data atau buka halaman Hasil IKM</span>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="pb-2">
                            <CardDescription>Jenis Layanan Terukur</CardDescription>
                            <CardTitle className="text-2xl tabular-nums">{formatInt(serviceSnapshots.length)}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Riwayat impor berkas: {formatInt(imports.length)} kali
                        </CardContent>
                    </Card>
                </div>

                {/* Riwayat Impor */}
                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">Riwayat Impor Data Responden</CardTitle>
                            <CardDescription>Catatan berkas yang diunggah beserta jumlah baris valid dan baris yang dilewati.</CardDescription>
                        </div>
                        {period.status !== 'closed' && (
                            <Button asChild size="sm" variant="outline">
                                <Link href={skmRoute('imports.create', { period: period.id }, `/periode/${period.id}/impor`)}>
                                    <FileSpreadsheet className="mr-1.5 h-4 w-4" />
                                    Unggah Berkas Baru
                                </Link>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        {imports.length === 0 ? (
                            <div className="p-6">
                                <EmptyState
                                    title="Belum Ada Berkas Diimpor"
                                    description={
                                        period.status === 'closed'
                                            ? 'Periode ini berstatus Ditutup dan tidak menerima impor baru.'
                                            : 'Unggah berkas CSV atau Excel responden untuk memulai penghitungan IKM otomatis.'
                                    }
                                    actionLabel={period.status !== 'closed' ? 'Unggah Berkas Survei' : undefined}
                                    actionHref={
                                        period.status !== 'closed'
                                            ? skmRoute('imports.create', { period: period.id }, `/periode/${period.id}/impor`)
                                            : undefined
                                    }
                                />
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Nama Berkas</TableHead>
                                            <TableHead className="text-right">Total Baris</TableHead>
                                            <TableHead className="text-right">Valid</TableHead>
                                            <TableHead className="text-right">Dilewati</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {imports.map((imp) => (
                                            <TableRow key={imp.id}>
                                                <TableCell className="font-medium">
                                                    <div>{imp.original_filename}</div>
                                                    {imp.user?.name && (
                                                        <span className="text-xs text-muted-foreground">Oleh {imp.user.name}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">{formatInt(imp.total_rows)}</TableCell>
                                                <TableCell className="text-right font-semibold text-emerald-700 tabular-nums dark:text-emerald-400">
                                                    {formatInt(imp.valid_rows)}
                                                </TableCell>
                                                <TableCell className="text-right text-amber-700 tabular-nums dark:text-amber-400">
                                                    {formatInt(imp.invalid_rows)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={imp.status === 'completed' ? 'default' : 'secondary'}>
                                                        {imp.status === 'completed'
                                                            ? 'Selesai'
                                                            : imp.status === 'pending'
                                                              ? 'Menunggu Pemetaan'
                                                              : 'Gagal'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
