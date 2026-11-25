import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/public-layout';
import {
    type ElementRatingScore,
    formatDateId,
    formatInt,
    getElementScaleLabel,
    PERMENPAN_9_ELEMENTS_REFERENCE,
    skmRoute,
} from '@/lib/skm-utils';
import { cn } from '@/lib/utils';
import { type QuestionnairePageProps } from '@/types/skm';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    CalendarRange,
    CheckCircle2,
    ClipboardCheck,
    Lock,
    RotateCcw,
    Send,
    ShieldCheck,
} from 'lucide-react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';

type RatingCode = 'U1' | 'U2' | 'U3' | 'U4' | 'U5' | 'U6' | 'U7' | 'U8' | 'U9';

const ELEMENT_CODES: RatingCode[] = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9'];
const SCORE_OPTIONS: ElementRatingScore[] = [1, 2, 3, 4];

const AGE_RANGE_OPTIONS = ['< 20 Tahun', '20 - 30 Tahun', '31 - 40 Tahun', '41 - 50 Tahun', '> 50 Tahun'];
const EDUCATION_OPTIONS = ['SD / Sederajat', 'SMP / Sederajat', 'SMA / SMK', 'D1 / D2 / D3', 'S1 / D4', 'S2 / S3'];
const OCCUPATION_OPTIONS = ['PNS / ASN', 'TNI / Polri', 'Pegawai Swasta', 'Wiraswasta', 'Pelajar / Mahasiswa', 'Lainnya'];

type QuestionnaireFormData = {
    survey_period_id: number | '';
    service_type_id: number | '';
    gender: '' | 'L' | 'P';
    age_range: string;
    education: string;
    occupation: string;
    answers: Record<RatingCode, number | null>;
    suggestion: string;
};

function emptyAnswers(): Record<RatingCode, number | null> {
    return {
        U1: null,
        U2: null,
        U3: null,
        U4: null,
        U5: null,
        U6: null,
        U7: null,
        U8: null,
        U9: null,
    };
}

