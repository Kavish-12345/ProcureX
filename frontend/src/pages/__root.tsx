import * as React from 'react'
import { Outlet, Link, createRootRoute } from '@tanstack/react-router'
import { Wordmark } from '@/components/shared/Wordmark'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
})

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  )
}

function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white text-center text-black">
      <Wordmark />
      <p className="mt-8 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
        404
      </p>
      <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight">
        This page doesn't exist.
      </h1>
      <p className="mt-3 max-w-sm text-[14px] text-black/55">
        The page you're looking for isn't here — it may have moved, or the link might be wrong.
      </p>
      <Link
        to="/"
        className="mt-8 border border-black bg-black px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
      >
        Back to home
      </Link>
    </div>
  )
}