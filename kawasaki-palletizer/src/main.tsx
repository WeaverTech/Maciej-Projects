import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'
import { installGlobalErrorHandlers } from './state/diagnostics'
import { useStore } from './state/store'

installGlobalErrorHandlers((entry) => {
  useStore.getState().toast(`${entry.message} – szczegóły w Pomoc → Diagnostyka`, 'error')
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
