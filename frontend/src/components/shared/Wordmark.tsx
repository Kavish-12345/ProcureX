export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`text-[15px] font-bold tracking-tight text-black ${className ?? ''}`}>
      ProcureX
    </span>
  )
}
