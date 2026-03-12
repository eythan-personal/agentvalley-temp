import { useEffect } from 'react'

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return

      const key = e.key
      if (shortcuts[key]) {
        e.preventDefault()
        shortcuts[key](e)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [shortcuts])
}
