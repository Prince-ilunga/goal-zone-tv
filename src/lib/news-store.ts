'use client'

import { create } from 'zustand'
import type { Scope, Sport } from './types'

interface NewsState {
  query: string
  scope: 'ALL' | Scope
  sport: 'ALL' | Sport
  setQuery: (q: string) => void
  setScope: (s: 'ALL' | Scope) => void
  setSport: (s: 'ALL' | Sport) => void
  reset: () => void
}

export const useNewsStore = create<NewsState>((set) => ({
  query: '',
  scope: 'ALL',
  sport: 'ALL',
  setQuery: (query) => set({ query }),
  setScope: (scope) => set({ scope }),
  setSport: (sport) => set({ sport }),
  reset: () => set({ query: '', scope: 'ALL', sport: 'ALL' }),
}))
