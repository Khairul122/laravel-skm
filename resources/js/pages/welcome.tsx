import { MotionReveal } from '@/components/skm/motion-reveal';
import PublicLayout, { PUBLIC_FOCUS } from '@/layouts/public-layout';
import { formatDateId, formatInt, formatScore, skmRoute } from '@/lib/skm-utils';
import { cn } from '@/lib/utils';
import { type ElementScore, type PublicPortalProps, type PublicPublication } from '@/types/skm';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ChevronDown, ClipboardList, MessageSquareText, Quote, Users } from 'lucide-react';
import { type ReactNode, useState } from 'react';

const LEGAL_BASIS = [
    { title: 'Undang-Undang RI Nomor 28 Tahun 1999', about: 'Penyelenggaraan Negara yang Bersih dan Bebas dari Korupsi, Kolusi, dan Nepotisme' },
    { title: 'Undang-Undang RI Nomor 25 Tahun 2009', about: 'Pelayanan Publik' },
    { title: 'Instruksi Presiden RI Nomor 1 Tahun 1995', about: 'Perbaikan dan Peningkatan Mutu Pelayanan Aparatur Pemerintah kepada Masyarakat' },
    { title: 'Instruksi Presiden RI Nomor 5 Tahun 2004', about: 'Percepatan Pemberantasan Korupsi' },
    { title: 'Keputusan Menteri PAN Nomor 63/KEP/M.PAN/7/2003', about: 'Pedoman Umum Penyelenggaraan Pelayanan Publik' },
    {
        title: 'Peraturan Menteri PANRB Nomor 14 Tahun 2017',
        about: 'Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik',
    },
];

// Pengertian 9 unsur pelayanan menurut Permenpan-RB Nomor 14 Tahun 2017.
const ELEMENT_DEFINITIONS: Record<string, string> = {
    U1: 'Syarat yang harus dipenuhi dalam pengurusan suatu jenis pelayanan, baik persyaratan teknis maupun administratif.',
    U2: 'Tata cara pelayanan yang dibakukan bagi pemberi dan penerima pelayanan, termasuk pengaduan.',
    U3: 'Jangka waktu yang diperlukan untuk menyelesaikan seluruh proses pelayanan dari setiap jenis pelayanan.',
    U4: 'Ongkos yang dikenakan kepada penerima layanan dalam mengurus dan/atau memperoleh pelayanan dari penyelenggara, yang besarnya ditetapkan berdasarkan kesepakatan antara penyelenggara dan masyarakat.',
    U5: 'Hasil pelayanan yang diberikan dan diterima sesuai dengan ketentuan yang telah ditetapkan. Produk pelayanan ini merupakan hasil dari setiap spesifikasi jenis pelayanan.',
    U6: 'Kemampuan yang harus dimiliki oleh pelaksana, meliputi pengetahuan, keahlian, keterampilan, dan pengalaman.',
    U7: 'Sikap petugas dalam memberikan pelayanan.',
    U8: 'Tata cara pelaksanaan penanganan pengaduan dan tindak lanjutnya.',
    U9: 'Sarana adalah segala sesuatu yang dapat dipakai sebagai alat untuk mencapai maksud dan tujuan. Prasarana adalah segala sesuatu yang menjadi penunjang utama terselenggaranya suatu proses. Sarana untuk benda bergerak (komputer, mesin), prasarana untuk benda tidak bergerak (gedung).',
};

/** Judul bagian bergaya rujukan: kata pertama berwarna, garis ganda di bawahnya. */
function SectionHeading({ accent, rest, center = false, children }: { accent: string; rest: string; center?: boolean; children?: ReactNode }) {
    return (
        <div className={cn('space-y-4', center && 'mx-auto max-w-3xl text-center')}>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                <span className="text-[#14704F] dark:text-[#A7E3C4]">{accent}</span> {rest}
            </h2>
            <div className={cn('flex gap-1.5', center && 'justify-center')} aria-hidden="true">
                <span className="h-[3px] w-6 rounded-full bg-[#14704F] dark:bg-[#A7E3C4]" />
                <span className="h-[3px] w-6 rounded-full bg-[#F5B83D]" />
            </div>
            {children && <div className="text-base leading-relaxed text-[#55635B] dark:text-[#C9D3CE]">{children}</div>}
        </div>
    );
}

