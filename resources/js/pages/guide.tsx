import { GradeBadge } from '@/components/skm/grade-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import PublicLayout from '@/layouts/public-layout';
import { GRADE_META, PERMENPAN_9_ELEMENTS_REFERENCE, skmRoute } from '@/lib/skm-utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { type Element, type Grade, type GradeInterval } from '@/types/skm';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpenCheck, Calculator, FileSpreadsheet } from 'lucide-react';

interface GuideProps {
    elements?: Element[];
    gradeIntervals?: GradeInterval[];
}

const DEFAULT_GRADE_META: Record<Grade, { interval: string; perception: string; performance: string; description: string }> = {
    A: {
        interval: '88,31 – 100,00',
        perception: '3,5324 – 4,00',
        performance: 'Sangat Baik',
        description: 'Kinerja unit pelayanan sangat baik dan memenuhi standar kepuasan tertinggi.',
    },
    B: {
        interval: '76,61 – 88,30',
        perception: '3,0644 – 3,5320',
        performance: 'Baik',
        description: 'Kinerja unit pelayanan baik, tetap lakukan pembenahan pada unsur peringkat terbawah.',
    },
    C: {
        interval: '65,00 – 76,60',
        perception: '2,60 – 3,0640',
        performance: 'Kurang Baik',
        description: 'Pelayanan dinilai kurang baik; diperlukan evaluasi prosedur, waktu, dan sarana.',
    },
    D: {
        interval: '25,00 – 64,99',
        perception: '1,00 – 2,5996',
        performance: 'Tidak Baik',
        description: 'Kinerja tidak baik dan membutuhkan rencana tindak perbaikan menyeluruh.',
    },
};

const DEFAULT_GRADE_INTERVALS: GradeInterval[] = (['A', 'B', 'C', 'D'] as Grade[]).map((g) => ({
    grade: g,
    label: DEFAULT_GRADE_META[g].performance,
    range: DEFAULT_GRADE_META[g].interval,
    performance: DEFAULT_GRADE_META[g].performance,
    interval: DEFAULT_GRADE_META[g].interval,
    perception: DEFAULT_GRADE_META[g].perception,
    description: DEFAULT_GRADE_META[g].description,
}));

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Panduan SKM', href: '/panduan' },
];

