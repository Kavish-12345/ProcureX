import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAdminLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { extractErrors } from '@/lib/utils';

// Deliberately unguarded — this is the way in to the admin area, so requiring
// admin to view it would lock everyone out.
export const Route = createFileRoute('/admin/login')({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: adminLogin, isPending, error } = useAdminLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    adminLogin(
      { email, password },
      {
        onSuccess: () => toast.success('Signed in as administrator'),
        onError: (err) => {
          const { generalMessage } = extractErrors(err, 'Sign in failed. Please try again.');
          toast.error(generalMessage);
        },
      },
    );
  }

  const { fieldErrors, generalMessage } = extractErrors(error, '');

  return (
    <div className="flex h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-white/60" strokeWidth={2} />
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            ProcureX Admin
          </p>
        </div>

        <h1 className="mt-4 font-serif text-3xl font-normal leading-tight tracking-tight">
          Administrator sign in.
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-white/50">
          Restricted area. Retailer and supplier accounts should sign in from the
          main login page.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4 border-t border-white/20 pt-6">
          <div>
            <label
              htmlFor="email"
              className="font-mono text-[10px] font-semibold uppercase tracking-wide text-white/45"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-white/25 bg-transparent px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-white"
              placeholder="admin@procurex.com"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-[11px] text-red-400">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="font-mono text-[10px] font-semibold uppercase tracking-wide text-white/45"
            >
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-white/25 bg-transparent px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-[11px] text-red-400">{fieldErrors.password[0]}</p>
            )}
          </div>

          {generalMessage && (
            <p className="text-[12px] text-red-400">{generalMessage}</p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="w-full border border-white bg-white text-black hover:bg-transparent hover:text-white"
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
