type BadgeTone = 'neutral' | 'active' | 'filled' | 'muted' | 'strikethrough'

const toneStyles: Record<BadgeTone, string> = {
  neutral: 'border-black/30 text-black/60',
  active: 'border-black text-black',
  filled: 'border-black bg-black text-white',
  muted: 'border-black bg-black/5 text-black',
  strikethrough: 'border-black/20 text-black/30 line-through',
}

export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  return (
    <span
      className={`inline-block border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide ${toneStyles[tone]}`}
    >
      {label}
    </span>
  )
}
