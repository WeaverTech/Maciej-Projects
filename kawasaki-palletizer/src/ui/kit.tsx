import { X } from 'lucide-react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

/* ------------------------------------------------------------------ przyciski */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
  icon?: ReactNode
  block?: boolean
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover shadow-soft border border-transparent',
  secondary: 'bg-panel text-fg border border-line-strong/70 hover:bg-hover shadow-soft',
  ghost: 'text-muted hover:text-fg hover:bg-hover border border-transparent',
  danger: 'bg-danger text-white hover:brightness-110 border border-transparent shadow-soft',
}

export function Button({ variant = 'secondary', size = 'md', icon, block, className, children, type, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-colors select-none',
        'disabled:opacity-45 disabled:pointer-events-none',
        size === 'sm' ? 'h-7 px-2.5 text-[12px]' : 'h-8.5 px-3.5 text-[13px]',
        block && 'w-full',
        BUTTON_VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  shortcut?: string
  active?: boolean
  tipSide?: 'bottom' | 'top' | 'right'
  tipAlign?: 'center' | 'start' | 'end'
  size?: 'sm' | 'md'
}

export function IconButton({ label, shortcut, active, tipSide, tipAlign, size = 'md', className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      data-tip={shortcut ? `${label} (${shortcut})` : label}
      data-tip-side={tipSide}
      data-tip-align={tipAlign}
      className={cx(
        'tip inline-flex shrink-0 items-center justify-center rounded-lg transition-colors',
        'disabled:opacity-35 disabled:pointer-events-none',
        size === 'sm' ? 'size-7' : 'size-8.5',
        active ? 'bg-accent-soft text-accent-text' : 'text-muted hover:bg-hover hover:text-fg',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ pola formularzy */

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  className,
}: {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  children: ReactNode
  htmlFor?: string
  className?: string
}) {
  return (
    <div className={cx('flex flex-col gap-1', className)}>
      <label htmlFor={htmlFor} className="text-[12px] font-medium text-muted">
        {label}
      </label>
      {children}
      {error ? <p className="text-[11.5px] text-danger">{error}</p> : hint ? <p className="text-[11.5px] leading-snug text-subtle">{hint}</p> : null}
    </div>
  )
}

const INPUT_BASE =
  'h-8.5 w-full min-w-0 rounded-lg border border-line-strong/70 bg-inset px-2.5 text-[13px] text-fg shadow-soft transition-[border-color,box-shadow] ' +
  'placeholder:text-subtle hover:border-line-strong focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/20 ' +
  'disabled:opacity-50 disabled:bg-raised disabled:shadow-none'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  mono?: boolean
  invalid?: boolean
}

export function TextField({ value, onChange, mono, invalid, className, ...rest }: TextFieldProps) {
  return (
    <input
      type="text"
      spellCheck={false}
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={invalid || undefined}
      className={cx(INPUT_BASE, mono && 'font-mono text-[12.5px]', invalid && 'border-danger focus:border-danger focus:ring-danger/20', className)}
      {...rest}
    />
  )
}

function parseNumber(text: string): number | null {
  const cleaned = text.trim().replace(/\s/g, '').replace(',', '.')
  if (!cleaned || !/^[-+]?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

function formatNumber(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return ''
  const f = 10 ** decimals
  const r = Math.round(value * f) / f
  return String(Object.is(r, -0) ? 0 : r).replace('.', ',')
}

interface NumberFieldProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  decimals?: number
  unit?: string
  disabled?: boolean
  id?: string
  ariaLabel?: string
  className?: string
  integer?: boolean
}

/**
 * Pole liczbowe: zatwierdza wartość po Enter / opuszczeniu pola, strzałki ↑↓ zmieniają o krok
 * (z Shift ×10). Akceptuje przecinek i kropkę dziesiętną.
 */
export function NumberField({
  value,
  onChange,
  min,
  max,
  step = 1,
  decimals = 1,
  unit,
  disabled,
  id,
  ariaLabel,
  className,
  integer,
}: NumberFieldProps) {
  const digits = integer ? 0 : decimals
  const [text, setText] = useState(() => formatNumber(value, digits))
  const [focused, setFocused] = useState(false)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    if (!focused) setText(formatNumber(value, digits))
  }, [value, digits, focused])

  const clamp = (n: number) => {
    let v = integer ? Math.round(n) : n
    if (min !== undefined) v = Math.max(min, v)
    if (max !== undefined) v = Math.min(max, v)
    return v
  }

  const commit = (raw: string) => {
    const parsed = parseNumber(raw)
    if (parsed === null) {
      setText(formatNumber(value, digits))
      setInvalid(false)
      return
    }
    const next = clamp(parsed)
    setInvalid(false)
    setText(formatNumber(next, digits))
    if (next !== value) onChange(next)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit(text)
      e.currentTarget.select()
    } else if (e.key === 'Escape') {
      setText(formatNumber(value, digits))
      setInvalid(false)
      e.currentTarget.blur()
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const base = parseNumber(text) ?? value
      const delta = (e.key === 'ArrowUp' ? 1 : -1) * step * (e.shiftKey ? 10 : 1)
      const next = clamp(Math.round((base + delta) * 1000) / 1000)
      setText(formatNumber(next, digits))
      setInvalid(false)
      if (next !== value) onChange(next)
    }
  }

  return (
    <div className={cx('relative', className)}>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setInvalid(e.target.value.trim() !== '' && parseNumber(e.target.value) === null)
        }}
        onFocus={(e) => {
          setFocused(true)
          e.currentTarget.select()
        }}
        onBlur={() => {
          setFocused(false)
          commit(text)
        }}
        onKeyDown={onKeyDown}
        className={cx(INPUT_BASE, 'tabular-nums', unit && 'pr-9', invalid && 'border-danger focus:border-danger focus:ring-danger/20')}
      />
      {unit && (
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[11.5px] text-subtle">{unit}</span>
      )}
    </div>
  )
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  id,
  ariaLabel,
  disabled,
  className,
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string; disabled?: boolean }[]
  id?: string
  ariaLabel?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cx(INPUT_BASE, 'cursor-pointer appearance-none bg-no-repeat pr-8', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238792a6' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundPosition: 'right 8px center',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  ariaLabel,
  size = 'md',
  block,
  disabled,
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: ReactNode; title?: string; disabled?: boolean; testId?: string }[]
  ariaLabel?: string
  size?: 'sm' | 'md'
  block?: boolean
  disabled?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cx('inline-flex rounded-lg border border-line bg-raised p-0.5', block && 'flex w-full', disabled && 'opacity-50')}
    >
      {options.map((o) => {
        const selected = o.value === value
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            title={o.title}
            data-testid={o.testId}
            disabled={disabled || o.disabled}
            onClick={() => onChange(o.value)}
            className={cx(
              'inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors',
              'disabled:opacity-35 disabled:pointer-events-none',
              size === 'sm' ? 'h-6.5 px-2.5 text-[12px]' : 'h-7.5 px-3 text-[12.5px]',
              block && 'flex-1',
              selected ? 'bg-panel text-fg shadow-soft ring-1 ring-line' : 'text-muted hover:text-fg',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div className={cx('flex items-start justify-between gap-3', disabled && 'opacity-50')}>
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-[13px] font-medium text-fg">{label}</span>
        {description && <span className="block text-[11.5px] leading-snug text-subtle">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors',
          checked ? 'bg-accent' : 'bg-line-strong',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-soft transition-transform',
            checked && 'translate-x-4',
          )}
        />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ elementy panelu */

export function Section({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('flex flex-col gap-3 border-b border-line px-4 py-4 last:border-b-0', className)}>
      {(title || action) && (
        <div className="flex min-h-6 items-center justify-between gap-2">
          {title && <h3 className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Badge({ tone = 'neutral', children, className }: { tone?: 'neutral' | 'accent' | 'danger' | 'warning' | 'success'; children: ReactNode; className?: string }) {
  const tones = {
    neutral: 'bg-raised text-muted ring-line',
    accent: 'bg-accent-soft text-accent-text ring-accent/20',
    danger: 'bg-danger-soft text-danger ring-danger/20',
    warning: 'bg-warning-soft text-warning ring-warning/25',
    success: 'bg-success-soft text-success ring-success/20',
  }
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', tones[tone], className)}>
      {children}
    </span>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded-[5px] border border-line-strong/70 bg-raised px-1.5 py-px font-sans text-[11px] font-medium text-muted shadow-soft">
      {children}
    </kbd>
  )
}

export function Callout({ tone = 'info', icon, children, className }: { tone?: 'info' | 'warning' | 'danger' | 'success'; icon?: ReactNode; children: ReactNode; className?: string }) {
  const tones = {
    info: 'bg-accent-soft/70 text-fg ring-accent/15',
    warning: 'bg-warning-soft text-fg ring-warning/25',
    danger: 'bg-danger-soft text-fg ring-danger/25',
    success: 'bg-success-soft text-fg ring-success/20',
  }
  const iconTones = { info: 'text-accent-text', warning: 'text-warning', danger: 'text-danger', success: 'text-success' }
  return (
    <div className={cx('flex gap-2.5 rounded-lg px-3 py-2.5 text-[12.5px] leading-snug ring-1 ring-inset', tones[tone], className)}>
      {icon && <span className={cx('mt-px shrink-0', iconTones[tone])}>{icon}</span>}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ okna dialogowe */

export function Dialog({
  title,
  description,
  onClose,
  children,
  footer,
  width = 560,
  testId,
}: {
  title: ReactNode
  description?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number
  testId?: string
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const focusable = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel
    focusable?.focus()
    return () => previous?.focus?.()
  }, [])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    if (!nodes || nodes.length === 0) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="no-print fixed inset-0 z-50 flex animate-fade items-center justify-center bg-black/45 p-6 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid={testId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        style={{ width: `min(${width}px, 100%)` }}
        className="flex max-h-full animate-pop flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-modal outline-none"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[15px] font-semibold text-fg">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>}
          </div>
          <IconButton label="Zamknij" size="sm" tipAlign="end" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 border-t border-line bg-raised/60 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ menu rozwijane */

export interface MenuItem {
  label: string
  icon?: ReactNode
  shortcut?: string
  onSelect: () => void
  disabled?: boolean
  danger?: boolean
  separatorBefore?: boolean
}

export function Menu({ trigger, items, align = 'start', label }: { trigger: ReactNode; items: MenuItem[]; align?: 'start' | 'end'; label: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className={cx(
          'inline-flex h-8.5 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors',
          open ? 'bg-hover text-fg' : 'text-muted hover:bg-hover hover:text-fg',
        )}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={cx(
            'absolute top-full z-40 mt-1.5 min-w-56 animate-pop rounded-xl border border-line bg-panel p-1 shadow-pop',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => (
            <div key={item.label}>
              {item.separatorBefore && <div className="my-1 h-px bg-line" />}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false)
                  item.onSelect()
                }}
                className={cx(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors',
                  'disabled:opacity-40 disabled:pointer-events-none',
                  item.danger ? 'text-danger hover:bg-danger-soft' : 'text-fg hover:bg-hover',
                )}
              >
                <span className={cx('flex size-4 items-center justify-center', item.danger ? 'text-danger' : 'text-muted')}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.shortcut && <span className="text-[11.5px] text-subtle">{item.shortcut}</span>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
