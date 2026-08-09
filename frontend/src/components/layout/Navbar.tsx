import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';

export function Navbar() {
    const user = useAuthStore((state) => state.user);
    const { mutate: logout, isPending } = useLogout();

    return (
        <header className="flex h-14 items-center justify-between border-b border-black bg-white px-6">
            <div className="font-mono text-[11px] uppercase tracking-wide text-black ">
                {user?.businessName}
            </div>
            <div className="flex items-center gap-4">
                <span className="border border-black/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">
                    {user?.role}
                </span>
                <button
                    onClick={() => logout()}
                    disabled={isPending}
                    className="font-mono cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-black underline underline-offset-4 disabled:opacity-50"
                >
                    {isPending ? 'Logging out…' : 'Logout'}
                </button>
            </div>
        </header>
    );
}