import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useResetPassword } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { extractErrors } from "@/lib/utils";

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: resetPassword, isPending, error } = useResetPassword();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    resetPassword(
      { token, password },
      {
        onSuccess: () => {
          toast.success("Password reset successful. Please log in.");
        },
        onError: (err) => {
          const { generalMessage } = extractErrors(err, "Reset failed. Please try again.");
          toast.error(generalMessage);
        },
      },
    );
  }

  const { fieldErrors } = extractErrors(error, "Reset failed. Please try again.");

  return (
    <div className="h-screen overflow-hidden bg-white text-black">
      <header className="border-b border-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <Link
            to={"/auth/login" as any}
            className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-black/50 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back to login
          </Link>
        </div>
      </header>
      <main className="mx-auto flex h-[calc(100vh-57px)] max-w-md flex-col justify-center px-8">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
          Account recovery
        </p>
        <h1 className="mt-4 font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] font-normal leading-[1.05] tracking-tight">
          Set a new password.
        </h1>

        {!token ? (
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-red-600">
            This reset link is missing its token. Request a new one from the{" "}
            <Link
              to={"/auth/forgot-password" as any}
              className="font-semibold underline underline-offset-4"
            >
              forgot password
            </Link>{" "}
            page.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 border-t border-black pt-5"
          >
            <div>
              <label
                htmlFor="password"
                className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45"
              >
                New password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-black/20 bg-white px-3.5 py-2.5 pr-10 text-sm placeholder:text-black/30 outline-none transition-colors focus:border-black"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-black/35 transition-colors hover:text-black"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
                </button>
              </div>
              {fieldErrors.password && (
                <ul className="mt-1 space-y-0.5">
                  {fieldErrors.password.map((msg, i) => (
                    <li key={i} className="text-[11px] text-red-600">
                      • {msg}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45"
              >
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full border border-black/20 bg-white px-3.5 py-2.5 text-sm placeholder:text-black/30 outline-none transition-colors focus:border-black"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Resetting…" : "Reset password"}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
