import { Info, Settings2, Wand2 } from 'lucide-react'
import { useId } from 'react'
import { cyclesLabel } from '../../core/format'
import { parseSignal, projectCycles } from '../../core/gripper'
import { useStore } from '../../state/store'
import { Badge, Button, Callout, cx, Field, NumberField, Section, Segmented, TextField } from '../kit'

export function GripperPanel() {
  const robot = useStore((s) => s.project.robot)
  const project = useStore((s) => s.project)
  const store = useStore.getState()
  const double = robot.pickMode === 'podwojny'
  const { cycles, errors } = projectCycles(project)
  const ids = { grip: useId(), release: useId(), raw: useId() }

  return (
    <>
      <Section title="Tryb chwytu">
        <Segmented
          block
          ariaLabel="Tryb chwytu"
          value={robot.pickMode}
          onChange={(pickMode) => store.setRobot({ pickMode })}
          options={[
            { value: 'pojedynczy', label: 'Pojedynczy', testId: 'mode-single' },
            { value: 'podwojny', label: 'Podwójny', testId: 'mode-double' },
          ]}
        />
        <p className="text-[12.5px] leading-snug text-muted">
          {double
            ? 'Dwa produkty pobierane jednym dojazdem. Każdy trzyma inna sekcja chwytaka i jest odkładany osobno.'
            : 'Jeden produkt na cykl pobrania. Używana jest tylko sekcja 1.'}
        </p>
      </Section>

      <Section title="Sygnały chwytaka">
        <SignalRow section={1} on={robot.s1On} off={robot.s1Off} onChange={(patch) => store.setRobot(patch)} />
        <div className="h-px bg-line" />
        <SignalRow section={2} on={robot.s2On} off={robot.s2Off} disabled={!double} onChange={(patch) => store.setRobot(patch)} />
        <p className="text-[11.5px] leading-snug text-subtle">
          Wartość trafia wprost do instrukcji <code className="font-mono">SIGNAL</code>, np. <code className="font-mono">12,-13</code> włącza wyjście 12 i
          wyłącza 13.
        </p>
      </Section>

      <Section title="Czasy">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Po chwyceniu" htmlFor={ids.grip}>
            <NumberField id={ids.grip} value={robot.gripWait} min={0} max={60} step={0.1} decimals={2} unit="s" onChange={(gripWait) => store.setRobot({ gripWait })} />
          </Field>
          <Field label="Po odłożeniu" htmlFor={ids.release}>
            <NumberField id={ids.release} value={robot.releaseWait} min={0} max={60} step={0.1} decimals={2} unit="s" onChange={(releaseWait) => store.setRobot({ releaseWait })} />
          </Field>
        </div>
      </Section>

      <Section
        title="Cykle pobrań"
        action={<Badge tone={errors.length ? 'danger' : 'neutral'}>{errors.length ? 'wymaga poprawy' : cyclesLabel(cycles.length)}</Badge>}
      >
        {!double ? (
          <Callout icon={<Info size={15} />}>W trybie pojedynczym każdy produkt ma własny cykl – konfiguracja nie jest potrzebna.</Callout>
        ) : (
          <>
            {cycles.length > 0 && (
              <ol className="flex flex-col gap-1.5" data-testid="cycle-summary">
                {cycles.map((cycle, idx) => (
                  <li key={idx} className="flex items-center gap-2 rounded-lg bg-raised px-2.5 py-1.5">
                    <span className="w-12 text-[11.5px] font-semibold text-subtle">Cykl {idx + 1}</span>
                    {cycle.map((entry) => (
                      <span
                        key={entry.product}
                        className="inline-flex items-center gap-1.5 rounded-md bg-panel px-1.5 py-0.5 text-[12px] font-medium ring-1 ring-line"
                      >
                        <span className="tabular-nums">Produkt {entry.product}</span>
                        <span
                          className="rounded px-1 text-[10px] font-bold text-white"
                          style={{ background: entry.section === 1 ? 'var(--accent)' : 'var(--warning)' }}
                        >
                          S{entry.section}
                        </span>
                      </span>
                    ))}
                  </li>
                ))}
              </ol>
            )}
            {errors.length > 0 && (
              <Callout tone="danger" icon={<Info size={15} />}>
                <ul className="flex flex-col gap-0.5">
                  {errors.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </Callout>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button icon={<Settings2 size={15} />} onClick={() => store.openDialog('cycles')} data-testid="open-cycles">
                Edytor cykli…
              </Button>
              <Button icon={<Wand2 size={15} />} onClick={() => store.autoPair()} data-testid="auto-pair">
                Paruj kolejno
              </Button>
            </div>
            <Field label="Zapis tekstowy" htmlFor={ids.raw} hint="Format: produkt=sekcja, cykle oddzielone średnikiem.">
              <TextField id={ids.raw} mono value={robot.assignments} invalid={errors.length > 0} onChange={(assignments) => store.setRobot({ assignments })} />
            </Field>
          </>
        )}
      </Section>
    </>
  )
}

function SignalRow({
  section,
  on,
  off,
  disabled,
  onChange,
}: {
  section: 1 | 2
  on: string
  off: string
  disabled?: boolean
  onChange: (patch: Partial<{ s1On: string; s1Off: string; s2On: string; s2Off: string }>) => void
}) {
  const onId = useId()
  const offId = useId()
  const onError = disabled ? undefined : parseSignal(on).error
  const offError = disabled ? undefined : parseSignal(off).error
  return (
    <div className={cx('flex flex-col gap-2', disabled && 'opacity-50')} data-testid={`signals-${section}`}>
      <div className="flex items-center gap-2">
        <span
          className="rounded px-1.5 py-0.5 text-[10.5px] font-bold text-white"
          style={{ background: section === 1 ? 'var(--accent)' : 'var(--warning)' }}
        >
          S{section}
        </span>
        <span className="text-[13px] font-semibold">Sekcja {section}</span>
        {disabled && <span className="text-[11.5px] text-subtle">– nieużywana w trybie pojedynczym</span>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Chwyć (ON)" htmlFor={onId} error={onError}>
          <TextField
            id={onId}
            mono
            disabled={disabled}
            invalid={!!onError}
            value={on}
            onChange={(v) => onChange(section === 1 ? { s1On: v } : { s2On: v })}
          />
        </Field>
        <Field label="Puść (OFF)" htmlFor={offId} error={offError}>
          <TextField
            id={offId}
            mono
            disabled={disabled}
            invalid={!!offError}
            value={off}
            onChange={(v) => onChange(section === 1 ? { s1Off: v } : { s2Off: v })}
          />
        </Field>
      </div>
    </div>
  )
}
