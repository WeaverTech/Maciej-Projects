import type { Severity } from './types'

export interface AsIssue {
  severity: Severity
  message: string
  line: number
}

/**
 * Podstawowa walidacja struktury kodu AS: bloki FOR/IF…END, format SIGNAL, .PROGRAM/.END, znaki spoza ASCII.
 * Nie zastępuje sprawdzenia w neoROset ani na kontrolerze.
 */
export function validateAs(code: string): AsIssue[] {
  const issues: AsIssue[] = []
  const stack: { keyword: string; line: number }[] = []
  let programLine = 0
  let endLine = 0
  // Fragment bez .PROGRAM/.END jest sprawdzany tylko pod kątem bloków i instrukcji.
  const wholeProgram = /^\s*\.(PROGRAM\b|END\s*$)/im.test(code)

  code.split('\n').forEach((raw, idx) => {
    const n = idx + 1
    const trimmed = raw.trim()
    if (/[^\x09\x20-\x7e]/.test(raw)) {
      issues.push({ severity: 'warning', message: 'Znaki spoza ASCII mogą nie zostać przyjęte przez kontroler', line: n })
    }
    if (!trimmed || trimmed.startsWith(';')) return
    const s = trimmed.toUpperCase()
    if (s.startsWith('.PROGRAM')) {
      if (programLine) issues.push({ severity: 'error', message: 'Powtórzone .PROGRAM', line: n })
      programLine = n
      if (!/^\.PROGRAM\s+[A-Z][A-Z0-9_.]*\s*\(.*\)/.test(s)) {
        issues.push({ severity: 'error', message: 'Błędny nagłówek .PROGRAM', line: n })
      }
      return
    }
    if (s === '.END') {
      endLine = n
      return
    }
    if (wholeProgram && !programLine) issues.push({ severity: 'error', message: 'Instrukcja przed .PROGRAM', line: n })
    if (endLine) issues.push({ severity: 'error', message: 'Instrukcja po .END', line: n })

    if (s.startsWith('FOR ') || s.startsWith('IF ')) {
      stack.push({ keyword: s.split(/\s+/)[0], line: n })
      if (s.startsWith('IF ') && !/\bTHEN$/.test(s)) {
        issues.push({ severity: 'error', message: 'IF bez THEN', line: n })
      }
    } else if (s === 'END') {
      if (stack.length) stack.pop()
      else issues.push({ severity: 'error', message: 'END bez bloku', line: n })
    } else if (s === 'ELSE') {
      if (!stack.length || stack[stack.length - 1].keyword !== 'IF') {
        issues.push({ severity: 'error', message: 'ELSE poza blokiem IF', line: n })
      }
    }
    if (s.startsWith('SIGNAL') && !/^SIGNAL\s+[-+]?\d+(\s*,\s*[-+]?\d+)*$/.test(s)) {
      issues.push({ severity: 'error', message: 'Błędny SIGNAL', line: n })
    }
    if (/^(JMOVE|LMOVE|CALL|TWAIT|POINT)$/.test(s)) {
      issues.push({ severity: 'error', message: `${s} bez argumentu`, line: n })
    }
  })

  for (const open of stack) issues.push({ severity: 'error', message: `${open.keyword} bez END`, line: open.line })
  if (wholeProgram) {
    if (!programLine) issues.push({ severity: 'error', message: 'Brak .PROGRAM', line: 1 })
    if (!endLine) issues.push({ severity: 'error', message: 'Brak .END', line: code.split('\n').length })
  }
  return issues.sort((a, b) => a.line - b.line)
}
