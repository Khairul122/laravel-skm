import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { skmRoute } from '@/lib/skm-utils';
import { type BreadcrumbItem } from '@/types';
import { type Agency } from '@/types/skm';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface AgencyFormProps {
    agency?: Agency | null;
}

export default function AgencyForm({ agency = null }: AgencyFormProps) {
    const isEdit = Boolean(agency?.id);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Instansi', href: '/instansi' },
        { title: isEdit ? 'Ubah Instansi' : 'Tambah Instansi', href: '#' },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        name: agency?.name ?? '',
        unit_name: agency?.unit_name ?? '',
        address: agency?.address ?? '',
        city: agency?.city ?? '',
        head_name: agency?.head_name ?? '',
        head_nip: agency?.head_nip ?? '',
        head_position: agency?.head_position ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit && agency) {
            put(skmRoute('agencies.update', { instansi: agency.id, agency: agency.id }, `/instansi/${agency.id}`));
            return;
        }
        post(skmRoute('agencies.store', undefined, '/instansi'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Ubah Instansi' : 'Tambah Instansi'} />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Ubah Data Instansi' : 'Tambah Instansi Baru'}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Lengkapi profil unit pelayanan publik dan pejabat penandatangan untuk lembar pengesahan laporan SKM.
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={skmRoute('agencies.index', undefined, '/instansi')}>
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit}>
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Identitas Unit Pelayanan</CardTitle>
                            <CardDescription>Kolom bertanda bintang (*) wajib diisi.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    Nama Instansi <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Dinas Kependudukan dan Pencatatan Sipil"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="unit_name">Nama Unit Pelayanan</Label>
                                    <Input
                                        id="unit_name"
                                        value={data.unit_name}
                                        onChange={(e) => setData('unit_name', e.target.value)}
                                        placeholder="Contoh: Unit Layanan Administrasi Kependudukan"
                                    />
                                    <InputError message={errors.unit_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="city">Kota / Kabupaten</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Contoh: Kota Bandung"
                                    />
                                    <InputError message={errors.city} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <Textarea
                                    id="address"
                                    rows={2}
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Jl. Merdeka No. 10, Kec. Sumur Bandung"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="border-t pt-5">
                                <h2 className="text-sm font-semibold text-foreground">Pejabat Penandatangan Laporan (Lembar Pengesahan)</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Dicetak pada bagian pengesahan dokumen laporan Word (.docx).
                                </p>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="head_name">Nama Kepala Instansi</Label>
                                        <Input
                                            id="head_name"
                                            value={data.head_name}
                                            onChange={(e) => setData('head_name', e.target.value)}
                                            placeholder="Contoh: Drs. Ahmad Suryana, M.Si."
                                        />
                                        <InputError message={errors.head_name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="head_position">Jabatan</Label>
                                        <Input
                                            id="head_position"
                                            value={data.head_position}
                                            onChange={(e) => setData('head_position', e.target.value)}
                                            placeholder="Contoh: Kepala Dinas"
                                        />
                                        <InputError message={errors.head_position} />
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-2 sm:max-w-sm">
                                    <Label htmlFor="head_nip">NIP Kepala Instansi</Label>
                                    <Input
                                        id="head_nip"
                                        value={data.head_nip}
                                        onChange={(e) => setData('head_nip', e.target.value)}
                                        placeholder="Contoh: 197001011995031001"
                                    />
                                    <InputError message={errors.head_nip} />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t pt-4">
                                <Button asChild type="button" variant="outline">
                                    <Link href={skmRoute('agencies.index', undefined, '/instansi')}>Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Instansi'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
