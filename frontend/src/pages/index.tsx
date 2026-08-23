import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

interface FlowEntry {
  code: string
  actor: string
  title: string
  body: string
  entry: string
}

const flow: FlowEntry[] = [
  {
    code: '01',
    actor: 'Retailer',
    title: 'Places an order',
    body: 'Pick a connected supplier, add line items. Price and stock are locked the moment the order is placed.',
    entry: '+ ₹18,400 owed',
  },
  {
    code: '02',
    actor: 'Supplier',
    title: 'Confirms and ships',
    body: 'Confirming an order books the due date straight to the ledger and reserves stock automatically.',
    entry: 'Due in 4 days',
  },
  {
    code: '03',
    actor: 'Both',
    title: 'Ledger settles itself',
    body: 'Every confirmed order becomes a dated entry. Mark it paid, and the account closes — no spreadsheet required.',
    entry: '− ₹18,400 cleared',
  },
]

const brandName = 'ProcureX'

function LandingPage() {
  return (
    <div className="h-screen overflow-hidden bg-white text-black">
      <SiteHeader />
      <Hero />
    </div>
  )
}

function SiteHeader() {
  return (
    <header className="border-b border-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
        <span className="text-[15px] font-bold tracking-tight">{brandName}</span>
        <nav className="flex items-center gap-7 text-sm">
          <a href="#flow" className="text-black/50 transition-colors hover:text-black">
            How it works
          </a>
          <Link to={"/auth/login" as any} className="text-black/50 transition-colors hover:text-black">
            Log in
          </Link>
          <Link
            to={"/auth/signup" as any}
            className="border border-black bg-black px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
          >
            Open an account
          </Link>
        </nav>
      </div>
    </header>
  )
}

function useTicker(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.floor(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function Hero() {
  const cleared = useTicker(12480)

  return (
    <section className="mx-auto grid h-[calc(100vh-57px)] max-w-6xl grid-cols-1 gap-10 px-8 py-8 md:grid-cols-[1fr_1px_1fr]">
      {/* Left: headline + CTA */}
      <div className="flex flex-col justify-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
          Statement of account — trade ledger for retailers &amp; suppliers
        </p>

        <h1 className="mt-5 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.05] tracking-tight">
          Every order, every rupee owed, on one running account.
        </h1>

        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-black/60">
          Retailers order from connected suppliers. Suppliers confirm, ship, and get
          paid. The ledger updates itself at every step — no manual reconciliation,
          no chasing dues in a notebook.
        </p>

        <div className="mt-8 flex items-center gap-6">
          <Link
            to={"/auth/signup" as any}
            className="border border-black bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
          >
            Open an account
          </Link>
          <a href="#flow" className="text-sm font-medium text-black/50 underline underline-offset-4 hover:text-black">
            See how it works
          </a>
        </div>

        {/* Stats row, compact */}
        <div className="mt-10 grid max-w-md grid-cols-3 divide-x divide-black border-t border-black pt-4">
          <div className="pr-4">
            <div className="font-mono text-lg font-bold tabular-nums">{cleared.toLocaleString('en-IN')}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wide text-black/45">Orders settled</div>
          </div>
          <div className="px-4">
            <div className="font-mono text-lg font-bold tabular-nums">4.2d</div>
            <div className="mt-1 text-[10px] uppercase tracking-wide text-black/45">Dues cleared in</div>
          </div>
          <div className="pl-4">
            <div className="font-mono text-lg font-bold tabular-nums">860</div>
            <div className="mt-1 text-[10px] uppercase tracking-wide text-black/45">Suppliers</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden bg-black md:block" />

      {/* Right: flow, compact, fits without scroll */}
      <div id="flow" className="flex flex-col justify-center">
        <h2 className="text-lg font-bold tracking-tight">One order, three entries.</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-black/55">
          Every transaction touches both sides of the account at once.
        </p>

        <div className="mt-6 divide-y divide-black border-y border-black">
          {flow.map((step) => (
            <div key={step.title} className="grid grid-cols-[36px_1fr] gap-4 py-4">
              <span className="pt-0.5 font-mono text-xs font-bold text-black/40">{step.code}</span>
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[15px] font-bold">{step.title}</h3>
                  <span className="whitespace-nowrap font-mono text-[11px] text-black/45">{step.entry}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-black/55">{step.body}</p>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-black/35">
                  {step.actor}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}