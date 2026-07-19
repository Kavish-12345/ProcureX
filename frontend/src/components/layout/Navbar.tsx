import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';

export function Navbar() {
    const user = useAuthStore((state) => state.user);
    const { mutate: logout, isPending } = useLogout();

    return (
        <header className="flex h-14 items-center justify-between border-b bg-background px-6">
            <div className="text-sm text-muted-foreground">
                {user?.businessName}
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{user?.role}</span>
                <button
                    onClick={() => logout()}
                    disabled={isPending}
                    className="text-sm font-medium text-destructive disabled:opacity-50"
                >
                    {isPending ? 'Logging out...' : 'Logout'}
                </button>
            </div>
        </header>
    );
}