export default function Questionnaire({
    periods = [],
    elements = [],
    selectedPeriodId = null,
    selectedServiceTypeId = null,
    submittedSummary = null,
}: QuestionnairePageProps) {
    const activeElements = useMemo(
        () =>
            elements.length > 0
                ? elements
                : PERMENPAN_9_ELEMENTS_REFERENCE.map((item, idx) => ({
                      id: idx + 1,
                      code: item.code,
                      name: item.name,
                      question: item.question,
                  })),
        [elements],
    );

    const initialPeriod = periods.find((p) => p.id === selectedPeriodId) ?? periods[0] ?? null;

    const { data, setData, post, processing, errors, clearErrors } = useForm<QuestionnaireFormData>({
        survey_period_id: initialPeriod?.id ?? '',
        service_type_id: selectedServiceTypeId ?? '',
        gender: '',
        age_range: '',
        education: '',
        occupation: '',
        answers: emptyAnswers(),
        suggestion: '',
    });

    const [clientWarning, setClientWarning] = useState<string | null>(null);
    const [hideReceipt, setHideReceipt] = useState(false);

    useEffect(() => {
        if (submittedSummary) {
            setHideReceipt(false);
        }
    }, [submittedSummary]);

    const currentPeriod = useMemo(
        () => periods.find((p) => p.id === Number(data.survey_period_id)) ?? initialPeriod,
        [periods, data.survey_period_id, initialPeriod],
    );

    const availableServices = currentPeriod?.service_types ?? [];

    const answeredCount = useMemo(
        () => ELEMENT_CODES.filter((code) => data.answers[code] !== null && data.answers[code] !== undefined).length,
        [data.answers],
    );

    const progressPercent = Math.round((answeredCount / 9) * 100);

    const handlePeriodChange = (periodIdStr: string) => {
        const nextId = Number(periodIdStr);
        const nextPeriod = periods.find((p) => p.id === nextId);
        const stillValidService = nextPeriod?.service_types?.some((s) => s.id === Number(data.service_type_id));
        setData((prev) => ({
            ...prev,
            survey_period_id: nextId,
            service_type_id: stillValidService ? prev.service_type_id : '',
        }));
        clearErrors('survey_period_id', 'service_type_id');
    };

    const setElementScore = (code: RatingCode, score: ElementRatingScore) => {
        setClientWarning(null);
        clearErrors(`answers.${code}` as keyof QuestionnaireFormData);
        setData('answers', {
            ...data.answers,
            [code]: score,
        });
    };

    const resetForm = () => {
        setClientWarning(null);
        clearErrors();
        setData({
            survey_period_id: currentPeriod?.id ?? '',
            service_type_id: '',
            gender: '',
            age_range: '',
            education: '',
            occupation: '',
            answers: emptyAnswers(),
            suggestion: '',
        });
    };

    const handleFillAnother = () => {
        setHideReceipt(true);
        resetForm();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setClientWarning(null);

        if (!data.survey_period_id) {
            setClientWarning('Silakan pilih periode survei yang aktif terlebih dahulu.');
            return;
        }
        if (!data.service_type_id) {
            setClientWarning('Silakan pilih jenis layanan yang Anda terima pada Bagian 1.');
            document.getElementById('bagian-layanan')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const missingCode = ELEMENT_CODES.find((code) => !data.answers[code]);
        if (missingCode) {
            setClientWarning(`Mohon lengkapi penilaian untuk seluruh 9 unsur pelayanan (belum terisi: ${missingCode}).`);
            document.getElementById(`unsur-${missingCode}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        post(skmRoute('questionnaire.store', undefined, '/kuesioner'), {
            preserveScroll: true,
            onSuccess: () => {
                resetForm();
            },
        });
    };

    const activeAgency = currentPeriod?.agency ?? null;
    const showReceipt = Boolean(submittedSummary && !hideReceipt);

    return (
        <PublicLayout
            agencyName={activeAgency?.name}
            unitName={activeAgency?.unit_name}
            agencyAddress={activeAgency?.address}
            agencyCity={activeAgency?.city}
        >
            <Head title="Kuesioner Survei Kepuasan Masyarakat" />

            <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <div className="space-y-4">
                    <Link
                        href={skmRoute('home', undefined, '/')}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded text-xs font-medium text-[#3E514A] hover:text-[#14221E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C3A] dark:text-[#C5D4CE] dark:hover:text-white"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        Kembali ke Beranda Portal
                    </Link>

                    <Card className="overflow-hidden border-[#D6D1C4] bg-white dark:border-[#243B33] dark:bg-[#142620]">
                        <div className="h-1.5 w-full bg-[#0F4C3A]" />
                        <CardHeader className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E6F0EC] px-2.5 py-1 text-xs font-semibold text-[#0F4C3A] dark:bg-[#1B3A30] dark:text-[#A7F3D0]">
                                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                    Formulir Resmi Permenpan-RB No. 14 Tahun 2017
                                </span>
                                {currentPeriod && (
                                    <span className="text-xs font-medium text-[#3E514A] dark:text-[#C5D4CE]">
                                        Periode: {currentPeriod.label}
                                    </span>
                                )}
                            </div>
                            <div>
                                <CardTitle className="text-2xl text-[#14221E] sm:text-3xl dark:text-white">
                                    Kuesioner Survei Kepuasan Masyarakat (SKM)
                                </CardTitle>
                                <CardDescription className="mt-1.5 text-sm leading-relaxed text-[#3E514A] dark:text-[#C5D4CE]">
                                    Berikan penilaian Anda secara objektif terhadap kualitas pelayanan yang baru saja Anda terima. Masukan Anda
                                    menjadi dasar perbaikan mutu unit pelayanan publik.
                                </CardDescription>
                            </div>

                            <div className="flex items-start gap-2.5 rounded-lg border border-[#0F4C3A]/25 bg-[#E6F0EC]/70 px-3.5 py-2.5 text-xs text-[#14221E] dark:border-[#2C5A4B] dark:bg-[#163027] dark:text-[#E2ECE8]">
                                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#0F4C3A] dark:text-[#A7F3D0]" aria-hidden="true" />
                                <span>
                                    <strong>Kerahasiaan Terjamin:</strong> Formulir ini bersifat <strong>anonim</strong> dan tidak meminta nama
                                    lengkap, NIK, nomor telepon, maupun alamat surel Anda.
                                </span>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {showReceipt && submittedSummary && (
                    <Card className="border-[#0F4C3A] bg-[#E6F0EC]/60 dark:border-[#2C5A4B] dark:bg-[#142D24]">
                        <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#0F4C3A] dark:text-[#A7F3D0]" aria-hidden="true" />
                                <div className="space-y-1">
                                    <CardTitle className="text-lg text-[#14221E] dark:text-white">
                                        Terima Kasih, Jawaban Kuesioner Anda Telah Tercatat
                                    </CardTitle>
                                    <CardDescription className="text-[#3E514A] dark:text-[#C5D4CE]">
                                        Penilaian Anda telah masuk ke dalam rekapitulasi periode survei yang berjalan.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 rounded-lg border border-[#D6D1C4] bg-white p-4 text-xs sm:grid-cols-2 dark:border-[#243B33] dark:bg-[#11221C]">
                                <div>
                                    <p className="text-[#3E514A] dark:text-[#C5D4CE]">Instansi / Unit</p>
                                    <p className="mt-0.5 font-semibold text-[#14221E] dark:text-white">{submittedSummary.agency_name}</p>
                                </div>
                                <div>
                                    <p className="text-[#3E514A] dark:text-[#C5D4CE]">Periode Survei</p>
                                    <p className="mt-0.5 font-semibold text-[#14221E] dark:text-white">{submittedSummary.period_label}</p>
                                </div>
                                <div>
                                    <p className="text-[#3E514A] dark:text-[#C5D4CE]">Jenis Layanan Dinilai</p>
                                    <p className="mt-0.5 font-semibold text-[#14221E] dark:text-white">{submittedSummary.service_name}</p>
                                </div>
                                <div>
                                    <p className="text-[#3E514A] dark:text-[#C5D4CE]">Total Responden Periode Ini</p>
                                    <p className="mt-0.5 font-semibold text-[#14221E] tabular-nums dark:text-white">
                                        {formatInt(submittedSummary.respondent_count)} responden
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    onClick={handleFillAnother}
                                    className="min-h-[44px] bg-[#0F4C3A] text-white hover:bg-[#0B392B]"
                                >
                                    <ClipboardCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Isi Kuesioner untuk Layanan Lain
                                </Button>
                                <Button asChild variant="outline" className="min-h-[44px] border-[#D6D1C4]">
                                    <Link href={skmRoute('home', undefined, '/')}>Kembali ke Beranda Portal</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {periods.length === 0 ? (
                    <Card className="border-dashed border-[#D6D1C4] bg-white dark:border-[#243B33] dark:bg-[#142620]">
                        <CardContent className="flex flex-col items-center px-6 py-12 text-center">
                            <img
                                src="/images/skm/tentang-skm-civic.png"
                                alt="Belum ada periode survei aktif"
                                className="mb-4 h-40 w-auto rounded-lg object-contain"
                            />
                            <h2 className="text-lg font-semibold text-[#14221E] dark:text-white">Periode Survei Belum Dibuka</h2>
                            <p className="mt-1.5 max-w-md text-sm text-[#3E514A] dark:text-[#C5D4CE]">
                                Saat ini belum ada periode survei kepuasan masyarakat dengan status aktif. Silakan kembali ke beranda atau hubungi
                                petugas unit pelayanan.
                            </p>
                            <div className="mt-5">
                                <Button asChild className="min-h-[44px] bg-[#0F4C3A] text-white hover:bg-[#0B392B]">
                                    <Link href={skmRoute('home', undefined, '/')}>Kembali ke Beranda</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    !showReceipt && (
                        <form onSubmit={submit} className="space-y-6" noValidate>
                            {clientWarning && (
                                <div
                                    role="alert"
                                    className="flex items-start gap-2.5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200"
                                >
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span>{clientWarning}</span>
                                </div>
                            )}

                            {/* Bagian 1 */}
                            <Card id="bagian-layanan" className="border-[#D6D1C4] bg-white dark:border-[#243B33] dark:bg-[#142620]">
                                <CardHeader>
                                    <CardTitle className="text-lg text-[#14221E] dark:text-white">1. Unit Pelayanan &amp; Jenis Layanan</CardTitle>
                                    <CardDescription className="text-[#3E514A] dark:text-[#C5D4CE]">
                                        Pilih jenis layanan yang Anda urus atau terima pada unit ini.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {periods.length > 1 ? (
                                        <div className="space-y-2">
                                            <Label htmlFor="survey_period_id">
                                                Periode &amp; Instansi Survei <span className="text-destructive">*</span>
                                            </Label>
                                            <Select value={String(data.survey_period_id || '')} onValueChange={handlePeriodChange}>
                                                <SelectTrigger id="survey_period_id" className="min-h-[44px] border-[#D6D1C4]">
                                                    <SelectValue placeholder="Pilih periode survei aktif" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {periods.map((p) => (
                                                        <SelectItem key={p.id} value={String(p.id)}>
                                                            {p.agency?.name ? `${p.agency.name} - ` : ''}
                                                            {p.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.survey_period_id} />
                                        </div>
                                    ) : (
                                        currentPeriod && (
                                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D6D1C4] bg-[#F8F7F4] px-4 py-3 text-sm dark:border-[#243B33] dark:bg-[#11221C]">
                                                <div className="flex items-start gap-2.5">
                                                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0F4C3A] dark:text-[#A7F3D0]" aria-hidden="true" />
                                                    <div>
                                                        <p className="font-semibold text-[#14221E] dark:text-white">
                                                            {currentPeriod.agency?.name || 'Instansi Pelayanan Publik'}
                                                        </p>
                                                        {currentPeriod.agency?.unit_name && (
                                                            <p className="text-xs text-[#3E514A] dark:text-[#C5D4CE]">{currentPeriod.agency.unit_name}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-[#3E514A] dark:text-[#C5D4CE]">
                                                    <CalendarRange className="h-3.5 w-3.5" aria-hidden="true" />
                                                    <span>
                                                        {currentPeriod.label} ({formatDateId(currentPeriod.start_date)} s.d.{' '}
                                                        {formatDateId(currentPeriod.end_date)})
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    )}

                                    <div className="space-y-2.5">
                                        <Label>
                                            Jenis Layanan yang Diterima <span className="text-destructive">*</span>
                                        </Label>

                                        {availableServices.length > 0 ? (
                                            <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Jenis layanan yang diterima">
                                                {availableServices.map((svc) => {
                                                    const selected = Number(data.service_type_id) === svc.id;
                                                    return (
                                                        <button
                                                            key={svc.id}
                                                            type="button"
                                                            role="radio"
                                                            aria-checked={selected}
                                                            onClick={() => {
                                                                setClientWarning(null);
                                                                clearErrors('service_type_id');
                                                                setData('service_type_id', svc.id);
                                                            }}
                                                            className={cn(
                                                                'flex min-h-[48px] items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C3A] dark:focus-visible:outline-[#A7F3D0]',
                                                                selected
                                                                    ? 'border-[#0F4C3A] bg-[#E6F0EC] font-semibold text-[#0F4C3A] dark:border-[#A7F3D0] dark:bg-[#1B3A30] dark:text-white'
                                                                    : 'border-[#D6D1C4] bg-white text-[#14221E] hover:bg-[#EFECE4] dark:border-[#2C473E] dark:bg-[#11221C] dark:text-[#F3F6F4] dark:hover:bg-[#193028]',
                                                            )}
                                                        >
                                                            <span>{svc.name}</span>
                                                            <span
                                                                className={cn(
                                                                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                                                                    selected
                                                                        ? 'border-[#0F4C3A] bg-[#0F4C3A] dark:border-[#A7F3D0] dark:bg-[#A7F3D0]'
                                                                        : 'border-[#3E514A]/60',
                                                                )}
                                                            >
                                                                {selected && <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-[#0D1915]" />}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="rounded-lg border border-dashed border-[#D6D1C4] p-4 text-sm text-[#3E514A] dark:text-[#C5D4CE]">
                                                Jenis layanan belum tersedia pada periode ini.
                                            </p>
                                        )}
                                        <InputError message={errors.service_type_id} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Bagian 2 */}
                            <Card className="border-[#D6D1C4] bg-white dark:border-[#243B33] dark:bg-[#142620]">
                                <CardHeader>
                                    <CardTitle className="text-lg text-[#14221E] dark:text-white">
                                        2. Profil Responden (Opsional &amp; Anonim)
                                    </CardTitle>
                                    <CardDescription className="text-[#3E514A] dark:text-[#C5D4CE]">
                                        Digunakan hanya untuk statistik demografi layanan. Boleh dikosongkan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Jenis Kelamin</Label>
                                        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Jenis kelamin">
                                            {[
                                                { value: 'L' as const, label: 'Laki-laki' },
                                                { value: 'P' as const, label: 'Perempuan' },
                                            ].map((opt) => {
                                                const active = data.gender === opt.value;
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={active}
                                                        onClick={() => setData('gender', active ? '' : opt.value)}
                                                        className={cn(
                                                            'min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C3A]',
                                                            active
                                                                ? 'border-[#0F4C3A] bg-[#E6F0EC] text-[#0F4C3A] dark:border-[#A7F3D0] dark:bg-[#1B3A30] dark:text-white'
                                                                : 'border-[#D6D1C4] bg-white text-[#14221E] hover:bg-[#EFECE4] dark:border-[#2C473E] dark:bg-[#11221C] dark:text-[#F3F6F4]',
                                                        )}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <InputError message={errors.gender} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="age_range">Rentang Usia</Label>
                                        <Select
                                            value={data.age_range || 'none'}
                                            onValueChange={(val) => setData('age_range', val === 'none' ? '' : val)}
                                        >
                                            <SelectTrigger id="age_range" className="min-h-[44px] border-[#D6D1C4]">
                                                <SelectValue placeholder="Pilih rentang usia" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tidak diisi</SelectItem>
                                                {AGE_RANGE_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.age_range} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="education">Pendidikan Terakhir</Label>
                                        <Select
                                            value={data.education || 'none'}
                                            onValueChange={(val) => setData('education', val === 'none' ? '' : val)}
                                        >
                                            <SelectTrigger id="education" className="min-h-[44px] border-[#D6D1C4]">
                                                <SelectValue placeholder="Pilih pendidikan terakhir" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tidak diisi</SelectItem>
                                                {EDUCATION_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.education} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="occupation">Pekerjaan Utama</Label>
                                        <Select
                                            value={data.occupation || 'none'}
                                            onValueChange={(val) => setData('occupation', val === 'none' ? '' : val)}
                                        >
                                            <SelectTrigger id="occupation" className="min-h-[44px] border-[#D6D1C4]">
                                                <SelectValue placeholder="Pilih pekerjaan utama" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tidak diisi</SelectItem>
                                                {OCCUPATION_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.occupation} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Bagian 3: Penilaian 9 Unsur */}
                            <Card className="border-[#D6D1C4] bg-white dark:border-[#243B33] dark:bg-[#142620]">
                                <CardHeader className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <CardTitle className="text-lg text-[#14221E] dark:text-white">3. Penilaian 9 Unsur Pelayanan</CardTitle>
                                            <CardDescription className="text-[#3E514A] dark:text-[#C5D4CE]">
                                                Pilih satu penilaian (1 sampai 4) pada masing-masing unsur pelayanan di bawah ini.
                                            </CardDescription>
                                        </div>
                                        <span className="rounded-md bg-[#E6F0EC] px-2.5 py-1 text-xs font-semibold text-[#0F4C3A] tabular-nums dark:bg-[#1B3A30] dark:text-[#A7F3D0]">
                                            Terjawab {answeredCount} / 9 unsur
                                        </span>
                                    </div>
                                    <Progress value={progressPercent} className="h-2 bg-[#EFECE4]" />
                                </CardHeader>

                                <CardContent className="space-y-5">
                                    {activeElements.map((el) => {
                                        const code = el.code as RatingCode;
                                        const currentScore = data.answers[code];
                                        const fieldError = (errors as Record<string, string | undefined>)[`answers.${code}`];

                                        return (
                                            <div
                                                key={code}
                                                id={`unsur-${code}`}
                                                className={cn(
                                                    'space-y-3 rounded-lg border p-4 transition-colors',
                                                    fieldError
                                                        ? 'border-red-400 bg-red-50/50 dark:border-red-700 dark:bg-red-950/30'
                                                        : currentScore
                                                          ? 'border-[#0F4C3A]/35 bg-[#F8F7F4] dark:border-[#34594C] dark:bg-[#11221C]'
                                                          : 'border-[#D6D1C4] bg-[#F8F7F4]/60 dark:border-[#243B33] dark:bg-[#11221C]/60',
                                                )}
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="rounded bg-[#0F4C3A] px-2 py-0.5 text-xs font-bold text-[#FDE68A]">
                                                            {code}
                                                        </span>
                                                        <h3 className="text-sm font-semibold text-[#14221E] sm:text-base dark:text-white">{el.name}</h3>
                                                    </div>
                                                    <p className="text-sm leading-relaxed text-[#3E514A] dark:text-[#C5D4CE]">{el.question}</p>
                                                </div>

                                                <div
                                                    className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
                                                    role="radiogroup"
                                                    aria-label={`${code} ${el.name}`}
                                                >
                                                    {SCORE_OPTIONS.map((scoreVal) => {
                                                        const selected = currentScore === scoreVal;
                                                        const scaleLabel = getElementScaleLabel(code, scoreVal);

                                                        return (
                                                            <button
                                                                key={scoreVal}
                                                                type="button"
                                                                role="radio"
                                                                aria-checked={selected}
                                                                onClick={() => setElementScore(code, scoreVal)}
                                                                className={cn(
                                                                    'flex min-h-[60px] flex-col items-start justify-center rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C3A] dark:focus-visible:outline-[#A7F3D0]',
                                                                    selected
                                                                        ? 'border-[#0F4C3A] bg-[#0F4C3A] text-white'
                                                                        : 'border-[#D6D1C4] bg-white text-[#14221E] hover:border-[#0F4C3A]/50 hover:bg-[#EFECE4] dark:border-[#2C473E] dark:bg-[#142620] dark:text-[#F3F6F4] dark:hover:bg-[#193028]',
                                                                )}
                                                            >
                                                                <span
                                                                    className={cn(
                                                                        'text-xs font-bold tabular-nums',
                                                                        selected ? 'text-[#FDE68A]' : 'text-[#0F4C3A] dark:text-[#A7F3D0]',
                                                                    )}
                                                                >
                                                                    Nilai {scoreVal}
                                                                </span>
                                                                <span className="mt-0.5 text-xs leading-snug font-medium">{scaleLabel}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <InputError message={fieldError} />
                                            </div>
                                        );
                                    })}
                                    <InputError message={errors.answers} />
                                </CardContent>
                            </Card>

                            {/* Bagian 4: Saran */}
                            <Card className="border-[#D6D1C4] bg-white dark:border-[#243B33] dark:bg-[#142620]">
                                <CardHeader>
                                    <CardTitle className="text-lg text-[#14221E] dark:text-white">
                                        4. Saran &amp; Masukan Perbaikan (Opsional)
                                    </CardTitle>
                                    <CardDescription className="text-[#3E514A] dark:text-[#C5D4CE]">
                                        Tuliskan saran, harapan, atau kendala yang Anda temui agar kami dapat meningkatkan pelayanan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Textarea
                                        id="suggestion"
                                        rows={4}
                                        maxLength={1000}
                                        className="border-[#D6D1C4] bg-white text-[#14221E] placeholder:text-[#3E514A]/70 dark:border-[#2C473E] dark:bg-[#11221C] dark:text-white"
                                        placeholder="Tuliskan saran atau masukan Anda di sini..."
                                        value={data.suggestion}
                                        onChange={(e) => setData('suggestion', e.target.value)}
                                    />
                                    <div className="flex items-center justify-between text-xs text-[#3E514A] dark:text-[#C5D4CE]">
                                        <InputError message={errors.suggestion} />
                                        <span className="ml-auto tabular-nums">{data.suggestion.length} / 1.000 karakter</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tombol Kirim */}
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D6D1C4] bg-white px-5 py-4 dark:border-[#243B33] dark:bg-[#142620]">
                                <p className="text-xs text-[#3E514A] dark:text-[#C5D4CE]">
                                    Jawaban Anda dicatat secara anonim tanpa identitas pribadi.
                                </p>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="min-h-[44px] border-[#D6D1C4] text-[#14221E] hover:bg-[#EFECE4] dark:border-[#2C473E] dark:text-white"
                                        onClick={resetForm}
                                        disabled={processing}
                                    >
                                        <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || availableServices.length === 0}
                                        className="min-h-[44px] bg-[#0F4C3A] px-5 text-white hover:bg-[#0B392B] dark:bg-[#156950] dark:hover:bg-[#115742]"
                                    >
                                        <Send className="mr-1.5 h-4 w-4" aria-hidden="true" />
                                        {processing ? 'Mengirim Jawaban...' : 'Kirim Kuesioner SKM'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )
                )}
            </div>
        </PublicLayout>
    );
}