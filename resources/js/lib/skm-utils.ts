import { type Grade, type PeriodStatus } from '@/types/skm';

export function skmRoute(name: string, params?: Record<string, string | number> | string | number, fallback?: string): string {
    try {
        if (typeof route === 'function') {
            const router = route();
            if (typeof router?.has === 'function' && router.has(name)) {
                return route(name, params as never);
            }
        }
    } catch {
        // Fallback ke path kontrak jika route belum terdaftar di Ziggy
    }

    if (fallback) {
        return fallback;
    }

    return '/';
}

export function formatScore(value: number | null | undefined, decimals = 2): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '—';
    }

    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(Number(value));
}

export function formatInt(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '0';
    }

    return new Intl.NumberFormat('id-ID').format(Number(value));
}

export function formatDateId(dateStr: string | null | undefined): string {
    if (!dateStr) {
        return '—';
    }

    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) {
        return dateStr;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsed);
}

export interface GradeMetaInfo {
    grade: Grade;
    performance: string;
    interval: string;
    badgeClass: string;
    softClass: string;
    textClass: string;
    barHex: string;
    ringClass: string;
}

export const GRADE_META: Record<Grade, GradeMetaInfo> = {
    A: {
        grade: 'A',
        performance: 'Sangat Baik',
        interval: '88,31 – 100,00',
        badgeClass: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/70 dark:bg-emerald-950/60 dark:text-emerald-300',
        softClass: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/30',
        textClass: 'text-emerald-700 dark:text-emerald-400',
        barHex: '#059669',
        ringClass: 'ring-emerald-500/20',
    },
    B: {
        grade: 'B',
        performance: 'Baik',
        interval: '76,61 – 88,30',
        badgeClass: 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700/70 dark:bg-blue-950/60 dark:text-blue-300',
        softClass: 'border-blue-200 bg-blue-50/70 dark:border-blue-800/60 dark:bg-blue-950/30',
        textClass: 'text-blue-700 dark:text-blue-400',
        barHex: '#1E4E8C',
        ringClass: 'ring-blue-500/20',
    },
    C: {
        grade: 'C',
        performance: 'Kurang Baik',
        interval: '65,00 – 76,60',
        badgeClass: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/70 dark:bg-amber-950/60 dark:text-amber-300',
        softClass: 'border-amber-200 bg-amber-50/70 dark:border-amber-800/60 dark:bg-amber-950/30',
        textClass: 'text-amber-700 dark:text-amber-400',
        barHex: '#D97706',
        ringClass: 'ring-amber-500/20',
    },
    D: {
        grade: 'D',
        performance: 'Tidak Baik',
        interval: '25,00 – 64,99',
        badgeClass: 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700/70 dark:bg-rose-950/60 dark:text-rose-300',
        softClass: 'border-rose-200 bg-rose-50/70 dark:border-rose-800/60 dark:bg-rose-950/30',
        textClass: 'text-rose-700 dark:text-rose-400',
        barHex: '#DC2626',
        ringClass: 'ring-rose-500/20',
    },
};

export function getGradeFromConversion(score: number): Grade {
    const rounded = Math.round(score * 100) / 100;
    if (rounded >= 88.31) return 'A';
    if (rounded >= 76.61) return 'B';
    if (rounded >= 65.0) return 'C';
    return 'D';
}

export const PERIOD_STATUS_META: Record<PeriodStatus, { label: string; className: string }> = {
    draft: {
        label: 'Draf',
        className: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    active: {
        label: 'Aktif',
        className: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    closed: {
        label: 'Ditutup',
        className: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    },
};

export const PERMENPAN_9_ELEMENTS_REFERENCE = [
    {
        code: 'U1',
        name: 'Persyaratan',
        question: 'Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?',
    },
    {
        code: 'U2',
        name: 'Sistem, Mekanisme, dan Prosedur',
        question: 'Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?',
    },
    {
        code: 'U3',
        name: 'Waktu Penyelesaian',
        question: 'Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?',
    },
    {
        code: 'U4',
        name: 'Biaya/Tarif',
        question: 'Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan?',
    },
    {
        code: 'U5',
        name: 'Produk Spesifikasi Jenis Pelayanan',
        question: 'Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?',
    },
    {
        code: 'U6',
        name: 'Kompetensi Pelaksana',
        question: 'Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?',
    },
    {
        code: 'U7',
        name: 'Perilaku Pelaksana',
        question: 'Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?',
    },
    {
        code: 'U8',
        name: 'Penanganan Pengaduan, Saran dan Masukan',
        question: 'Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan?',
    },
    {
        code: 'U9',
        name: 'Sarana dan Prasarana',
        question: 'Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?',
    },
];
