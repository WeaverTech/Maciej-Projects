import type { ReactNode } from 'react'

interface OptionButtonProps {
  selected: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}

/** Techniczny przycisk wyboru opcji w konfiguratorze */
export default function OptionButton({
  selected,
  disabled,
  onClick,
  children,
  className = '',
}: OptionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={`relative border p-4 text-left transition-all ${
        selected
          ? 'border-brand-500 bg-brand-500/10 ring-1 ring-brand-500'
          : 'border-steel-700 bg-steel-900 hover:border-steel-400'
      } ${disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'} ${className}`}
    >
      {selected && (
        <span className="absolute right-0 top-0 border-b-[22px] border-l-[22px] border-b-transparent border-l-transparent border-t-[22px] border-r-[22px] border-r-brand-500 border-t-brand-500" />
      )}
      {children}
    </button>
  )
}
