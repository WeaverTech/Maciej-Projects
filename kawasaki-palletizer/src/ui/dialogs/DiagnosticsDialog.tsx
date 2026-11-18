import { ClipboardCopy, Download, Trash2 } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { APP_NAME, APP_VERSION, PROJECT_FORMAT_VERSION } from '../../core/defaults'
import { clearLog, environmentInfo, getLog, logAsText, subscribeLog } from '../../state/diagnostics'
import { copyText, downloadText } from '../../state/fileAccess'
import { useStore } from '../../state/store'
import { Badge, Button, cx, Dialog } from '../kit'

export function DiagnosticsDialog() {
  const log = useSyncExternalStore(subscribeLog, getLog, getLog)
  const store = useStore.getState()
  const errors = log.filter((e) => e.level === 'error').length

  return (
    <Dialog
      title="Diagnostyka"
      description="Każdy nieobsłużony błąd aplikacji trafia do tego logu. Dołącz go do zgłoszenia problemu."
      onClose={() => store.openDialog(null)}
      width={760}
      testId="diagnostics-dialog"
      footer={
        <>
          <Button
            variant="ghost"
            icon={<Trash2 size={14} />}
            disabled={log.length === 0}
            onClick={() => {
              clearLog()
              store.toast('Wyczyszczono log')
            }}
            className="mr-auto"
          >
            Wyczyść log
          </Button>
          <Button icon={<Download size={14} />} onClick={() => downloadText(logAsText(), 'kawasaki-palletizer-log.txt')}>
            Pobierz log
          </Button>
          <Button
            variant="primary"
            icon={<ClipboardCopy size={14} />}
            onClick={async () => {
              const ok = await copyText(logAsText())
              store.toast(ok ? 'Skopiowano log do schowka' : 'Nie udało się skopiować logu', ok ? 'success' : 'error')
            }}
          >
            Kopiuj log
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            ['Aplikacja', `${APP_NAME} ${APP_VERSION}`],
            ['Format projektu', `wersja ${PROJECT_FORMAT_VERSION} (odczyt także 3)`],
            ['Wpisy w logu', `${log.length} (błędy: ${errors})`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-line bg-raised/60 px-3 py-2.5">
              <p className="text-[11px] font-medium text-subtle">{label}</p>
              <p className="mt-0.5 text-[13px] font-semibold" data-testid={label === 'Aplikacja' ? 'app-version' : undefined}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <pre className="rounded-xl border border-line bg-inset px-3 py-2.5 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-muted">
          {environmentInfo()}
        </pre>

        <div>
          <h3 className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">Log zdarzeń</h3>
          {log.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line-strong px-3 py-6 text-center text-[12.5px] text-muted" data-testid="log-empty">
              Brak wpisów – aplikacja nie zgłosiła żadnych błędów.
            </p>
          ) : (
            <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto" data-testid="log-list">
              {[...log].reverse().map((entry, idx) => (
                <li key={`${entry.time}-${idx}`} className="rounded-lg border border-line bg-inset px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Badge tone={entry.level === 'error' ? 'danger' : 'neutral'}>{entry.level === 'error' ? 'BŁĄD' : 'INFO'}</Badge>
                    <span className="font-mono text-[11px] text-subtle">{entry.time.replace('T', ' ').slice(0, 19)}</span>
                  </div>
                  <p className={cx('mt-1 text-[12.5px]', entry.level === 'error' ? 'text-fg' : 'text-muted')}>{entry.message}</p>
                  {entry.details && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[11.5px] text-subtle hover:text-muted">Szczegóły techniczne</summary>
                      <pre className="mt-1 max-h-40 overflow-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted">{entry.details}</pre>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Dialog>
  )
}
