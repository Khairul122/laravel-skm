import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

function isPathActive(currentUrl: string, itemUrl: string): boolean {
    const cleanCurrent = currentUrl.split('?')[0];
    let targetPath = itemUrl;
    try {
        if (itemUrl.startsWith('http://') || itemUrl.startsWith('https://')) {
            targetPath = new URL(itemUrl).pathname;
        }
    } catch {
        targetPath = itemUrl;
    }

    if (targetPath === '/' || targetPath === '/dashboard') {
        return cleanCurrent === targetPath;
    }

    return cleanCurrent === targetPath || cleanCurrent.startsWith(`${targetPath}/`);
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Menu Utama SKM</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isPathActive(page.url, item.url)} tooltip={item.title}>
                            <Link href={item.url} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
