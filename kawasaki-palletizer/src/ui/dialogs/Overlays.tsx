import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { useStore } from '../../state/store'
import { cx } from '../cx'
import { Button, Dialog } from '../kit'

export function ConfirmDialog() {
  const confirm = useStore((s) => s.confirm)
  const askConfirm = useStore((s) => s.askConfirm)
  if (!confirm) return null
  return (
    <Dialog
      title={confirm.title}
      onClose={() => askConfirm(null)}
      width={440}
      testId="confirm-dialog"
      footer={
        <>
          <Button variant="ghost" onClick={() => askConfirm(null)} data-autofocus>
            Anuluj
          </Button>
          <Button
            variant={confirm.danger ? 'danger' : 'primary'}
            data-testid="confirm-accept"
            onClick={() => {
              askConfirm(null)
              confirm.onConfirm()
            }}
          >
            {confirm.confirmLabel}
          </Button>
        </>
      }
    >
      <p className="px-5 py-4 text-[13px] leading-relaxed text-muted">{confirm.message}</p>
    </Dialog>
  )
}

const TOAST_ICON = {
  success: <CircleCheck size={16} className="text-success" />,
  error: <CircleAlert size={16} className="text-danger" />,
  info: <Info size={16} className="text-accent-text" />,
}

export function Toasts() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismissToast)
  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-12 z-[70] flex flex-col items-center gap-2" aria-live="polite" data-testid="toasts">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.kind === 'error' ? 'alert' : 'status'}
          className={cx(
            'pointer-events-auto flex max-w-[560px] animate-toast items-center gap-2.5 rounded-xl border bg-panel py-2 pr-2 pl-3 text-[13px] shadow-pop',
            toast.kind === 'error' ? 'border-danger/40' : 'border-line',
          )}
        >
          {TOAST_ICON[toast.kind]}
          <span className="min-w-0 flex-1">{toast.message}</span>
          <button
            type="button"
            aria-label="Zamknij powiadomienie"
            onClick={() => dismiss(toast.id)}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-subtle hover:bg-hover hover:text-fg"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
