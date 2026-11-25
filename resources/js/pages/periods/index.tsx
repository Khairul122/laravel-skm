import { EmptyState } from '@/components/skm/empty-state';
import { PeriodStatusBadge } from '@/components/skm/grade-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatDateId, formatInt, skmRoute } from '@/lib/skm-utils';
import { type BreadcrumbItem } from '@/types';
import { type Paginated, type Period } from '@/types/skm';
import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, Eye, FileSpreadsheet, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PeriodsIndexProps {
    periods: Paginated<Period>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Periode Survei', href: '/periode' },
];

export default function PeriodsIndex({ periods }: PeriodsIndexProps) {
    const [deleteTarget, setDeleteTarget] = useState<Period | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(skmRoute('periods.destroy', { periode: deleteTarget.id, period: deleteTarget.id }, `/periode/${deleteTarget.id}`), {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Periode Survei SKM" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Daftar Periode Survei SKM</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola periode pengumpulan data SKM, unggah responden CSV/Excel, dan pantau hasil IKM setiap semester atau triwulan.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={skmRoute('periods.create', undefined, '/periode/create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Periode Baru
                        </Link>
                    </Button>
                </div>

                {periods.data.length === 0 ? (
                    <EmptyState
                        title="Belum Ada Periode Survei"
                        description="Buat periode survei baru untuk mulai mengimpor data kuesioner dan menghitung IKM unit pelayanan."
                        actionLabel="Buat Periode Pertama"
                        actionHref={skmRoute('periods.create', undefined, '/periode/create')}
                    />
                ) : (
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Periode Terdaftar ({periods.total})</CardTitle>
                            <CardDescription>Menampilkan halaman {periods.current_page} dari {periods.last_page}.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6 sm:pt-0">
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="min-w-[190px]">Periode &amp; Instansi</TableHead>
                                            <TableHead>Tanggal Pelaksanaan</TableHead>
                                            <TableHead className="text-right">Populasi</TableHead>
                                            <TableHead className="text-right">Responden</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-right">Tindakan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {periods.data.map((period) => (
                                            <TableRow key={period.id}>
                                                <TableCell>
                                                    <Link
                                                        href={skmRoute(
                                                            'periods.show',
                                                            { periode: period.id, period: period.id },
                                                            `/periode/${period.id}`,
                                                        )}
                                                        className="font-semibold text-foreground hover:text-primary hover:underline"
                                                    >
                                                        {period.label}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">{period.agency?.name ?? '—'}</p>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground tabular-nums">
                                                    {formatDateId(period.start_date)} – {formatDateId(period.end_date)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm tabular-nums">
                                                    {period.population ? formatInt(period.population) : '—'}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold tabular-nums">
                                                    {formatInt(period.respondents_count ?? 0)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <PeriodStatusBadge status={period.status} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-wrap justify-end gap-1.5">
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link
                                                                href={skmRoute(
                                                                    'periods.show',
                                                                    { periode: period.id, period: period.id },
                                                                    `/periode/${period.id}`,
                                                                )}
                                                            >
                                                                <Eye className="mr-1 h-3.5 w-3.5" />
                                                                Detail
                                                            </Link>
                                                        </Button>
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
                                                                <BarChart3 className="mr-1 h-3.5 w-3.5" />
                                                                Hasil
                                                            </Link>
                                                        </Button>
                                                        <Button asChild variant="ghost" size="icon" aria-label={`Ubah ${period.label}`}>
                                                            <Link
                                                                href={skmRoute(
                                                                    'periods.edit',
                                                                    { periode: period.id, period: period.id },
                                                                    `/periode/${period.id}/edit`,
                                                                )}
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            aria-label={`Hapus ${period.label}`}
                                                            onClick={() => setDeleteTarget(period)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {periods.last_page > 1 && (
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-4 pb-4 sm:px-0 sm:pb-0">
                                    <p className="text-xs text-muted-foreground">
                                        Menampilkan {periods.from ?? 0}–{periods.to ?? 0} dari {periods.total} periode
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!periods.prev_page_url}
                                            onClick={() => periods.prev_page_url && router.visit(periods.prev_page_url)}
                                        >
                                            Sebelumnya
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!periods.next_page_url}
                                            onClick={() => periods.next_page_url && router.visit(periods.next_page_url)}
                                        >
                                            Berikutnya
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Periode Survei?</DialogTitle>
                        <DialogDescription>
                            Periode <strong>{deleteTarget?.label}</strong> beserta seluruh responden dan hasil IKM di dalamnya akan dihapus permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                            Batal
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Menghapus...' : 'Ya, Hapus Periode'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
