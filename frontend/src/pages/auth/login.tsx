import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useLogin } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

const brandName = "ProcureX";

function extractErrors(error: unknown) {
  if (error && typeof error === "object" && "response" in error) {
    const data = (error as any).response?.data;
    const fieldErrors: Record<string, string[]> = {};
    const properties = data?.errors?.properties;
    if (properties) {
      for (const key in properties) {
        if (properties[key]?.errors?.length) {
          fieldErrors[key] = properties[key].errors;
        }
      }
    }
    const generalMessage =
      Object.keys(fieldErrors).length > 0
        ? (data?.message ?? "Please fix the errors below")
        : (data?.message ?? "Login failed. Please try again.");
    return { fieldErrors, generalMessage };
  }
  return { fieldErrors: {}, generalMessage: "Login failed. Please try again." };
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending, error } = useLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Logged in successfully!");
        },
        onError: (err) => {
          const { generalMessage } = extractErrors(err);
          toast.error(generalMessage);
        },
      },
    );
  }

  const { fieldErrors } = extractErrors(error);

  return (
    <div className="h-screen overflow-hidden bg-white text-black">
      <header className="border-b border-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to={"/" as any}
              className="hidden items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-black transition-colors hover:text-black/70 sm:flex"
            >
              ← Back to home
            </Link>
          </div>
          <nav className="flex items-center gap-4 text-sm sm:gap-7">
            <span className="hidden text-black/50 sm:inline">New here?</span>
            <Link
              to={"/auth/signup" as any}
              className="border border-black bg-black px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
            >
              Open an account
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto grid h-[calc(100vh-57px)] max-w-6xl grid-cols-1 gap-10 px-8 py-6 md:grid-cols-[1fr_1px_1fr]">
        <div className="flex flex-col justify-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
            Statement access
          </p>
          <h1 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] font-normal leading-[1.05] tracking-tight">
            Log in to your account.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-black/60">
            Every order, every rupee owed — right where you left it. Your ledger
            picks up exactly where it stopped.
          </p>

          <div className="mt-8 max-w-md border-t border-black pt-4">
            <p className="text-[13px] text-black/50">
              Don't have an account?{" "}
              <Link
                to={"/auth/signup" as any}
                className="font-semibold text-black underline underline-offset-4"
              >
                Open one →
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden bg-black md:block" />

        <div className="flex flex-col justify-center">
          <h2 className="font-serif text-lg font-normal tracking-tight">
            Log in
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-black/55">
            Enter your credentials to access your account.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-4 border-t border-black pt-5"
          >
            <div>
              <label
                htmlFor="email"
                className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-black/20 bg-white px-3.5 py-2.5 text-sm placeholder:text-black/30 outline-none transition-colors focus:border-black"
                placeholder="you@business.com"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-red-600">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border border-black/20 bg-white px-3.5 py-2.5 text-sm placeholder:text-black/30 outline-none transition-colors focus:border-black"
                placeholder="••••••••"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] text-red-600">
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full border border-black bg-black py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
