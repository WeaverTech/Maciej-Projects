import { Info } from 'lucide-react'
import { useId } from 'react'
import { formatNumber } from '../../core/asExport'
import { orientationO, ROTATIONS } from '../../core/geometry'
import { useStore } from '../../state/store'
import { Callout, Field, NumberField, Section, Segmented, TextField } from '../kit'

export function RobotPanel() {
  const project = useStore((s) => s.project)
  const robot = project.robot
  const setRobot = useStore((s) => s.setRobot)
  const ids = {
    program: useId(),
    base: useId(),
    pickup: useId(),
    approach: useId(),
    firstZ: useId(),
    safeZ: useId(),
    speed: useId(),
    accel: useId(),
    decel: useId(),
    offset: useId(),
  }

  return (
    <>
      <Section title="Program i punkty">
        <Field label="Nazwa programu" htmlFor={ids.program}>
          <TextField id={ids.program} mono value={robot.programName} onChange={(programName) => setRobot({ programName })} />
        </Field>
        <Field label="Punkt BASE palety" htmlFor={ids.base} hint="Punkt nauczony w wybranym narożniku górnej powierzchni palety.">
          <TextField id={ids.base} mono value={robot.baseName} onChange={(baseName) => setRobot({ baseName })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Punkt pobrania" htmlFor={ids.pickup}>
            <TextField id={ids.pickup} mono value={robot.pickup} onChange={(pickup) => setRobot({ pickup })} />
          </Field>
          <Field label="Najazd nad pobranie" htmlFor={ids.approach}>
            <TextField id={ids.approach} mono value={robot.pickupApproach} onChange={(pickupApproach) => setRobot({ pickupApproach })} />
          </Field>
        </div>
      </Section>

      <Section title="Wysokości">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Z pierwszej warstwy" htmlFor={ids.firstZ} hint="Lokalne Z punktów względem BASE.">
            <NumberField id={ids.firstZ} value={robot.firstZ} min={-10000} max={10000} step={5} unit="mm" onChange={(firstZ) => setRobot({ firstZ })} />
          </Field>
          <Field label="Wysokość bezpieczna" htmlFor={ids.safeZ} hint="Ponad aktualną warstwą.">
            <NumberField id={ids.safeZ} value={robot.safeZ} min={0} max={10000} step={10} unit="mm" onChange={(safeZ) => setRobot({ safeZ })} />
          </Field>
        </div>
        <p className="text-[11.5px] leading-snug text-subtle">
          Kolejne warstwy są podnoszone instrukcją <code className="font-mono">SHIFT</code> o przyrost warstwy ustawiony w kroku „Produkt”.
        </p>
      </Section>

      <Section title="Parametry ruchu">
        <div className="grid grid-cols-3 gap-2.5">
          <Field label="SPEED" htmlFor={ids.speed}>
            <NumberField id={ids.speed} value={robot.speed} min={1} max={100} step={5} unit="%" onChange={(speed) => setRobot({ speed })} />
          </Field>
          <Field label="ACCEL" htmlFor={ids.accel}>
            <NumberField id={ids.accel} value={robot.accel} min={1} max={100} step={5} unit="%" onChange={(accel) => setRobot({ accel })} />
          </Field>
          <Field label="DECEL" htmlFor={ids.decel}>
            <NumberField id={ids.decel} value={robot.decel} min={1} max={100} step={5} unit="%" onChange={(decel) => setRobot({ decel })} />
          </Field>
        </div>
      </Section>

      <Section title="Orientacja produktu (kąt O)">
        <Segmented
          block
          ariaLabel="Sposób liczenia kąta O"
          value={robot.orientationMode}
          onChange={(orientationMode) => setRobot({ orientationMode })}
          options={[
            { value: 'base', label: 'Względem osi BASE', testId: 'orientation-base' },
            { value: 'legacy', label: 'Jak w wersji 2.3', testId: 'orientation-legacy' },
          ]}
        />
        <p className="text-[12.5px] leading-snug text-muted">
          {robot.orientationMode === 'base'
            ? 'Kąt O jest przeliczany do układu BASE, więc pozostaje poprawny po zmianie narożnika lub kierunków osi.'
            : 'Kąt O jest równy obrotowi na planszy, bez uwzględnienia kierunków osi – tak jak w wersji 2.3.'}
        </p>
        <Field label="Korekta kąta O" htmlFor={ids.offset} hint="Stały kąt dodawany do O, np. wynikający z zamocowania chwytaka.">
          <NumberField id={ids.offset} value={robot.oOffset} min={-360} max={360} step={90} unit="°" onChange={(oOffset) => setRobot({ oOffset })} />
        </Field>
        <div className="overflow-hidden rounded-lg border border-line" data-testid="orientation-table">
          <div className="grid grid-cols-4 bg-raised text-center text-[11px] font-semibold text-subtle">
            {ROTATIONS.map((r) => (
              <div key={r} className="border-r border-line py-1 last:border-r-0">
                obrót {r}°
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 text-center font-mono text-[12.5px] font-semibold">
            {ROTATIONS.map((r) => (
              <div key={r} className="border-r border-line py-1.5 last:border-r-0">
                O = {formatNumber(orientationO(r, project))}
              </div>
            ))}
          </div>
        </div>
        <Callout tone="warning" icon={<Info size={15} />}>
          Składowe A i T są zawsze równe 0. Orientację narzędzia zweryfikuj na stanowisku przed uruchomieniem.
        </Callout>
      </Section>
    </>
  )
}
