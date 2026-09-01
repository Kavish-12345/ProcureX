export function LoadingSpinner({ label = 'Loading…', className }: { label?: string; className?: string }) {
    return (
        <div className={`flex flex-col items-center justify-center gap-3 p-8 ${className ?? ''}`}>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/15 border-t-black" />
            <p className="font-mono text-[11px] uppercase tracking-wide text-black/40">{label}</p>
        </div>
    );
}
