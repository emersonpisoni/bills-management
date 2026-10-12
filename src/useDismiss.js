import { useEffect } from 'react'

// Fecha um popover ao clicar fora dele ou apertar Esc
export function useDismiss(ref, open, onClose) {
  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [ref, open, onClose])
}
