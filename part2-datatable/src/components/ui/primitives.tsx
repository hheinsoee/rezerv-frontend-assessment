import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-700 disabled:hover:bg-slate-900',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:hover:bg-white',
  ghost: 'text-slate-600 hover:bg-slate-100 disabled:hover:bg-transparent',
}

export function Button({ variant = 'secondary', className, type, ...props }: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium',
        'transition-colors motion-reduce:transition-none',
        'disabled:cursor-not-allowed disabled:opacity-40',
        BUTTON_VARIANTS[variant],
        focusRing,
        className,
      )}
      {...props}
    />
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {

  label: string
}

export function IconButton({ label, className, type, ...props }: IconButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-8 items-center justify-center border border-slate-300 bg-white text-slate-600',
        'transition-colors hover:bg-slate-50 motion-reduce:transition-none',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white',
        focusRing,
        className,
      )}
      {...props}
    />
  )
}

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'text-slate-600',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-rose-700',
  info: 'text-sky-700',
}

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={cn('text-xs font-medium whitespace-nowrap', BADGE_TONES[tone])}>
      {children}
    </span>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export function Select({ label, className, id, ...props }: SelectProps) {
  return (
    <select
      id={id}
      aria-label={label}
      className={cn(
        'border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700',
        'transition-colors hover:bg-slate-50 motion-reduce:transition-none',
        focusRing,
        className,
      )}
      {...props}
    />
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'block h-4 bg-slate-200/80 motion-safe:animate-pulse',
        className,
      )}
    />
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <label className="inline-flex items-center gap-2 px-2 py-1 text-sm text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}

export function RadioGroup<TValue extends string>({
  name,
  legend,
  value,
  onChange,
  options,
}: {
  name: string
  legend: string
  value: TValue
  onChange: (next: TValue) => void
  options: { value: TValue; label: string }[]
}) {
  return (
    <fieldset className="flex items-center gap-3">
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}
