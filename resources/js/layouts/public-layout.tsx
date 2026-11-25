import { FlashNotifier } from '@/components/skm/flash-banner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { skmRoute } from '@/lib/skm-utils';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpenCheck, Calculator, Home, LayoutGrid, LogIn, Menu } from 'lucide-react';
import { useState } from 'react';

interface PublicLayoutProps {
    children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const currentPath = page.url.split('?')[0];
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { label: 'Beranda', href: skmRoute('home', undefined, '/'), match: '/', icon: Home },
        { label: 'Kalkulator IKM', href: skmRoute('calculator', undefined, '/kalkulator'), match: '/kalkulator', icon: Calculator },
        { label: 'Panduan 9 Unsur', href: skmRoute('guide', undefined, '/panduan'), match: '/panduan', icon: BookOpenCheck },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
                <div className="h-1 w-full bg-gradient-to-r from-[#0F2744] via-[#1E4E8C] to-[#C9962B]" />
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href={skmRoute('home', undefined, '/')} className="flex items-center gap-3 focus-visible:outline-none">
                        <img src="/images/skm/logo.svg" alt="Logo SKM Synectra" className="h-9 w-9 shrink-0" />
                        <div className="leading-tight">
                            <span className="block text-base font-bold tracking-tight text-[#0F2744] dark:text-white">SKM Synectra</span>
                            <span className="block text-[11px] font-medium text-muted-foreground">
                                Pedoman Permenpan-RB No. 14 Tahun 2017
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi publik">
                        {navLinks.map((item) => {
                            const active = item.match === '/' ? currentPath === '/' : currentPath.startsWith(item.match);
                            return (
                                <Link
                                    key={item.match}
                                    href={item.href}
                                    className={cn(
                                        'rounded-md px-3.5 py-2 text-sm font-medium transition-colors',
                                        active
                                            ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="hidden items-center gap-2.5 md:flex">
                        {auth?.user ? (
                            <Button asChild size="sm">
                                <Link href={skmRoute('dashboard', undefined, '/dashboard')}>
                                    <LayoutGrid className="mr-1.5 h-4 w-4" />
                                    Buka Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={skmRoute('login', undefined, '/login')}>
                                        <LogIn className="mr-1.5 h-4 w-4" />
                                        Masuk Operator
                                    </Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href={skmRoute('calculator', undefined, '/kalkulator')}>
                                        Hitung Cepat
                                        <ArrowRight className="ml-1.5 h-4 w-4" />
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>

                    <div className="md:hidden">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" aria-label="Buka menu navigasi">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-2 text-left">
                                        <img src="/images/skm/logo.svg" alt="Logo SKM" className="h-7 w-7" />
                                        <span>SKM Synectra</span>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 flex flex-col gap-2">
                                    {navLinks.map((item) => {
                                        const Icon = item.icon;
                                        const active = item.match === '/' ? currentPath === '/' : currentPath.startsWith(item.match);
                                        return (
                                            <Link
                                                key={item.match}
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={cn(
                                                    'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium',
                                                    active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                    <div className="my-2 border-t" />
                                    {auth?.user ? (
                                        <Button asChild className="w-full justify-start" onClick={() => setMobileOpen(false)}>
                                            <Link href={skmRoute('dashboard', undefined, '/dashboard')}>
                                                <LayoutGrid className="mr-2 h-4 w-4" />
                                                Buka Dashboard
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button asChild className="w-full justify-start" onClick={() => setMobileOpen(false)}>
                                            <Link href={skmRoute('login', undefined, '/login')}>
                                                <LogIn className="mr-2 h-4 w-4" />
                                                Masuk Operator
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
                    <FlashNotifier />
                </div>
                {children}
            </main>

            <footer className="border-t bg-card">
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <img src="/images/skm/logo.svg" alt="Logo SKM Synectra" className="h-8 w-8" />
                        <div>
                            <p className="font-semibold text-foreground">SKM Synectra — Pengolah Survei Kepuasan Masyarakat</p>
                            <p className="text-xs">
                                Mengacu pada Peraturan Menteri PANRB Nomor 14 Tahun 2017 · Data responden disimpan secara anonim.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                        <Link href={skmRoute('calculator', undefined, '/kalkulator')} className="hover:text-foreground">
                            Kalkulator IKM
                        </Link>
                        <Link href={skmRoute('guide', undefined, '/panduan')} className="hover:text-foreground">
                            Panduan &amp; Rumus
                        </Link>
                        <Link href={skmRoute('login', undefined, '/login')} className="hover:text-foreground">
                            Masuk Panel Instansi
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
