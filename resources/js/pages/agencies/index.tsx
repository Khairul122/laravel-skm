import { EmptyState } from '@/components/skm/empty-state';
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
import { skmRoute } from '@/lib/skm-utils';
import { type BreadcrumbItem } from '@/types';
import { type Agency, type Paginated } from '@/types/skm';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, MapPin, Pencil, Plus, Trash2, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface AgenciesIndexProps {
    agencies: Paginated<Agency>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Instansi', href: '/instansi' },
];

export default function AgenciesIndex({ agencies }: AgenciesIndexProps) {
    const [deleteTarget, setDeleteTarget] = useState<Agency | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(skmRoute('agencies.destroy', { instansi: deleteTarget.id, agency: deleteTarget.id }, `/instansi/${deleteTarget.id}`), {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Instansi" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Manajemen Instansi &amp; Unit Pelayanan</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Identitas instansi dan pejabat penandatangan yang digunakan pada kop serta lembar pengesahan laporan SKM.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={skmRoute('agencies.create', undefined, '/instansi/create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Instansi
                        </Link>
                    </Button>
                </div>

                {agencies.data.length === 0 ? (
                    <EmptyState
                        title="Belum Ada Instansi Terdaftar"
                        description="Tambahkan data instansi atau unit penyelenggara pelayanan publik sebelum membuat periode survei."
                        actionLabel="Tambah Instansi Pertama"
                        actionHref={skmRoute('agencies.create', undefined, '/instansi/create')}
                    />
                ) : (
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Daftar Instansi ({agencies.total})</CardTitle>
                            <CardDescription>Menampilkan halaman {agencies.current_page} dari {agencies.last_page}.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6 sm:pt-0">
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="min-w-[230px]">Nama Instansi &amp; Unit</TableHead>
                                            <TableHead>Kota / Alamat</TableHead>
                                            <TableHead className="min-w-[220px]">Kepala Instansi</TableHead>
                                            <TableHead className="text-right">Tindakan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {agencies.data.map((agency) => (
                                            <TableRow key={agency.id}>
                                                <TableCell>
                                                    <div className="flex items-start gap-2.5">
                                                        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                        <div>
                                                            <p className="font-semibold text-foreground">{agency.name}</p>
                                                            {agency.unit_name && (
                                                                <p className="text-xs text-muted-foreground">{agency.unit_name}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-start gap-1.5 text-sm">
                                                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">{agency.city || '—'}</p>
                                                            {agency.address && (
                                                                <p className="line-clamp-1 text-xs text-muted-foreground">{agency.address}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-start gap-1.5 text-sm">
                                                        <UserCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">{agency.head_name || '—'}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {[agency.head_position, agency.head_nip ? `NIP ${agency.head_nip}` : null]
                                                                    .filter(Boolean)
                                                                    .join(' · ') || 'Belum dilengkapi'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link
                                                                href={skmRoute(
                                                                    'agencies.edit',
                                                                    { instansi: agency.id, agency: agency.id },
                                                                    `/instansi/${agency.id}/edit`,
                                                                )}
                                                            >
                                                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                                                Ubah
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => setDeleteTarget(agency)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            <span className="sr-only">Hapus {agency.name}</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {agencies.last_page > 1 && (
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-4 pb-4 sm:px-0 sm:pb-0">
                                    <p className="text-xs text-muted-foreground">
                                        Menampilkan {agencies.from ?? 0}–{agencies.to ?? 0} dari {agencies.total} instansi
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!agencies.prev_page_url}
                                            onClick={() => agencies.prev_page_url && router.visit(agencies.prev_page_url)}
                                        >
                                            Sebelumnya
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!agencies.next_page_url}
                                            onClick={() => agencies.next_page_url && router.visit(agencies.next_page_url)}
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
                        <DialogTitle>Hapus Data Instansi?</DialogTitle>
                        <DialogDescription>
                            Instansi <strong>{deleteTarget?.name}</strong> beserta periode survei di bawahnya akan dihapus permanen. Tindakan ini tidak
                            dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                            Batal
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Menghapus...' : 'Ya, Hapus Instansi'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
