import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CANCommandMessage } from '@waterloorocketry/omnibus-ts'

export interface HistoryEntry {
    id: string
    timestamp: number
    command: CANCommandMessage
    status: 'success' | 'error'
    errorMessage?: string
}

export interface FavoriteEntry {
    id: string
    label: string
    command: CANCommandMessage
}

interface CanSenderStore {
    history: HistoryEntry[]
    favorites: FavoriteEntry[]
    addToHistory: (entry: Omit<HistoryEntry, 'id'>) => void
    addFavorite: (label: string, command: CANCommandMessage) => void
    removeFavorite: (id: string) => void
    clearHistory: () => void
}

export const useCanSenderStore = create<CanSenderStore>()(
    persist(
        (set) => ({
            history: [],
            favorites: [],
            addToHistory: (entry) =>
                set((state) => ({
                    history: [
                        { ...entry, id: crypto.randomUUID() },
                        ...state.history.slice(0, 49),
                    ],
                })),
            addFavorite: (label, command) =>
                set((state) => ({
                    favorites: [
                        ...state.favorites,
                        { id: crypto.randomUUID(), label, command },
                    ],
                })),
            removeFavorite: (id) =>
                set((state) => ({
                    favorites: state.favorites.filter((f) => f.id !== id),
                })),
            clearHistory: () => set({ history: [] }),
        }),
        { name: 'can-sender-store' }
    )
)
