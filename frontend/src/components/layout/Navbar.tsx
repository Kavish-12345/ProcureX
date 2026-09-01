import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';

export function Navbar() {
    const user = useAuthStore((state) => state.user);
    const { mutate: logout, isPending } = useLogout();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const initial = user?.businessName?.charAt(0).toUpperCase() ?? '?';

    return (
        <header className="flex h-14 items-center justify-between border-b border-black bg-white px-6">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-black">
                <Building2 className="h-3.5 w-3.5 text-black/40" strokeWidth={2} />
                {user?.businessName}
            </div>

            <div className="relative" ref={menuRef}>
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="flex items-center gap-2.5 border border-black/15 py-1.5 pr-3 pl-1.5 transition-colors hover:border-black"
                >
                    <span className="flex h-7 w-7 items-center justify-center bg-black font-mono text-[11px] font-semibold text-white">
                        {initial}
                    </span>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/60">
                        {user?.role}
                    </span>
                    <ChevronDown
                        className={`h-3.5 w-3.5 text-black/40 transition-transform ${open ? 'rotate-180' : ''}`}
                        strokeWidth={2}
                    />
                </button>

                {open && (
                    <div className="absolute top-[calc(100%+6px)] right-0 w-56 border border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                        <div className="border-b border-black/10 px-4 py-3">
                            <p className="font-serif text-[14px] text-black">{user?.name}</p>
                            <p className="mt-0.5 truncate text-[11px] text-black/45">{user?.email}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => logout()}
                            disabled={isPending}
                            className="flex w-full items-center gap-2 px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-black transition-colors hover:bg-black hover:text-white disabled:opacity-50"
                        >
                            <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                            {isPending ? 'Logging out…' : 'Logout'}
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
