import { useEffect } from 'react'
import { openProject, saveAsCode, saveProject } from '../state/actions'
import { useStore } from '../state/store'

function isTextTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true
  if (target instanceof HTMLInputElement) return !['checkbox', 'radio', 'range', 'button'].includes(target.type)
  return false
}

/** Globalne skróty klawiszowe aplikacji. */
export function useShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const s = useStore.getState()
      const mod = e.ctrlKey || e.metaKey
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const modal = s.dialog !== null || s.confirm !== null

      // Skróty plikowe działają zawsze, także w polach tekstowych.
      if (mod && !e.altKey) {
        if (key === 's') {
          e.preventDefault()
          if (!modal) void saveProject(e.shiftKey)
          return
        }
        if (key === 'o') {
          e.preventDefault()
          if (!modal) openProject()
          return
        }
        if (key === 'e') {
          e.preventDefault()
          if (!modal) void saveAsCode()
          return
        }
      }

      if (modal || isTextTarget(e.target)) return

      if (mod && !e.altKey) {
        if (key === 'z') {
          e.preventDefault()
          if (e.shiftKey) s.redo()
          else s.undo()
          return
        }
        if (key === 'y') {
          e.preventDefault()
          s.redo()
          return
        }
        if (s.view !== 'layout') return
        if (key === 'a') {
          e.preventDefault()
          s.selectAll()
        } else if (key === 'c') {
          if (s.selection.length) {
            s.copySelected()
            s.toast(`Skopiowano: ${s.selection.length}`)
          }
        } else if (key === 'v') {
          if (s.clipboard.length) {
            e.preventDefault()
            s.paste()
          }
        } else if (key === 'd') {
          e.preventDefault()
          s.duplicateSelected()
        }
        return
      }
      if (e.altKey) return

      if (key === '?') {
        s.openDialog('shortcuts')
        return
      }
      if (key === '1') return s.setView('layout')
      if (key === '2') return s.setView('stack')
      if (key === '3') return s.setView('code')

      if (s.view !== 'layout') return

      switch (key) {
        case 'Delete':
        case 'Backspace':
          if (s.selection.length) {
            e.preventDefault()
            s.deleteSelected()
          }
          break
        case 'Escape':
          if (s.tool !== 'select') s.setTool('select')
          else if (s.selection.length) s.select([])
          break
        case 'r':
          s.rotateSelected(e.shiftKey ? -90 : 90)
          break
        case 'n':
          s.addItem()
          break
        case 'v':
          s.setTool('select')
          break
        case 'm':
          s.setTool(s.tool === 'measure' ? 'select' : 'measure')
          break
        case 'o':
          s.setTool(s.tool === 'order' ? 'select' : 'order')
          break
        case 'l':
          if (s.project.layers.B) s.setActiveLayer(s.activeLayer === 'A' ? 'B' : 'A')
          break
        case 'g':
          s.setPrefs({ grid: !s.grid })
          break
        case 's':
          s.setPrefs({ snap: !s.snap })
          break
        case 'f':
          s.requestFit()
          break
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown': {
          if (!s.selection.length) break
          e.preventDefault()
          const step = e.shiftKey ? 10 : 1
          const dx = key === 'ArrowLeft' ? -step : key === 'ArrowRight' ? step : 0
          const dy = key === 'ArrowUp' ? -step : key === 'ArrowDown' ? step : 0
          s.nudgeSelected(dx, dy)
          break
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
