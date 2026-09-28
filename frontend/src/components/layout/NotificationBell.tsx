import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Bell } from 'lucide-react';
import {
    useNotifications,
    useUnreadNotificationCount,
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
} from '@/hooks/useNotifications';
import type { Notification } from '@/types';

function formatWhen(iso: string) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const { data: unreadCount = 0 } = useUnreadNotificationCount();
    // The list is only fetched once the panel is opened — while it's closed,
    // the polled badge count is all that's needed.
    const { data, isLoading } = useNotifications({ limit: 10 }, { enabled: open });
    const notifications = data?.notifications ?? [];

    const { mutate: markRead } = useMarkNotificationRead();
    const { mutate: markAllRead } = useMarkAllNotificationsRead();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleClick(notification: Notification) {
        if (!notification.isRead) markRead(notification.id);
        setOpen(false);
        if (notification.orderId) navigate({ to: '/orders' });
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                className="relative flex h-9 w-9 items-center justify-center border border-black/15 transition-colors hover:border-black"
            >
                <Bell className="h-4 w-4 text-black/70" strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center bg-black px-1 font-mono text-[9px] font-semibold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute top-[calc(100%+6px)] right-0 w-80 border border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50">
                            Notifications
                        </p>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={() => markAllRead()}
                                className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/50 underline underline-offset-2 transition-colors hover:text-black"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {isLoading ? (
                            <p className="px-4 py-6 text-center text-[12px] text-black/45">Loading…</p>
                        ) : notifications.length === 0 ? (
                            <p className="px-4 py-6 text-center text-[12px] text-black/45">
                                Nothing yet.
                            </p>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    type="button"
                                    onClick={() => handleClick(n)}
                                    className={`flex w-full flex-col items-start gap-0.5 border-b border-black/10 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-black/[0.03] ${
                                        n.isRead ? 'opacity-55' : ''
                                    }`}
                                >
                                    <span className="flex w-full items-start gap-2">
                                        {!n.isRead && (
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-black" />
                                        )}
                                        <span className="text-[13px] leading-snug text-black">
                                            {n.message}
                                        </span>
                                    </span>
                                    <span className="pl-3.5 font-mono text-[10px] uppercase tracking-wide text-black/40">
                                        {formatWhen(n.createdAt)}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
