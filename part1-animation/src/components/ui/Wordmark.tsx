interface WordmarkProps {
  className?: string
}

export function Wordmark({ className = '' }: WordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-2 font-display ${className}`}>
      <svg viewBox="0 0 32 20" className="h-[0.72em] w-auto shrink-0" aria-hidden="true">
        <path
          d="M2 14C6 2 10 2 16 10s10 8 14-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-extrabold tracking-[-0.02em]">DCBA</span>
    </span>
  )
}
