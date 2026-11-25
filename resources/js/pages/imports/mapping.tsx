import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { PERMENPAN_9_ELEMENTS_REFERENCE, skmRoute } from '@/lib/skm-utils';
import { type BreadcrumbItem } from '@/types';
import { type Element, type Period, type SuggestedMapping } from '@/types/skm';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { FormEventHandler } from 'react';

interface ImportMappingProps {
    importId: number;
    headers: string[];
    previewRows: (string | number | null)[][];
    suggestedMapping: SuggestedMapping;
    elements?: Element[];
    period?: Period;
}

const NO_SERVICE_COLUMN = '__NO_SERVICE_COLUMN__';

export default function ImportMapping({
    importId,
    headers = [],
    previewRows = [],
    suggestedMapping,
    elements = [],
    period,
}: ImportMappingProps) {
    const activeElements = elements.length > 0 ? elements : PERMENPAN_9_ELEMENTS_REFERENCE.map((e, i) => ({ id: i + 1, ...e }));
    const validHeaders = headers.filter((h) => typeof h === 'string' && h.trim().length > 0);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Periode Survei', href: '/periode' },
        ...(period ? [{ title: period.label, href: `/periode/${period.id}` }] : []),
        { title: 'Pemetaan Kolom', href: '#' },
    ];

    const { data, setData, post, processing, errors, transform } = useForm<{
        mapping: {
            serviceType: string;
            U1: string;
            U2: string;
            U3: string;
            U4: string;
            U5: string;
            U6: string;
            U7: string;
            U8: string;
            U9: string;
        };
    }>({
        mapping: {
            serviceType: suggestedMapping?.serviceType || NO_SERVICE_COLUMN,
            U1: suggestedMapping?.U1 ?? '',
            U2: suggestedMapping?.U2 ?? '',
            U3: suggestedMapping?.U3 ?? '',
            U4: suggestedMapping?.U4 ?? '',
            U5: suggestedMapping?.U5 ?? '',
            U6: suggestedMapping?.U6 ?? '',
            U7: suggestedMapping?.U7 ?? '',
            U8: suggestedMapping?.U8 ?? '',
            U9: suggestedMapping?.U9 ?? '',
        },
    });

    const updateMapping = (key: keyof typeof data.mapping, value: string) => {
        setData('mapping', {
            ...data.mapping,
            [key]: value,
        });
    };

    const mappedCount = (['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9'] as const).filter(
        (code) => Boolean(data.mapping[code]),
    ).length;

    const getMappedRoleForHeader = (header: string): string | null => {
        if (data.mapping.serviceType === header) return 'Jenis Layanan';
        for (const el of activeElements) {
            const key = el.code as keyof typeof data.mapping;
            if (data.mapping[key] === header) {
                return el.code;
            }
        }
        return null;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((current) => ({
            mapping: {
                ...current.mapping,
                serviceType: current.mapping.serviceType === NO_SERVICE_COLUMN ? null : current.mapping.serviceType,
            },
        }));
        post(skmRoute('imports.confirm', { import: importId }, `/impor/${importId}/konfirmasi`));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pemetaan Kolom Impor SKM" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Pemetaan Kolom ke 9 Unsur SKM</h1>
                            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
                                <Sparkles className="mr-1 h-3.5 w-3.5" />
                                {mappedCount}/9 Unsur Terpetakan
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Langkah 2 dari 2: Cocokkan kolom berkas Anda dengan Jenis Layanan dan Unsur U1–U9 sebelum menyimpan &amp; menghitung IKM.
                        </p>
                    </div>

                    {period && (
                        <Button asChild variant="outline" size="sm">
                            <Link href={skmRoute('imports.create', { period: period.id }, `/periode/${period.id}/impor`)}>
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Unggah Ulang Berkas
                            </Link>
                        </Button>
                    )}
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Konfigurasi Pemetaan Kolom</CardTitle>
                            <CardDescription>
                                Seluruh unsur U1–U9 wajib dipetakan. Kolom Jenis Layanan bersifat opsional (jika kosong akan memakai layanan umum).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Pemetaan Jenis Layanan */}
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                <div className="grid items-center gap-3 sm:grid-cols-12">
                                    <div className="sm:col-span-5">
                                        <Label htmlFor="map-serviceType" className="text-sm font-semibold">
                                            Kolom Jenis Layanan
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Digunakan untuk mengelompokkan nilai IKM per jenis layanan instansi.
                                        </p>
                                    </div>
                                    <div className="sm:col-span-7">
                                        <Select
                                            value={data.mapping.serviceType}
                                            onValueChange={(val) => updateMapping('serviceType', val)}
                                        >
                                            <SelectTrigger id="map-serviceType" className="bg-background">
                                                <SelectValue placeholder="Pilih kolom jenis layanan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={NO_SERVICE_COLUMN}>— Tidak ada kolom (Layanan Umum) —</SelectItem>
                                                {validHeaders.map((h) => (
                                                    <SelectItem key={h} value={h}>
                                                        {h}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={(errors as Record<string, string | undefined>)['mapping.serviceType']} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Pemetaan 9 Unsur */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {activeElements.map((el) => {
                                    const code = el.code as keyof typeof data.mapping;
                                    const currentVal = data.mapping[code];
                                    const fieldErr = (errors as Record<string, string | undefined>)[`mapping.${code}`];
                                    const autoMatched = Boolean(suggestedMapping?.[code]) && suggestedMapping?.[code] === currentVal;

                                    return (
                                        <div key={code} className="rounded-lg border bg-card p-3.5">
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <Label htmlFor={`map-${code}`} className="text-sm font-semibold">
                                                    <span className="mr-1.5 text-primary">{code}</span>
                                                    {el.name}
                                                </Label>
                                                {autoMatched && (
                                                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 px-1.5 py-0 text-[10px] text-emerald-800">
                                                        Otomatis
                                                    </Badge>
                                                )}
                                            </div>
                                            <Select value={currentVal} onValueChange={(val) => updateMapping(code, val)}>
                                                <SelectTrigger id={`map-${code}`}>
                                                    <SelectValue placeholder={`Pilih kolom ${code}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {validHeaders.map((h) => (
                                                        <SelectItem key={h} value={h}>
                                                            {h}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={fieldErr} className="mt-1.5" />
                                        </div>
                                    );
                                })}
                            </div>

                            <InputError message={errors.mapping} />

                            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                                <p className="text-xs text-muted-foreground">
                                    Impor akan memvalidasi seluruh baris dan otomatis menghitung ulang skor IKM periode.
                                </p>
                                <Button type="submit" size="lg" disabled={processing || mappedCount < 9}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    {processing ? 'Memproses & Menghitung IKM...' : 'Konfirmasi Impor & Hitung IKM'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                {/* Pratinjau Baris */}
                <Card className="border-border/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Pratinjau Data Berkas ({previewRows.length} baris pertama)</CardTitle>
                        <CardDescription>Pastikan nilai kolom pada unsur U1–U9 berada dalam skala angka 1 sampai 4.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-12 text-center">#</TableHead>
                                        {headers.map((header, idx) => {
                                            const role = getMappedRoleForHeader(header);
                                            return (
                                                <TableHead key={`${header}-${idx}`} className="min-w-[130px]">
                                                    <div className="space-y-1 py-1">
                                                        <span className="block text-xs font-semibold text-foreground">
                                                            {header || `(Kolom ${idx + 1})`}
                                                        </span>
                                                        {role && (
                                                            <Badge className="bg-primary px-1.5 py-0 text-[10px] text-primary-foreground">
                                                                {role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewRows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={headers.length + 1} className="py-6 text-center text-sm text-muted-foreground">
                                                Tidak ada baris pratinjau untuk ditampilkan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        previewRows.map((row, rowIdx) => (
                                            <TableRow key={rowIdx}>
                                                <TableCell className="text-center text-xs text-muted-foreground tabular-nums">
                                                    {rowIdx + 1}
                                                </TableCell>
                                                {headers.map((_, colIdx) => (
                                                    <TableCell key={colIdx} className="text-xs whitespace-nowrap">
                                                        {row[colIdx] !== null && row[colIdx] !== undefined && row[colIdx] !== ''
                                                            ? String(row[colIdx])
                                                            : '—'}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
