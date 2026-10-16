'use client'

import { create } from 'zustand'
import type { Article } from './types'

interface ArticleModalState {
  current: Article | null
  open: boolean
  openArticle: (a: Article) => void
  close: () => void
}

export const useArticleModal = create<ArticleModalState>((set) => ({
  current: null,
  open: false,
  openArticle: (a) => set({ current: a, open: true }),
  close: () => set({ open: false }),
}))
