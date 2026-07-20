import { Link } from '@tanstack/react-router';
import { useAuthStore } from '@/store/authStore';

interface NavLink {
    label: string;
    to: string;
}

const retailerLinks: NavLink[] = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Orders', to: '/orders' },
    { label: 'Suppliers', to: '/suppliers' },
    { label: 'Dues', to: '/ledger' },
];

const supplierLinks: NavLink[] = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Products', to: '/products' },
    { label: 'Orders', to: '/orders' },
    { label: 'Receivables', to: '/ledger' },
];

export function Sidebar() {
    const user = useAuthStore((state) => state.user);
    const links = user?.role === 'SUPPLIER' ? supplierLinks : retailerLinks;

    return (
        <aside className="flex h-screen w-56 flex-col border-r border-black bg-white">
            <div className="border-b border-black px-5 py-4">
                <span className="font-mono text-[15px] font-bold tracking-tight text-black">
                    ProcureX
                </span>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-3">
                {links.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-black/50 transition-colors hover:text-black [&.active]:bg-black [&.active]:text-white"
                        activeProps={{ className: 'active' }}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}