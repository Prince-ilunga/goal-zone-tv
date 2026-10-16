'use client'

import { useEffect } from 'react'
import { useAdminStore } from '@/lib/admin-store'
import { AdminPanel } from './admin-panel'

/**
 * Mounts the AdminPanel globally and wires up the Ctrl+Shift+E shortcut.
 * No floating button — purely keyboard-activated.
 */
export function AdminLauncher() {
  const open = useAdminStore((s) => s.open)
  const toggleAdmin = useAdminStore((s) => s.toggleAdmin)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === 'E' || e.key === 'e')
      ) {
        e.preventDefault()
        toggleAdmin()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleAdmin])

  return <AdminPanel open={open} onOpenChange={(o) => !o && toggleAdmin()} />
}