/** Latar gelombang lembut di sudut kartu, meniru kartu publikasi rujukan dalam warna hijau. */
function CardWaves() {
    return (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 500" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 0h260c-40 40-70 30-110 70S70 150 0 170z" className="fill-[#E3F5EA] dark:fill-[#18291F]" />
            <path d="M0 0h160c-30 30-50 26-80 56S30 110 0 118z" className="fill-[#CDEBDA] dark:fill-[#1D3326]" />
            <path d="M400 500H200c40-30 70-24 110-56s60-60 90-64z" className="fill-[#E3F5EA] dark:fill-[#18291F]" />
        </svg>
    );
}

function ScoreBar({ value }: { value: number }) {
    const pct = Math.max(0, Math.min(100, (value / 4) * 100));
    return (
        <span className="block h-2 w-full overflow-hidden rounded-full bg-[#E3EDE7] dark:bg-[#24332B]" aria-hidden="true">
            <span className="block h-full rounded-full bg-gradient-to-r from-[#14704F] to-[#2FA372]" style={{ width: `${pct}%` }} />
        </span>
    );
}

function PublicationCard({ item }: { item: PublicPublication }) {
    const [open, setOpen] = useState(false);
    const detailId = `publikasi-detail-${item.period_id}`;
    const elements = [...(item.elements ?? [])].sort((a, b) => a.code.localeCompare(b.code, 'id', { numeric: true }));

    return (
        <article className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-white p-7 text-center shadow-[0_18px_40px_-24px_rgba(11,61,46,0.45)] ring-1 ring-[#E3EDE7] transition-transform duration-300 hover:-translate-y-1 dark:bg-[#141F19] dark:ring-[#24332B]">
            <CardWaves />
            <div className="relative flex flex-1 flex-col">
                <p className="text-left text-4xl font-extrabold text-[#14704F] tabular-nums dark:text-[#A7E3C4]">{formatScore(item.ikm_score)}</p>
                <h3 className="mt-5 text-xl font-bold">IKM {item.period_label ?? 'Periode Survei'}</h3>
                <p className="mt-1 text-sm text-[#55635B] dark:text-[#C9D3CE]">
                    {item.start_date && item.end_date ? `${formatDateId(item.start_date)} s.d. ${formatDateId(item.end_date)}` : item.agency_name}
                </p>
                <img src="/images/skm/publikasi-laporan.svg" alt="" className="mx-auto my-5 h-28 w-auto" />
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                    <span className="rounded-full bg-[#14704F] px-3 py-1 font-semibold text-white">
                        Mutu {item.grade} ({item.performance})
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF8F2] px-3 py-1 font-medium text-[#14704F] dark:bg-[#18251E] dark:text-[#A7E3C4]">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatInt(item.respondent_count)} responden
                    </span>
                </div>

                <div className="mt-auto pt-6">
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls={detailId}
                        className={cn(
                            'inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-[#14704F] px-5 text-sm font-semibold text-[#14704F] transition-colors hover:bg-[#14704F] hover:text-white dark:border-[#A7E3C4] dark:text-[#A7E3C4] dark:hover:bg-[#A7E3C4] dark:hover:text-[#0B3D2E]',
                            PUBLIC_FOCUS,
                        )}
                    >
                        {open ? 'Tutup Detail' : 'Lihat Detail'}
                        <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', open && 'rotate-180')} aria-hidden="true" />
                    </button>
                </div>

                <div
                    id={detailId}
                    className={cn(
                        'grid text-left transition-[grid-template-rows,opacity] duration-300 ease-out',
                        open ? 'mt-5 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                    )}
                >
                    <div className="overflow-hidden">
                        {elements.length > 0 ? (
                            <ul className="divide-y divide-[#E3EDE7] rounded-2xl bg-[#F3FAF6] px-4 dark:divide-[#24332B] dark:bg-[#18251E]">
                                {elements.map((el: ElementScore) => (
                                    <li key={el.code} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                                        <span className="min-w-0">
                                            <span className="font-semibold text-[#14704F] dark:text-[#A7E3C4]">{el.code}</span> {el.name}
                                        </span>
                                        <span className="shrink-0 font-semibold tabular-nums">{formatScore(el.conversion)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="rounded-2xl bg-[#F3FAF6] p-4 text-sm text-[#55635B] dark:bg-[#18251E] dark:text-[#C9D3CE]">
                                Rincian per unsur belum tersedia untuk periode ini.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function Welcome({
    agency = null,
    serviceTypes = [],
    activePeriods = [],
    elements = [],
    latestResult = null,
    publications = [],
}: PublicPortalProps) {
    const activePeriod = activePeriods[0] ?? null;
    const agencyTitle = agency?.name ?? 'Unit Penyelenggara Pelayanan Publik';
    const unitTitle = agency?.unit_name ?? agencyTitle;
    const surveyBaseHref = skmRoute('questionnaire.show', undefined, '/kuesioner');
    const surveyHref = activePeriod ? `${surveyBaseHref}?periode=${activePeriod.id}` : surveyBaseHref;
    const serviceHref = (serviceId: number) =>
        activePeriod ? `${surveyBaseHref}?periode=${activePeriod.id}&layanan=${serviceId}` : `${surveyBaseHref}?layanan=${serviceId}`;

    const scoreByCode = new Map((latestResult?.elements ?? []).map((el) => [el.code, el]));
    const [selectedCode, setSelectedCode] = useState<string>(elements[0]?.code ?? 'U1');
    const selectedElement = elements.find((el) => el.code === selectedCode) ?? elements[0];

    return (
        <PublicLayout agencyName={agency?.name} unitName={agency?.unit_name} agencyAddress={agency?.address} agencyCity={agency?.city}>
            <Head title={`E-SKM ${agencyTitle}`} />

            {/* 1. Beranda: gradien hijau, teks kiri, ilustrasi kanan, gelombang di bawah */}
            <section
                id="beranda"
                className="relative scroll-mt-20 overflow-hidden bg-gradient-to-br from-[#0B3D2E] via-[#11573F] to-[#1B7A55] text-white"
            >
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <span className="absolute top-16 left-[6%] h-28 w-28 rotate-12 rounded-[32px] bg-white/[0.06]" />
                    <span className="absolute bottom-36 left-[40%] h-20 w-20 -rotate-12 rounded-[26px] bg-white/[0.07]" />
                    <span className="absolute top-24 right-[8%] h-40 w-40 rounded-full bg-[#2FA372]/25" />
                </div>

                <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pt-14 pb-32 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-20 lg:pb-44">
                    <div>
                        <p className="animate-loket-text text-sm font-semibold text-[#BFE8D2]">
                            {agencyTitle}
                            {activePeriod ? ` · Periode ${activePeriod.label}` : ''}
                        </p>
                        <h1
                            className="animate-loket-text mt-4 text-4xl leading-[1.12] font-extrabold tracking-tight sm:text-5xl lg:text-[3.6rem]"
                            style={{ animationDelay: '80ms' }}
                        >
                            Survei Kepuasan Masyarakat
                        </h1>
                        <p
                            className="animate-loket-text mt-6 max-w-[58ch] text-base leading-relaxed text-[#E7F4EC] sm:text-lg"
                            style={{ animationDelay: '160ms' }}
                        >
                            Survei Kepuasan Masyarakat (SKM) adalah pengukuran tingkat kepuasan masyarakat atas pelayanan yang diberikan aparatur
                            penyelenggara pelayanan publik. Pendapat Anda membantu {unitTitle} memperbaiki mutu layanannya.
                        </p>
                        <div className="animate-loket-text mt-8 flex flex-wrap gap-3" style={{ animationDelay: '240ms' }}>
                            <Link
                                href={surveyHref}
                                className={cn(
                                    'group inline-flex min-h-[52px] items-center gap-2 rounded-full bg-white px-7 text-base font-bold text-[#0B3D2E] shadow-[0_14px_28px_-14px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:-translate-y-0.5',
                                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                                )}
                            >
                                Mulai Survei
                                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                            </Link>
                            <a
                                href="#publikasi"
                                className="inline-flex min-h-[52px] items-center rounded-full border-2 border-white/70 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Lihat Publikasi
                            </a>
                        </div>
                    </div>

                    <div className="animate-hero-art relative mx-auto w-full max-w-[560px]">
                        <img
                            src="/images/skm/hero-survei.svg"
                            alt="Ilustrasi tangan memegang ponsel yang menampilkan formulir survei kepuasan"
                            className="w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.25)]"
                        />
                    </div>
                </div>

                <svg className="absolute inset-x-0 bottom-0 h-20 w-full sm:h-28" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 70c180 40 360 50 560 20s420-80 620-50 200 40 260 40v40H0z" className="fill-white dark:fill-[#0E1712]" />
                </svg>
            </section>

            {/* 2. Tentang & Dasar Hukum */}
            <section id="tentang" className="scroll-mt-20 py-16 lg:py-24">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
                    <div className="lg:col-span-7">
                        <MotionReveal>
                            <SectionHeading accent="Tentang & Dasar Hukum" rest="E-SKM">
                                <p>
                                    Survei Kepuasan Masyarakat (SKM) adalah data dan informasi tentang tingkat kepuasan masyarakat yang diperoleh dari
                                    pengukuran kuantitatif dan kualitatif atas pendapat masyarakat dalam memperoleh pelayanan dari aparatur
                                    penyelenggara pelayanan publik. SKM menjadi tolok ukur kualitas pelayanan yang diberikan unit layanan.
                                </p>
                                <p className="mt-4">
                                    Melalui survei ini, masyarakat sebagai pengguna layanan ikut menilai kinerja {unitTitle}, dan unit layanan
                                    terdorong untuk meningkatkan kualitas serta berinovasi dalam pelayanan publik.
                                </p>
                                <p className="mt-4 font-medium text-[#1F2A24] dark:text-[#E7F0EA]">
                                    Penyelenggaraan SKM berpedoman pada peraturan berikut:
                                </p>
                            </SectionHeading>
                        </MotionReveal>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            {LEGAL_BASIS.map((item, index) => (
                                <MotionReveal key={item.title} delay={(index % 2) * 80}>
                                    <div className="h-full rounded-[22px] bg-white p-6 shadow-[0_14px_34px_-22px_rgba(11,61,46,0.5)] ring-1 ring-[#E3EDE7] transition-transform duration-300 hover:-translate-y-1 dark:bg-[#141F19] dark:ring-[#24332B]">
                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF8F2] text-sm font-bold text-[#14704F] dark:bg-[#18251E] dark:text-[#A7E3C4]">
                                            {index + 1}
                                        </span>
                                        <h3 className="mt-4 text-[17px] leading-snug font-bold">{item.title}</h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-[#55635B] dark:text-[#C9D3CE]">{item.about}</p>
                                    </div>
                                </MotionReveal>
                            ))}
                        </div>

                        <MotionReveal className="mt-8">
                            <Link
                                href={surveyHref}
                                className={cn(
                                    'inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#14704F] px-6 font-semibold text-white transition-colors hover:bg-[#0B3D2E]',
                                    PUBLIC_FOCUS,
                                )}
                            >
                                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                                Mulai Survei
                            </Link>
                        </MotionReveal>
                    </div>

                    <MotionReveal variant="scale" className="lg:col-span-5">
                        <div className="lg:sticky lg:top-28">
                            <img
                                src="/images/skm/tentang-survei.svg"
                                alt="Ilustrasi dua petugas membahas papan data kepuasan layanan"
                                className="w-full"
                            />
                        </div>
                    </MotionReveal>
                </div>
            </section>

            {/* 3. Unsur E-SKM */}
            <section id="unsur" className="scroll-mt-20 bg-[#F3FAF6] py-16 lg:py-24 dark:bg-[#111C16]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <MotionReveal>
                        <SectionHeading accent="Unsur" rest="E-SKM" center>
                            <p>
                                Kuesioner disusun berdasarkan prinsip pelayanan dalam Peraturan Menteri PANRB Nomor 14 Tahun 2017 dan mencakup 9
                                (sembilan) unsur pelayanan. Pilih unsur untuk membaca pengertiannya.
                            </p>
                        </SectionHeading>
                    </MotionReveal>

                    {elements.length > 0 ? (
                        <div className="mt-12 grid items-start gap-8 lg:grid-cols-12">
                            <MotionReveal className="lg:col-span-7">
                                <ul className="space-y-2" role="list">
                                    {elements.map((el) => {
                                        const score = scoreByCode.get(el.code);
                                        const active = el.code === selectedElement?.code;
                                        return (
                                            <li key={el.code}>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCode(el.code)}
                                                    aria-pressed={active}
                                                    className={cn(
                                                        'grid w-full grid-cols-[2.75rem_1fr] items-center gap-x-4 gap-y-2 rounded-2xl px-4 py-3.5 text-left transition-all duration-200 sm:grid-cols-[2.75rem_1fr_11rem]',
                                                        PUBLIC_FOCUS,
                                                        active
                                                            ? 'bg-white shadow-[0_12px_30px_-20px_rgba(11,61,46,0.6)] ring-2 ring-[#14704F] dark:bg-[#141F19] dark:ring-[#A7E3C4]'
                                                            : 'hover:bg-white/80 dark:hover:bg-[#141F19]/70',
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            'inline-flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold',
                                                            active
                                                                ? 'bg-[#14704F] text-white'
                                                                : 'bg-white text-[#14704F] ring-1 ring-[#CFE6D9] dark:bg-[#141F19] dark:text-[#A7E3C4] dark:ring-[#2C4237]',
                                                        )}
                                                    >
                                                        {el.code}
                                                    </span>
                                                    <span className={cn('text-[17px] font-semibold', active && 'text-[#14704F] dark:text-[#A7E3C4]')}>
                                                        {el.name}
                                                    </span>
                                                    <span className="col-start-2 flex items-center gap-3 sm:col-start-3">
                                                        {score ? (
                                                            <>
                                                                <ScoreBar value={score.nrr} />
                                                                <span className="w-10 shrink-0 text-right text-sm font-bold text-[#14704F] tabular-nums dark:text-[#A7E3C4]">
                                                                    {formatScore(score.nrr)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-[#55635B] dark:text-[#C9D3CE]">Belum ada nilai</span>
                                                        )}
                                                    </span>
                                                </button>
                                                {active && (
                                                    <div className="animate-civic-tab mx-2 mt-2 rounded-2xl bg-gradient-to-br from-[#0B3D2E] to-[#1B7A55] p-5 text-sm leading-relaxed text-white lg:hidden">
                                                        <p className="font-medium">{ELEMENT_DEFINITIONS[el.code] ?? el.question}</p>
                                                        {el.question && (
                                                            <p className="mt-3 text-[#E7F4EC]">
                                                                <span className="font-semibold text-white">Pertanyaan di kuesioner: </span>
                                                                {el.question}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                                {latestResult && (
                                    <p className="mt-4 px-4 text-sm text-[#55635B] dark:text-[#C9D3CE]">
                                        Nilai rata-rata unsur (skala 1 sampai 4) dari {formatInt(latestResult.respondent_count)} responden periode{' '}
                                        {latestResult.period_label}.
                                    </p>
                                )}
                            </MotionReveal>

                            <MotionReveal variant="scale" className="hidden lg:sticky lg:top-28 lg:col-span-5 lg:block">
                                <div
                                    key={selectedElement?.code}
                                    className="animate-civic-tab relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0B3D2E] to-[#1B7A55] p-8 text-white shadow-[0_24px_50px_-24px_rgba(11,61,46,0.8)] sm:p-10"
                                    aria-live="polite"
                                >
                                    <span aria-hidden="true" className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/[0.08]" />
                                    <span aria-hidden="true" className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#2FA372]/30" />
                                    <Quote className="relative h-12 w-12 text-[#F5B83D]" aria-hidden="true" />
                                    <p className="relative mt-4 text-sm font-semibold text-[#BFE8D2]">
                                        {selectedElement?.code} · {selectedElement?.name}
                                    </p>
                                    <p className="relative mt-3 text-lg leading-relaxed font-medium">
                                        {selectedElement ? (ELEMENT_DEFINITIONS[selectedElement.code] ?? selectedElement.question) : ''}
                                    </p>
                                    {selectedElement?.question && (
                                        <div className="relative mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-relaxed text-[#E7F4EC]">
                                            <span className="font-semibold text-white">Pertanyaan di kuesioner: </span>
                                            {selectedElement.question}
                                        </div>
                                    )}
                                </div>
                            </MotionReveal>
                        </div>
                    ) : (
                        <p className="mt-10 text-center text-[#55635B] dark:text-[#C9D3CE]">Daftar unsur survei belum diisi oleh pengelola.</p>
                    )}
                </div>
            </section>

            {/* 4. Publikasi IKM */}
            <section id="publikasi" className="scroll-mt-20 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <MotionReveal>
                        <SectionHeading accent="Publikasi" rest="IKM" center>
                            <p>
                                {agencyTitle} melakukan evaluasi berkala terhadap hasil survei dan masukan masyarakat sebagai patokan peningkatan
                                kualitas pelayanan publik.
                            </p>
                        </SectionHeading>
                    </MotionReveal>

                    {publications.length > 0 ? (
                        <div className="mt-12 flex flex-wrap items-start justify-center gap-6">
                            {publications.map((item, index) => (
                                <MotionReveal
                                    key={item.period_id}
                                    delay={index * 90}
                                    className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                                >
                                    <PublicationCard item={item} />
                                </MotionReveal>
                            ))}
                        </div>
                    ) : (
                        <p className="mx-auto mt-10 max-w-lg rounded-2xl bg-[#F3FAF6] p-6 text-center text-[#55635B] dark:bg-[#111C16] dark:text-[#C9D3CE]">
                            Belum ada hasil IKM yang dipublikasikan. Hasil akan tampil di sini setelah pengelola menghitung data periode survei.
                        </p>
                    )}
                </div>
            </section>

            {/* 5. Survei Kami: satu kartu per layanan pada periode aktif */}
            <section id="survei" className="scroll-mt-20 bg-[#F3FAF6] py-16 lg:py-24 dark:bg-[#111C16]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <MotionReveal>
                        <SectionHeading accent="Survei" rest="Kami" center>
                            <p>
                                Beri penilaian atas layanan yang Anda terima. Masukan Anda menjadi patokan peningkatan kualitas pelayanan {unitTitle}.
                            </p>
                        </SectionHeading>
                    </MotionReveal>

                    {serviceTypes.length > 0 ? (
                        <div className="mt-12 flex flex-wrap justify-center gap-6">
                            {serviceTypes.map((service, index) => (
                                <MotionReveal key={service.id} delay={index * 90} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                                    <article className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-white p-8 text-center shadow-[0_18px_40px_-24px_rgba(11,61,46,0.45)] ring-1 ring-[#E3EDE7] transition-transform duration-300 hover:-translate-y-1 dark:bg-[#141F19] dark:ring-[#24332B]">
                                        <CardWaves />
                                        <div className="relative flex flex-1 flex-col items-center pt-10">
                                            <h3 className="text-xl font-bold">Survei Layanan {service.name}</h3>
                                            <p className="mt-3 text-sm leading-relaxed text-[#55635B] dark:text-[#C9D3CE]">
                                                Survei untuk mengukur kepuasan masyarakat terhadap layanan {service.name} di {unitTitle}
                                                {activePeriod ? `, periode ${activePeriod.label}.` : '.'}
                                            </p>
                                            <div className="mt-auto pt-7">
                                                <Link
                                                    href={serviceHref(service.id)}
                                                    className={cn(
                                                        'group inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-[#14704F] px-5 text-sm font-semibold text-[#14704F] transition-colors hover:bg-[#14704F] hover:text-white dark:border-[#A7E3C4] dark:text-[#A7E3C4] dark:hover:bg-[#A7E3C4] dark:hover:text-[#0B3D2E]',
                                                        PUBLIC_FOCUS,
                                                    )}
                                                >
                                                    Mulai Survei
                                                    <ArrowRight
                                                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                                        aria-hidden="true"
                                                    />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                </MotionReveal>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 text-center">
                            <p className="text-[#55635B] dark:text-[#C9D3CE]">Daftar layanan belum diisi. Anda tetap bisa membuka formulir survei.</p>
                            <Link
                                href={surveyHref}
                                className={cn('mt-4 inline-flex font-semibold text-[#14704F] underline dark:text-[#A7E3C4]', PUBLIC_FOCUS)}
                            >
                                Buka formulir survei
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* 6. Hubungi Kami: gelombang hijau yang menyambung ke footer */}
            <section id="kontak" className="relative scroll-mt-20 overflow-hidden bg-white pt-24 dark:bg-[#0E1712]">
                <svg className="absolute inset-x-0 top-0 h-full w-full" viewBox="0 0 1440 400" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 120c160-80 300-90 440-40s260 70 420 10 340-90 580-20V400H0z" fill="#105A41" />
                    <path d="M240 60c160-60 300-40 420 30" fill="none" stroke="#2FA372" strokeWidth="3" opacity=".5" />
                    <path d="M980 40c140-30 260 0 360 60" fill="none" stroke="#F5B83D" strokeWidth="3" opacity=".45" />
                </svg>
                <MotionReveal className="relative mx-auto max-w-3xl px-4 pt-24 pb-16 text-center text-white sm:px-6">
                    <MessageSquareText className="mx-auto h-10 w-10 text-[#F5B83D]" aria-hidden="true" />
                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Kami Sangat Terbuka atas Saran dan Masukan Anda</h2>
                    <p className="mx-auto mt-4 max-w-[56ch] text-base leading-relaxed text-[#E7F4EC]">
                        Tuliskan saran di kolom terakhir kuesioner. Untuk pengaduan yang perlu ditindaklanjuti, gunakan{' '}
                        <a
                            href="https://www.lapor.go.id"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-white underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            SP4N-LAPOR!
                            <span className="sr-only"> (tab baru)</span>
                        </a>{' '}
                        atau datang langsung ke kantor kami.
                    </p>
                    <Link
                        href={surveyHref}
                        className="mt-8 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-white px-7 font-bold text-[#0B3D2E] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        Tulis Saran Lewat Survei
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </Link>
                </MotionReveal>
            </section>
        </PublicLayout>
    );
}
