import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { projectStats } from '../core/stats'
import { countIssues, issueItemSets, validateProject } from '../core/validation'
import { useStore } from '../state/store'

/** Wynik walidacji bieżącego projektu (przeliczany tylko po zmianie projektu). */
export function useIssues() {
  const project = useStore((s) => s.project)
  return useMemo(() => {
    const issues = validateProject(project)
    return { issues, ...countIssues(issues) }
  }, [project])
}

export function useIssueSets() {
  const { issues } = useIssues()
  const layer = useStore((s) => s.activeLayer)
  return useMemo(() => issueItemSets(issues, layer), [issues, layer])
}

export function useStats() {
  const project = useStore((s) => s.project)
  return useMemo(() => projectStats(project), [project])
}

const darkQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null

function subscribeSystemTheme(listener: () => void) {
  darkQuery?.addEventListener('change', listener)
  return () => darkQuery?.removeEventListener('change', listener)
}

/** Faktycznie używany motyw z uwzględnieniem ustawienia „systemowy”. */
export function useResolvedTheme(): 'light' | 'dark' {
  const pref = useStore((s) => s.theme)
  const systemDark = useSyncExternalStore(
    subscribeSystemTheme,
    () => darkQuery?.matches ?? false,
    () => false,
  )
  return pref === 'system' ? (systemDark ? 'dark' : 'light') : pref
}

export function useApplyTheme() {
  const theme = useResolvedTheme()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return theme
}
