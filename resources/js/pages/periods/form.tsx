import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatInt, skmRoute } from '@/lib/skm-utils';
import { type BreadcrumbItem } from '@/types';
import { type Agency, type Period, type PeriodStatus } from '@/types/skm';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Info, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface PeriodFormProps {
    period?: Period | null;
    agencies: Agency[];
}

function toDateInputValue(raw?: string | null): string {
    if (!raw) return '';
    return raw.slice(0, 10);
}

function calculateKrejcieMinimum(populationStr: string): number | null {
    const n = parseInt(populationStr, 10);
    if (Number.isNaN(n) || n <= 0) return null;
    const x2 = 3.841;
    const p = 0.5;
    const d = 0.05;
    return Math.ceil((x2 * n * p * (1 - p)) / (d * d * (n - 1) + x2 * p * (1 - p)));
}

export default function PeriodForm({ period = null, agencies = [] }: PeriodFormProps) {
    const isEdit = Boolean(period?.id);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Periode Survei', href: '/periode' },
        { title: isEdit ? 'Ubah Periode' : 'Buat Periode', href: '#' },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        agency_id: period?.agency_id ? String(period.agency_id) : agencies[0]?.id ? String(agencies[0].id) : '',
        label: period?.label ?? '',
        start_date: toDateInputValue(period?.start_date) || new Date().toISOString().slice(0, 10),
        end_date: toDateInputValue(period?.end_date) || new Date().toISOString().slice(0, 10),
        population: period?.population ? String(period.population) : '',
        status: (period?.status ?? 'active') as PeriodStatus,
    });

    const minSamplePreview = calculateKrejcieMinimum(data.population);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit && period) {
            put(skmRoute('periods.update', { periode: period.id, period: period.id }, `/periode/${period.id}`));
            return;
        }
        post(skmRoute('periods.store', undefined, '/periode'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Ubah Periode Survei' : 'Buat Periode Survei'} />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isEdit ? 'Ubah Periode Survei' : 'Buat Periode Survei Baru'}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Tentukan instansi penyelenggara, rentang tanggal survei, dan estimasi populasi penerima layanan.
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={skmRoute('periods.index', undefined, '/periode')}>
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                {agencies.length === 0 && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            Belum ada data instansi. Silakan{' '}
                            <Link href={skmRoute('agencies.create', undefined, '/instansi/create')} className="font-semibold underline">
                                tambahkan instansi
                            </Link>{' '}
                            terlebih dahulu sebelum membuat periode survei.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={submit}>
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Informasi Periode Survei</CardTitle>
                            <CardDescription>Periode berstatus Ditutup tidak dapat menerima impor berkas baru.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="agency_id">
                                    Instansi Penyelenggara <span className="text-destructive">*</span>
                                </Label>
                                <Select value={data.agency_id} onValueChange={(value) => setData('agency_id', value)}>
                                    <SelectTrigger id="agency_id">
                                        <SelectValue placeholder="Pilih instansi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {agencies.map((agency) => (
                                            <SelectItem key={agency.id} value={String(agency.id)}>
                                                {agency.name}
                                                {agency.unit_name ? ` — ${agency.unit_name}` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.agency_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="label">
                                    Nama / Label Periode <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="label"
                                    value={data.label}
                                    onChange={(e) => setData('label', e.target.value)}
                                    placeholder="Contoh: Semester II Tahun 2026"
                                    required
                                />
                                <InputError message={errors.label} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">
                                        Tanggal Mulai <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.start_date} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="end_date">
                                        Tanggal Selesai <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.end_date} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="population">Populasi Penerima Layanan (Opsional)</Label>
                                    <Input
                                        id="population"
                                        type="number"
                                        min={1}
                                        value={data.population}
                                        onChange={(e) => setData('population', e.target.value)}
                                        placeholder="Contoh: 1200"
                                    />
                                    <InputError message={errors.population} />
                                    {minSamplePreview !== null && (
                                        <p className="flex items-center gap-1.5 text-xs text-primary">
                                            <Info className="h-3.5 w-3.5 shrink-0" />
                                            Target sampel minimum Krejcie-Morgan: <strong>{formatInt(minSamplePreview)} responden</strong>
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status Periode</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value as PeriodStatus)}>
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draf</SelectItem>
                                            <SelectItem value="active">Aktif (Menerima Impor)</SelectItem>
                                            <SelectItem value="closed">Ditutup (Arsip)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t pt-4">
                                <Button asChild type="button" variant="outline">
                                    <Link href={skmRoute('periods.index', undefined, '/periode')}>Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing || agencies.length === 0}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Periode'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
