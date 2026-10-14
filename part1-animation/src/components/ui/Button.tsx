import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'invert'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const SHELL =
  'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-pill px-6 py-3 text-sm font-semibold ' +
  'transition-transform duration-[var(--dur-base)] ease-out-back hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'

const VARIANT: Record<Variant, { shell: string; sweep: string; label: string }> = {
  primary: {
    shell: 'bg-green text-ink',
    sweep: 'bg-ink',
    label: 'group-hover:text-paper',
  },
  ghost: {
    shell: 'border border-ink/20 text-ink',
    sweep: 'bg-ink',
    label: 'group-hover:text-paper',
  },
  invert: {
    shell: 'bg-paper text-ink',
    sweep: 'bg-green',
    label: 'group-hover:text-ink',
  },
}

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const styles = VARIANT[variant]
  return (
    <button type="button" className={`${SHELL} ${styles.shell} ${className}`} {...rest}>
      <span
        aria-hidden="true"
        className={`absolute inset-0 origin-bottom scale-y-0 transition-transform duration-[var(--dur-base)] ease-out-expo group-hover:scale-y-100 ${styles.sweep}`}
      />
      <span
        className={`relative flex items-center gap-2 transition-colors duration-[var(--dur-base)] ${styles.label}`}
      >
        {children}
      </span>
    </button>
  )
}
