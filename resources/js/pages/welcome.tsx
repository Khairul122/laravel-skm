import { GradeBadge } from '@/components/skm/grade-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { GRADE_META, PERMENPAN_9_ELEMENTS_REFERENCE, skmRoute } from '@/lib/skm-utils';
import { type SharedData } from '@/types';
import { type Grade } from '@/types/skm';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpenCheck, Calculator, CheckCircle2, FileSpreadsheet, FileText, Lock, ShieldCheck } from 'lucide-react';

const WORKFLOW_STEPS = [
    {
        step: '01',
        title: 'Unggah Data Survei',
        description:
            'Unggah berkas responden berformat CSV atau Excel (.xlsx/.xls) hingga 10 MB. Sistem otomatis mendeteksi pemisah koma, titik koma, maupun tab.',
        image: '/images/skm/step-unggah.png',
        alt: 'Ilustrasi unggah berkas CSV atau Excel survei kepuasan masyarakat',
    },
    {
        step: '02',
        title: 'Petakan 9 Unsur',
        description:
            'Kolom berkas dipadankan otomatis ke Jenis Layanan dan 9 Unsur Pelayanan (U1–U9). Periksa pratinjau baris sebelum perhitungan disimpan.',
        image: '/images/skm/step-petakan.png',
        alt: 'Ilustrasi pemetaan kolom survei ke 9 unsur pelayanan publik',
    },
    {
        step: '03',
        title: 'Unduh Laporan Resmi',
        description:
            'Dapatkan skor IKM, predikat mutu A–D, grafik unsur, kecukupan sampel Krejcie-Morgan, serta ekspor dokumen Word (.docx) dan Markdown.',
        image: '/images/skm/step-unduh.png',
        alt: 'Ilustrasi laporan resmi SKM siap unduh dalam format Word dan Markdown',
    },
];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <PublicLayout>
            <Head title="Beranda — Survei Kepuasan Masyarakat" />

            {/* Hero Section */}
            <section className="relative overflow-hidden border-b bg-gradient-to-b from-[#F4F7FB] via-background to-background dark:from-[#0C192C] dark:via-background dark:to-background">
                <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-16">
                    <div className="space-y-6 lg:col-span-6">
                        <Badge
                            variant="outline"
                            className="border-[#C9962B]/40 bg-[#C9962B]/10 px-3 py-1 text-xs font-semibold text-[#8A6112] dark:text-[#E5B95C]"
                        >
                            Standar Permenpan-RB Nomor 14 Tahun 2017
                        </Badge>

                        <h1 className="text-3xl font-bold tracking-tight text-[#0F2744] sm:text-4xl lg:text-5xl dark:text-white">
                            Pengolahan Survei Kepuasan Masyarakat yang{' '}
                            <span className="text-[#1E4E8C] dark:text-blue-400">Terstruktur &amp; Akuntabel</span>
                        </h1>

                        <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                            Hitung Indeks Kepuasan Masyarakat (IKM) 9 unsur pelayanan publik, analisis per jenis layanan, uji kecukupan sampel, hingga
                            cetak laporan Word (.docx) siap tanda tangan kepala instansi dalam hitungan menit.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <Button asChild size="lg" className="bg-[#0F2744] text-white hover:bg-[#173A63] dark:bg-blue-600 dark:hover:bg-blue-500">
                                <Link href={skmRoute('calculator', undefined, '/kalkulator')}>
                                    <Calculator className="mr-2 h-4 w-4" />
                                    Coba Kalkulator Cepat
                                </Link>
                            </Button>

                            {auth?.user ? (
                                <Button asChild size="lg" variant="outline">
                                    <Link href={skmRoute('dashboard', undefined, '/dashboard')}>
                                        Masuk ke Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild size="lg" variant="outline">
                                    <Link href={skmRoute('login', undefined, '/login')}>
                                        Masuk Panel Instansi
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            )}

                            <Button asChild size="lg" variant="ghost">
                                <Link href={skmRoute('guide', undefined, '/panduan')}>
                                    <BookOpenCheck className="mr-2 h-4 w-4" />
                                    Panduan Regulasi
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t pt-6 text-xs sm:text-sm">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                <div>
                                    <p className="font-semibold text-foreground">9 Unsur Baku</p>
                                    <p className="text-xs text-muted-foreground">Bobot penimbang 1/9</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-[#1E4E8C]" />
                                <div>
                                    <p className="font-semibold text-foreground">CSV &amp; Excel</p>
                                    <p className="text-xs text-muted-foreground">Deteksi kolom otomatis</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#C9962B]" />
                                <div>
                                    <p className="font-semibold text-foreground">Ekspor Word</p>
                                    <p className="text-xs text-muted-foreground">BAB I–IV siap cetak</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-6">
                        <div className="relative rounded-2xl border border-border/80 bg-card p-3 shadow-lg">
                            <img
                                src="/images/skm/hero-pelayanan.png"
                                alt="Ilustrasi pelayanan publik instansi pemerintah yang ramah dan modern"
                                className="aspect-[4/3] w-full rounded-xl object-cover"
                            />
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#0F2744] px-4 py-3 text-xs text-white">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-[#E5B95C]" />
                                    <span className="font-medium">Data responden anonim — tanpa NIK, nama, atau kontak pribadi</span>
                                </div>
                                <span className="rounded bg-white/10 px-2 py-0.5 font-semibold text-[#E5B95C]">Skala 25–100</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Alur 3 Langkah */}
            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-xs font-semibold tracking-wider text-[#1E4E8C] uppercase dark:text-blue-400">Alur Kerja Ringkas</p>
                    <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Tiga Langkah dari Data Mentah ke Laporan Dinas
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                        Dirancang untuk operator unit pelayanan publik agar tidak lagi menghitung manual di spreadsheet.
                    </p>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {WORKFLOW_STEPS.map((item) => (
                        <Card key={item.step} className="overflow-hidden border-border/80 transition-shadow hover:shadow-md">
                            <div className="bg-muted/40 p-4">
                                <img
                                    src={item.image}
                                    alt={item.alt}
                                    className="aspect-[4/3] w-full rounded-lg object-cover mix-blend-multiply dark:mix-blend-normal"
                                />
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#0F2744] text-xs font-bold text-[#E5B95C]">
                                        {item.step}
                                    </span>
                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* 9 Unsur Pelayanan */}
            <section className="border-y bg-muted/35">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold tracking-wider text-[#1E4E8C] uppercase dark:text-blue-400">
                                Ruang Lingkup Pengukuran
                            </p>
                            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                9 Unsur Survei Kepuasan Masyarakat
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Setiap unsur memiliki bobot tertimbang yang sama (1/9 ≈ 0,1111) untuk menghasilkan nilai IKM unit pelayanan.
                            </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href={skmRoute('guide', undefined, '/panduan')}>Lihat Rumus &amp; Kuesioner Lengkap</Link>
                        </Button>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {PERMENPAN_9_ELEMENTS_REFERENCE.map((el) => (
                            <Card key={el.code} className="border-border/80 bg-card">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2.5">
                                        <span className="rounded-md bg-[#0F2744]/10 px-2.5 py-1 text-xs font-bold text-[#0F2744] dark:bg-blue-950 dark:text-blue-300">
                                            {el.code}
                                        </span>
                                        <CardTitle className="text-base">{el.name}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-xs leading-relaxed">{el.question}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interval Mutu & CTA */}
            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                    <div className="space-y-4 lg:col-span-7">
                        <h2 className="text-2xl font-bold tracking-tight">Klasifikasi Mutu Pelayanan (A–D)</h2>
                        <p className="text-sm text-muted-foreground">
                            Nilai konversi IKM diklasifikasikan ke dalam empat kategori mutu pelayanan sesuai Lampiran Permenpan-RB Nomor 14 Tahun
                            2017.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {(['A', 'B', 'C', 'D'] as Grade[]).map((g) => {
                                const meta = GRADE_META[g];
                                return (
                                    <div key={g} className="flex items-center justify-between rounded-lg border bg-card p-3.5">
                                        <GradeBadge grade={g} performance={meta.performance} />
                                        <span className="text-sm font-semibold text-foreground tabular-nums">{meta.interval}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Card className="border-[#0F2744]/20 bg-[#0F2744] text-white lg:col-span-5">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#E5B95C] uppercase">
                                <Lock className="h-3.5 w-3.5" />
                                Siap Digunakan Instansi
                            </div>
                            <CardTitle className="text-xl text-white">Mulai Hitung IKM Periode Anda</CardTitle>
                            <CardDescription className="text-slate-300">
                                Gunakan kalkulator cepat untuk simulasi 9 unsur tanpa login, atau masuk sebagai operator untuk mengelola data survei
                                per periode.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Button asChild className="bg-[#C9962B] text-[#0F2744] hover:bg-[#D8A842]">
                                <Link href={skmRoute('calculator', undefined, '/kalkulator')}>Buka Kalkulator</Link>
                            </Button>
                            <Button asChild variant="secondary">
                                <Link href={auth?.user ? skmRoute('dashboard', undefined, '/dashboard') : skmRoute('login', undefined, '/login')}>
                                    {auth?.user ? 'Ke Dashboard' : 'Masuk Operator'}
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </PublicLayout>
    );
}
