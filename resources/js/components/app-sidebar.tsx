import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { skmRoute } from '@/lib/skm-utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpenCheck, Building2, Calculator, ClipboardList, Home, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            url: skmRoute('dashboard', undefined, '/dashboard'),
            icon: LayoutGrid,
        },
        {
            title: 'Instansi',
            url: skmRoute('agencies.index', undefined, '/instansi'),
            icon: Building2,
        },
        {
            title: 'Periode Survei',
            url: skmRoute('periods.index', undefined, '/periode'),
            icon: ClipboardList,
        },
        {
            title: 'Kalkulator',
            url: skmRoute('calculator', undefined, '/kalkulator'),
            icon: Calculator,
        },
        {
            title: 'Panduan',
            url: skmRoute('guide', undefined, '/panduan'),
            icon: BookOpenCheck,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={skmRoute('dashboard', undefined, '/dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="sm" className="text-sidebar-foreground/80 hover:text-sidebar-foreground">
                            <Link href={skmRoute('home', undefined, '/')}>
                                <Home className="h-4 w-4" />
                                <span>Halaman Publik</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
