'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AdminState {
  open: boolean
  openAdmin: () => void
  closeAdmin: () => void
  toggleAdmin: () => void
  setOpen: (open: boolean) => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      open: false,
      openAdmin: () => set({ open: true }),
      closeAdmin: () => set({ open: false }),
      toggleAdmin: () => set((s) => ({ open: !s.open })),
      setOpen: (open) => set({ open }),
    }),
    {
      name: 'gztv-admin-open',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.sessionStorage
          : (undefined as unknown as Storage),
      ),
    },
  ),
)