export default function Guide({ elements = [], gradeIntervals = [] }: GuideProps) {
    const { auth } = usePage<SharedData>().props;
    const activeElements = elements.length > 0 ? elements : PERMENPAN_9_ELEMENTS_REFERENCE.map((e, i) => ({ id: i + 1, ...e }));
    const intervals = gradeIntervals.length > 0 ? gradeIntervals : DEFAULT_GRADE_INTERVALS;

    const content = (
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                    <Badge variant="outline" className="mb-2 border-primary/30 bg-primary/5 text-primary">
                        <BookOpenCheck className="mr-1.5 h-3.5 w-3.5" />
                        Referensi Resmi Permenpan-RB 14/2017
                    </Badge>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Panduan Metodologi &amp; 9 Unsur SKM</h1>
                    <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
                        Ringkasan interval mutu pelayanan, daftar 9 unsur kuesioner, rumus perhitungan nilai IKM, serta format berkas impor responden.
                    </p>
                </div>

                <Button asChild>
                    <Link href={skmRoute('calculator', undefined, '/kalkulator')}>
                        <Calculator className="mr-2 h-4 w-4" />
                        Buka Kalkulator IKM
                    </Link>
                </Button>
            </div>

            {/* Tabel Interval Mutu A-D */}
            <Card className="border-border/80 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Tabel Interval Nilai Persepsi, Konversi, dan Mutu Pelayanan</CardTitle>
                    <CardDescription>Klasifikasi resmi Lampiran Permenpan-RB Nomor 14 Tahun 2017.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 sm:pt-0">
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-44">Mutu Pelayanan</TableHead>
                                    <TableHead>Nilai Interval Konversi (25–100)</TableHead>
                                    <TableHead>Nilai Interval Persepsi (1–4)</TableHead>
                                    <TableHead>Kinerja Unit Pelayanan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {intervals.map((row) => {
                                    const fallback = DEFAULT_GRADE_META[row.grade] ?? GRADE_META[row.grade];
                                    const performanceLabel = row.performance ?? row.label ?? fallback.performance;
                                    const intervalText =
                                        row.interval ??
                                        row.range ??
                                        (typeof row.min === 'number' && typeof row.max === 'number'
                                            ? `${row.min.toFixed(2).replace('.', ',')} – ${row.max.toFixed(2).replace('.', ',')}`
                                            : DEFAULT_GRADE_META[row.grade].interval);
                                    const perceptionText = row.perception ?? DEFAULT_GRADE_META[row.grade].perception;

                                    return (
                                        <TableRow key={row.grade}>
                                            <TableCell>
                                                <GradeBadge grade={row.grade} performance={performanceLabel} />
                                            </TableCell>
                                            <TableCell className="font-semibold tabular-nums">{intervalText}</TableCell>
                                            <TableCell className="text-muted-foreground tabular-nums">{perceptionText}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {row.description ?? DEFAULT_GRADE_META[row.grade].description}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Daftar 9 Unsur Pelayanan */}
            <Card className="border-border/80 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Daftar 9 Unsur Pelayanan Publik (U1–U9)</CardTitle>
                    <CardDescription>Setiap unsur dinilai responden menggunakan skala Likert 1 hingga 4.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 sm:pt-0">
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-20">Kode</TableHead>
                                    <TableHead className="min-w-[220px]">Nama Unsur</TableHead>
                                    <TableHead className="min-w-[320px]">Contoh Pertanyaan Kuesioner</TableHead>
                                    <TableHead className="w-28 text-right">Bobot</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activeElements.map((el) => (
                                    <TableRow key={el.code}>
                                        <TableCell className="font-bold text-primary">{el.code}</TableCell>
                                        <TableCell className="font-semibold">{el.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{el.question}</TableCell>
                                        <TableCell className="text-right font-mono text-xs tabular-nums">1/9 (0,1111)</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Rumus & Ketentuan Impor */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Rumus Perhitungan IKM &amp; Sampel</CardTitle>
                        <CardDescription>Persamaan matematis yang dijalankan di modul domain aplikasi.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="rounded-lg border bg-muted/35 p-3.5 font-mono text-xs leading-relaxed">
                            <p>NRR Unsur = Jumlah Skor Unsur ÷ Jumlah Responden</p>
                            <p className="mt-1">NRR Tertimbang = NRR Unsur × (1 ÷ 9)</p>
                            <p className="mt-1">IKM Unit Pelayanan = Σ(NRR Tertimbang U1..U9) × 25</p>
                        </div>
                        <p className="text-muted-foreground">
                            Penentuan jumlah responden minimum menggunakan rumus <strong>Krejcie &amp; Morgan (1970)</strong> dengan tingkat
                            kepercayaan 95% (X² = 3,841), proporsi 0,5, dan galat 5%. Contoh: populasi 1.200 penerima layanan membutuhkan minimal{' '}
                            <strong className="text-foreground">292 responden</strong>.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <FileSpreadsheet className="h-4 w-4 text-primary" />
                            Ketentuan Berkas Impor CSV / Excel
                        </CardTitle>
                        <CardDescription>Format yang diterima saat mengunggah data kuesioner.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <ul className="list-disc space-y-1.5 pl-5">
                            <li>
                                Ekstensi didukung: <code className="rounded bg-muted px-1 py-0.5 text-xs">.csv</code>,{' '}
                                <code className="rounded bg-muted px-1 py-0.5 text-xs">.xlsx</code>, atau{' '}
                                <code className="rounded bg-muted px-1 py-0.5 text-xs">.xls</code> (maksimal 10 MB).
                            </li>
                            <li>Baris pertama berisi judul kolom (misalnya Jenis_Layanan, U1..U9 atau nama unsur).</li>
                            <li>Skor setiap unsur harus bernilai bulat 1 sampai 4; baris tidak valid akan dicatat di log galat tanpa merusak hitungan.</li>
                            <li>Data responden disimpan secara anonim tanpa kolom nama, NIK, atau kontak pribadi.</li>
                        </ul>
                        <div className="pt-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={auth?.user ? skmRoute('periods.index', undefined, '/periode') : skmRoute('login', undefined, '/login')}>
                                    {auth?.user ? 'Kelola Periode & Impor Data' : 'Masuk untuk Mengimpor Data'}
                                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    if (auth?.user) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Panduan SKM" />
                {content}
            </AppLayout>
        );
    }

    return (
        <PublicLayout>
            <Head title="Panduan SKM" />
            {content}
        </PublicLayout>
    );
}
