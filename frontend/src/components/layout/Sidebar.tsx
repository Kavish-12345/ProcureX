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
        <aside className="flex h-screen w-56 flex-col border-r bg-background">
            <div className="border-b px-4 py-4">
                <span className="text-lg font-semibold">SupplyChain</span>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-3">
                {links.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground [&.active]:bg-muted [&.active]:text-foreground"
                        activeProps={{ className: 'active' }}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}