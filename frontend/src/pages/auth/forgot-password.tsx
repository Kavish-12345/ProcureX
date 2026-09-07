import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useForgotPassword } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { extractErrors } from "@/lib/utils";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { mutate: forgotPassword, isPending, error } = useForgotPassword();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    forgotPassword(
      { email },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
        onError: (err) => {
          const { generalMessage } = extractErrors(err, "Something went wrong. Please try again.");
          toast.error(generalMessage);
        },
      },
    );
  }

  const { fieldErrors } = extractErrors(error, "Something went wrong. Please try again.");

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
          Reset your password.
        </h1>

        {submitted ? (
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-black/60">
            If that email is registered, a password reset link has been sent.
            Check the address you entered and follow the link to set a new
            password.
          </p>
        ) : (
          <>
            <p className="mt-5 max-w-md text-[14px] leading-relaxed text-black/60">
              Enter the email on your account and we'll send you a link to
              reset your password.
            </p>
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4 border-t border-black pt-5"
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

              <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
