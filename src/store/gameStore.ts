import { create } from 'zustand'
import type { GameCard } from '../types/game'

function getRandomIds(count: number, max: number): number[] {
  const ids = new Set<number>()
  while (ids.size < count) {
    ids.add(Math.floor(Math.random() * max) + 1)
  }
  return Array.from(ids)
}

interface GameState {
  cards: GameCard[]
  isLoading: boolean
  isPreview: boolean
  initGame: () => Promise<void>
}

export const useGameStore = create<GameState>((set) => ({
  cards: [],
  isLoading: false,
  isPreview: true,

  initGame: async () => {
    set({ isLoading: true })
    try {
      const ids = getRandomIds(6, 10)
      const res = await fetch(`https://rickandmortyapi.com/api/character/${ids.join(',')}`)
      const data: { id: number; name: string; image: string }[] = await res.json()
      const characters = Array.isArray(data) ? data : [data]

      const originals: GameCard[] = characters.map((char, i) => ({
        id: i,
        characterId: char.id,
        name: char.name,
        image: char.image,
      }))

      const copies: GameCard[] = characters.map((char, i) => ({
        id: i + 6,
        characterId: char.id,
        name: char.name,
        image: char.image,
      }))

      set({ cards: [...originals, ...copies], isLoading: false, isPreview: true })
    } catch {
      set({ isLoading: false })
    }
  },
}))
