import InputError from '@/components/input-error';
import { PeriodStatusBadge } from '@/components/skm/grade-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { skmRoute } from '@/lib/skm-utils';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { type Period } from '@/types/skm';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, FileSpreadsheet, Lock, ShieldCheck, UploadCloud, X } from 'lucide-react';
import { DragEvent, FormEventHandler, useRef, useState } from 'react';

interface ImportCreateProps {
    period: Period;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImportCreate({ period }: ImportCreateProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Periode Survei', href: '/periode' },
        { title: period.label, href: `/periode/${period.id}` },
        { title: 'Impor Data', href: '#' },
    ];

    const { data, setData, post, processing, progress, errors } = useForm<{ file: File | null }>({
        file: null,
    });

    const isClosed = period.status === 'closed';

    const handleFileSelect = (file: File | null) => {
        if (!file || isClosed) return;
        setData('file', file);
    };

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (isClosed) return;
        const dropped = e.dataTransfer.files?.[0] ?? null;
        handleFileSelect(dropped);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!data.file || isClosed) return;
        post(skmRoute('imports.preview', { period: period.id }, `/periode/${period.id}/impor`), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Impor Data Survei — ${period.label}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight">Unggah Berkas Responden</h1>
                            <PeriodStatusBadge status={period.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Periode: <strong className="text-foreground">{period.label}</strong>
                            {period.agency?.name ? ` · ${period.agency.name}` : ''}
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={skmRoute('periods.show', { periode: period.id, period: period.id }, `/periode/${period.id}`)}>
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Kembali ke Detail Periode
                        </Link>
                    </Button>
                </div>

                {isClosed && (
                    <Alert variant="destructive">
                        <Lock className="h-4 w-4" />
                        <AlertTitle>Periode Sudah Ditutup</AlertTitle>
                        <AlertDescription>
                            Periode berstatus <strong>Ditutup</strong> tidak dapat menerima impor data responden baru. Ubah status periode menjadi Aktif
                            jika masih ingin menambahkan data.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-12">
                    <form onSubmit={submit} className="lg:col-span-7">
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Pilih Berkas CSV atau Excel</CardTitle>
                                <CardDescription>
                                    Langkah 1 dari 2: Unggah berkas untuk membaca header kolom dan membuat pratinjau pemetaan unsur.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        if (!isClosed) setDragOver(true);
                                    }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={onDrop}
                                    onClick={() => !isClosed && fileInputRef.current?.click()}
                                    role="button"
                                    tabIndex={isClosed ? -1 : 0}
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter' || e.key === ' ') && !isClosed) {
                                            e.preventDefault();
                                            fileInputRef.current?.click();
                                        }
                                    }}
                                    aria-label="Area seret dan lepas berkas CSV atau Excel"
                                    className={cn(
                                        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
                                        dragOver
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/60 hover:bg-muted/35',
                                        isClosed && 'cursor-not-allowed opacity-60',
                                    )}
                                >
                                    <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                                        <UploadCloud className="h-7 w-7" />
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Seret dan lepas berkas di sini, atau klik untuk memilih
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Format yang didukung: <strong>.csv</strong>, <strong>.xlsx</strong>, <strong>.xls</strong> (maksimal 10 MB)
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        className="hidden"
                                        disabled={isClosed}
                                        onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                                    />
                                </div>

                                {data.file && (
                                    <div className="flex items-center justify-between gap-3 rounded-lg border bg-emerald-50/60 p-3.5 dark:bg-emerald-950/30">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <FileSpreadsheet className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-foreground">{data.file.name}</p>
                                                <p className="text-xs text-muted-foreground tabular-nums">{formatBytes(data.file.size)}</p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Hapus pilihan berkas"
                                            onClick={() => {
                                                setData('file', null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {progress && (
                                    <p className="text-xs text-muted-foreground tabular-nums">Mengunggah berkas: {progress.percentage}%</p>
                                )}

                                <InputError message={errors.file} />

                                <Button type="submit" className="w-full" size="lg" disabled={!data.file || processing || isClosed}>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    {processing ? 'Membaca Berkas & Mendeteksi Kolom...' : 'Lanjut ke Pemetaan Kolom'}
                                </Button>
                            </CardContent>
                        </Card>
                    </form>

                    <div className="space-y-4 lg:col-span-5">
                        <Card className="border-border/80 shadow-sm">
                            <CardContent className="space-y-4 pt-6">
                                <img
                                    src="/images/skm/step-unggah.png"
                                    alt="Ilustrasi unggah dokumen survei"
                                    className="aspect-[4/3] w-full rounded-lg object-cover mix-blend-multiply dark:mix-blend-normal"
                                />
                                <div className="space-y-2 text-xs text-muted-foreground">
                                    <p className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                        <span>Pemisah CSV koma (,), titik koma (;), dan tab terdeteksi otomatis.</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                        <span>Baris dengan skor di luar rentang 1–4 atau kosong akan dilewati &amp; dicatat di log galat.</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <span>Privasi terjaga: kolom nama atau identitas responden tidak disimpan ke database.</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
