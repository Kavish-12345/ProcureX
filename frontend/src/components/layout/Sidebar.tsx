import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { LayoutDashboard, ClipboardList, Users, Receipt, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Wordmark } from '@/components/shared/Wordmark';

interface NavLink {
    label: string;
    to: string;
    icon: typeof LayoutDashboard;
}

const retailerLinks: NavLink[] = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Orders', to: '/orders', icon: ClipboardList },
    { label: 'Suppliers', to: '/suppliers', icon: Users },
    { label: 'Dues', to: '/ledger', icon: Receipt },
];

const supplierLinks: NavLink[] = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', to: '/products', icon: Package },
    { label: 'Orders', to: '/orders', icon: ClipboardList },
    { label: 'Receivables', to: '/ledger', icon: Receipt },
];

export function Sidebar() {
    const user = useAuthStore((state) => state.user);
    const links = user?.role === 'SUPPLIER' ? supplierLinks : retailerLinks;
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`flex h-screen flex-col border-r border-black bg-white transition-[width] duration-150 ${
                collapsed ? 'w-16' : 'w-56'
            }`}
        >
            <div className={`flex h-14 items-center border-b border-black ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
                {!collapsed && <Wordmark />}
                <button
                    type="button"
                    onClick={() => setCollapsed((c) => !c)}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="flex h-7 w-7 items-center justify-center text-black/40 transition-colors hover:text-black"
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-3">
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            title={collapsed ? link.label : undefined}
                            className={`flex items-center gap-2.5 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-black/50 transition-colors hover:text-black [&.active]:bg-black [&.active]:text-white ${
                                collapsed ? 'justify-center' : ''
                            }`}
                            activeProps={{ className: 'active' }}
                        >
                            <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                            {!collapsed && <span>{link.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
