import { FlashNotifier } from '@/components/skm/flash-banner';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAppearance } from '@/hooks/use-appearance';
import { skmRoute } from '@/lib/skm-utils';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ClipboardList, LogIn, MapPin, Menu, Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PublicLayoutProps {
    children: React.ReactNode;
    agencyName?: string | null;
    unitName?: string | null;
    agencyAddress?: string | null;
    agencyCity?: string | null;
}

const HOME_SECTION_IDS = ['beranda', 'tentang', 'unsur', 'publikasi', 'survei', 'kontak'] as const;

export const PUBLIC_FOCUS =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14704F] dark:focus-visible:outline-[#A7E3C4]';

export default function PublicLayout({ children, agencyName, unitName, agencyAddress, agencyCity }: PublicLayoutProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const currentPath = page.url.split('?')[0];
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('beranda');
    const [scrolled, setScrolled] = useState(false);
    const { appearance, updateAppearance } = useAppearance();

    const portalTitle = agencyName || 'Portal e-SKM Instansi';
    const portalSubtitle = unitName || 'Survei Kepuasan Masyarakat';
    const isHome = currentPath === '/';
    const homeHref = skmRoute('home', undefined, '/');
    const surveyHref = skmRoute('questionnaire.show', undefined, '/kuesioner');
    const staffHref = auth?.user ? skmRoute('dashboard', undefined, '/dashboard') : skmRoute('login', undefined, '/login');
    const staffLabel = auth?.user ? 'Panel Pengelola' : 'Masuk Petugas';

    const isDarkActive =
        appearance === 'dark' ||
        (appearance === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const toggleTheme = () => updateAppearance(isDarkActive ? 'light' : 'dark');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Penanda menu aktif saat beranda digulir.
    useEffect(() => {
        if (!isHome || typeof IntersectionObserver === 'undefined') {
            return;
        }
        const elements = HOME_SECTION_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]?.target?.id) {
                    setActiveSection(visible[0].target.id);
                }
            },
            { rootMargin: '-35% 0px -55% 0px', threshold: [0.05, 0.3] },
        );
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [isHome]);

    // Laci menu mengunci gulir halaman; simpan tujuan, lalu gulir setelah laci selesai menutup.
    const pendingAnchor = useRef<string | null>(null);

    const handleMobileNav = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('#')) {
            event.preventDefault();
            pendingAnchor.current = href;
        }
        setMobileOpen(false);
    };

    const handleSheetCloseAutoFocus = (event: Event) => {
        const href = pendingAnchor.current;
        if (!href) {
            return;
        }
        event.preventDefault();
        pendingAnchor.current = null;
        const started = performance.now();
        const scrollWhenUnlocked = () => {
            const locked = document.body.hasAttribute('data-scroll-locked') || getComputedStyle(document.body).overflow === 'hidden';
            if (locked && performance.now() - started < 1500) {
                window.requestAnimationFrame(scrollWhenUnlocked);
                return;
            }
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            document.getElementById(href.slice(1))?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        };
        window.requestAnimationFrame(scrollWhenUnlocked);
    };

    const anchor = (id: string) => (isHome ? `#${id}` : `${homeHref}#${id}`);

    const navLinks = [
        { label: 'Beranda', href: isHome ? '#beranda' : homeHref, id: 'beranda' },
        { label: 'Tentang E-SKM', href: anchor('tentang'), id: 'tentang' },
        { label: 'Unsur Survei', href: anchor('unsur'), id: 'unsur' },
        { label: 'Publikasi', href: anchor('publikasi'), id: 'publikasi' },
        { label: 'Hubungi Kami', href: anchor('kontak'), id: 'kontak' },
    ].map((item) => ({ ...item, active: isHome && activeSection === item.id }));

    const footerLink = cn('text-[#D9EFE3] underline-offset-4 transition-colors hover:text-white hover:underline', PUBLIC_FOCUS);

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans text-[#1F2A24] dark:bg-[#0E1712] dark:text-[#E7F0EA]">
            <a
                href="#konten-utama"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-[#14704F] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
                Lewati ke konten utama
            </a>

            <header
                className={cn(
                    'sticky top-0 z-40 border-b bg-white/95 backdrop-blur transition-shadow duration-300 dark:bg-[#0E1712]/95',
                    scrolled ? 'border-[#E3EDE7] shadow-[0_8px_24px_-16px_rgba(11,61,46,0.35)] dark:border-[#24332B]' : 'border-transparent',
                )}
            >
                <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link href={homeHref} className={cn('flex min-w-0 items-center gap-3 rounded-lg', PUBLIC_FOCUS)}>
                        <img src="/images/skm/logo-loket.svg" alt="" className="h-11 w-11 shrink-0" />
                        <span className="min-w-0 leading-tight">
                            <span className="block text-2xl font-extrabold tracking-tight text-[#14704F] dark:text-[#A7E3C4]">E-SKM</span>
                            <span className="block max-w-[300px] truncate text-xs font-medium text-[#55635B] dark:text-[#C9D3CE]">{portalTitle}</span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
                        {navLinks.map((item) => (
                            <a
                                key={item.id}
                                href={item.href}
                                aria-current={item.active ? 'location' : undefined}
                                className={cn(
                                    'relative rounded-md px-3.5 py-2 text-[15px] font-semibold transition-colors',
                                    PUBLIC_FOCUS,
                                    item.active
                                        ? 'text-[#14704F] after:absolute after:inset-x-3.5 after:-bottom-[18px] after:h-[3px] after:rounded-full after:bg-[#14704F] dark:text-[#A7E3C4] dark:after:bg-[#A7E3C4]'
                                        : 'text-[#1F2A24] hover:text-[#14704F] dark:text-[#E7F0EA] dark:hover:text-[#A7E3C4]',
                                )}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className={cn(
                                'inline-flex h-11 w-11 items-center justify-center rounded-full text-[#14704F] transition-colors hover:bg-[#EEF8F2] dark:text-[#A7E3C4] dark:hover:bg-[#18251E]',
                                PUBLIC_FOCUS,
                            )}
                            aria-label={isDarkActive ? 'Ubah ke tampilan terang' : 'Ubah ke tampilan gelap'}
                        >
                            {isDarkActive ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
                        </button>

                        <Link
                            href={surveyHref}
                            className={cn(
                                'hidden min-h-[44px] items-center gap-2 rounded-full bg-[#14704F] px-5 text-[15px] font-semibold text-white shadow-[0_10px_20px_-10px_rgba(20,112,79,0.7)] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#0B3D2E] sm:inline-flex',
                                PUBLIC_FOCUS,
                            )}
                        >
                            <ClipboardList className="h-4 w-4" aria-hidden="true" />
                            Mulai Survei
                        </Link>

                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        'inline-flex h-11 items-center gap-2 rounded-full border border-[#CFE6D9] px-4 text-sm font-semibold text-[#14704F] lg:hidden dark:border-[#2C4237] dark:text-[#A7E3C4]',
                                        PUBLIC_FOCUS,
                                    )}
                                    aria-label="Buka menu navigasi"
                                >
                                    <Menu className="h-4 w-4" aria-hidden="true" />
                                    Menu
                                </button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                onCloseAutoFocus={handleSheetCloseAutoFocus}
                                className="w-80 bg-white text-[#1F2A24] dark:bg-[#0E1712] dark:text-[#E7F0EA]"
                            >
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-2.5 text-left text-[#1F2A24] dark:text-white">
                                        <img src="/images/skm/logo-loket.svg" alt="" className="h-8 w-8" />
                                        E-SKM
                                    </SheetTitle>
                                    <SheetDescription className="text-left text-xs text-[#55635B] dark:text-[#C9D3CE]">
                                        {portalTitle}
                                    </SheetDescription>
                                </SheetHeader>
                                <nav className="flex flex-col gap-1 px-4" aria-label="Navigasi seluler">
                                    {navLinks.map((item) => (
                                        <a
                                            key={item.id}
                                            href={item.href}
                                            onClick={(event) => handleMobileNav(event, item.href)}
                                            className={cn(
                                                'flex min-h-[46px] items-center rounded-lg px-3 text-[15px] font-semibold',
                                                PUBLIC_FOCUS,
                                                item.active
                                                    ? 'bg-[#EEF8F2] text-[#14704F] dark:bg-[#18251E] dark:text-[#A7E3C4]'
                                                    : 'hover:bg-[#F3FAF6] dark:hover:bg-[#18251E]',
                                            )}
                                        >
                                            {item.label}
                                        </a>
                                    ))}
                                    <Link
                                        href={surveyHref}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            'mt-4 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#14704F] font-semibold text-white',
                                            PUBLIC_FOCUS,
                                        )}
                                    >
                                        <ClipboardList className="h-4 w-4" aria-hidden="true" />
                                        Mulai Survei
                                    </Link>
                                    <Link
                                        href={staffHref}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#CFE6D9] font-semibold text-[#14704F] dark:border-[#2C4237] dark:text-[#A7E3C4]',
                                            PUBLIC_FOCUS,
                                        )}
                                    >
                                        <LogIn className="h-4 w-4" aria-hidden="true" />
                                        {staffLabel}
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            <main id="konten-utama" className="flex-1">
                {!isHome && (
                    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
                        <FlashNotifier />
                    </div>
                )}
                {children}
            </main>

            <footer className="bg-[#105A41] text-[#E7F4EC]">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 text-sm sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-white">Hubungi Kami</h2>
                        <p className="font-semibold text-white">{portalTitle}</p>
                        <p className="text-[#D9EFE3]">{portalSubtitle}</p>
                        {(agencyAddress || agencyCity) && (
                            <p className="flex gap-2 leading-relaxed text-[#D9EFE3]">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                {[agencyAddress, agencyCity].filter(Boolean).join(', ')}
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-white">E-SKM</h2>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                            {navLinks.map((item) => (
                                <li key={item.id}>
                                    <a href={item.href} className={footerLink}>
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <Link href={surveyHref} className={footerLink}>
                                    Mulai Survei
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-white">Tautan Lainnya</h2>
                        <ul className="space-y-2.5">
                            <li>
                                <a href="https://www.menpan.go.id" target="_blank" rel="noopener noreferrer" className={footerLink}>
                                    Kementerian PANRB
                                    <span className="sr-only"> (tab baru)</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://www.lapor.go.id" target="_blank" rel="noopener noreferrer" className={footerLink}>
                                    SP4N-LAPOR!
                                    <span className="sr-only"> (tab baru)</span>
                                </a>
                            </li>
                            <li>
                                <Link href={staffHref} className={footerLink}>
                                    {staffLabel}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-start gap-3 lg:justify-end">
                        <img src="/images/skm/logo-loket-putih.svg" alt="" className="h-14 w-14 shrink-0" />
                        <div className="leading-tight">
                            <p className="text-3xl font-extrabold tracking-tight text-white">E-SKM</p>
                            <p className="mt-1 max-w-[200px] text-xs text-[#D9EFE3]">{portalTitle}</p>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/15">
                    <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-[#D9EFE3] sm:px-6 lg:px-8">
                        &copy; {new Date().getFullYear()} {portalTitle}. Survei Kepuasan Masyarakat sesuai Permenpan-RB Nomor 14 Tahun 2017.
                    </p>
                </div>
            </footer>
        </div>
    );
}
