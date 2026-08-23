import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useSignUp } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth/signup")({
  component: SignupPage,
});

type Role = "RETAILER" | "SUPPLIER";

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
        : (data?.message ?? "Signup failed. Please try again.");
    return { fieldErrors, generalMessage };
  }
  return {
    fieldErrors: {},
    generalMessage: "Signup failed. Please try again.",
  };
}

function SignupPage() {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("RETAILER");
  const { mutate: signup, isPending, error } = useSignUp();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    signup(
      { name, businessName, email, phone, password, role },
      {
        onSuccess: () => {
          toast.success("Account created successfully!");
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-3">
          <Link
            to={"/" as any}
            className="hidden items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-black transition-colors hover:text-black/70 sm:flex"
          >
            ← Back to home
          </Link>
          <nav className="flex items-center gap-4 text-sm sm:gap-7">
            <span className="hidden text-black/50 sm:inline">
              Already on the ledger?
            </span>
            <Link
              to={"/auth/login" as any}
              className="border border-black bg-black px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid h-[calc(100vh-53px)] max-w-6xl grid-cols-1 gap-10 overflow-hidden px-8 py-5 md:grid-cols-[1fr_1px_1.2fr]">
        <div className="flex flex-col justify-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
            Open a new account
          </p>
          <h1 className="mt-3 font-serif text-[clamp(1.6rem,3.5vw,2.75rem)] font-normal leading-[1.05] tracking-tight">
            Start your running account.
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-black/60">
            Free to open. No card required. Choose whether you're placing orders
            or receiving them — you can always connect with the other side
            later.
          </p>

          <div className="mt-6 max-w-md border-t border-black pt-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45">
              Account type
            </span>
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              {(["RETAILER", "SUPPLIER"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    role === r
                      ? "border-black bg-black text-white"
                      : "border-black/20 text-black/50 hover:border-black"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-5 text-[13px] text-black/50">
            Already have an account?{" "}
            <Link
              to={"/auth/login" as any}
              className="font-semibold text-black underline underline-offset-4"
            >
              Log in →
            </Link>
          </p>
        </div>

        <div className="hidden bg-black md:block" />

        <div className="flex flex-col justify-center">
          <h2 className="font-serif text-base font-normal tracking-tight">
            Account details
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-black/55">
            Tell us who's opening the ledger.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-4 space-y-3 border-t border-black pt-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45"
                >
                  Full name
                </label>
                <input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full border border-black/20 bg-white px-3.5 py-2 text-sm placeholder:text-black/30 outline-none transition-colors focus:border-black"
                  placeholder="Kavish Srivastava"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {fieldErrors.name[0]}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="businessName"
                  className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45"
                >
                  Business name
                </label>
                <input
                  id="businessName"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-1.5 w-full border border-black/20 bg-white px-3.5 py-2 text-sm placeholder:text-black/30 outline-none transition-colors focus:border-black"
                  placeholder="Your business"
                />
                {fieldErrors.businessName && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {fieldErrors.businessName[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                  className="mt-1.5 w-full border border-black/20 bg-white px-3.5 py-2 text-sm placeholder:text-black/30 outline-none transition-colors focus:border-black"
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
                  htmlFor="phone"
                  className="font-mono text-[10px] font-semibold uppercase tracking-wide text-black/45"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 w-full border border-black/20 bg-white px-3.5 py-2 text-sm placeholder:text-black/30 outline-none transition-colors focus:border-black"
                  placeholder="+91 98765 43210"
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {fieldErrors.phone[0]}
                  </p>
                )}
              </div>
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
                className="mt-1.5 w-full border border-black/20 bg-white px-3.5 py-2 text-sm placeholder:text-black/30 outline-none transition-colors focus:border-black"
                placeholder="••••••••"
              />
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

            <button
              type="submit"
              disabled={isPending}
              className="w-full border border-black bg-black py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Opening account…" : "Open an account"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
