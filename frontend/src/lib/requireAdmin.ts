import { redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/store/authStore';

// UX only, NOT security. The auth store is persisted to localStorage, so anyone
// can set role to ADMIN in devtools and reach these pages — they'd just see empty
// tables, because every admin endpoint is gated by requireRole('ADMIN') on the
// server. This exists so a non-admin gets redirected instead of a broken page.
export function requireAdmin() {
  const { user } = useAuthStore.getState();

  // Nobody signed in: they were probably heading for the admin portal, so send
  // them to its login rather than the customer-facing one.
  if (!user) {
    throw redirect({ to: '/admin/login' });
  }

  // Signed in as a retailer or supplier: they aren't lost, they just don't
  // belong here — offering them an admin login would only be confusing.
  if (user.role !== 'ADMIN') {
    throw redirect({ to: '/dashboard' });
  }
}
