import { create } from 'zustand'
import type { GameCard, GameState } from '../types'

function getRandomIds(count: number, max: number): number[] {
  const ids = new Set<number>()
  while (ids.size < count) {
    ids.add(Math.floor(Math.random() * max) + 1)
  }
  return Array.from(ids)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const useGameStore = create<GameState>((set, get) => ({
  cards: [],
  flippedIds: [],
  matchedIds: [],
  errorIds: [],
  turns: 0,
  isPreview: true,
  isLocked: false,
  isLoading: false,

  initGame: async () => {
    set({ isLoading: true })
    try {
      const ids = getRandomIds(6, 10)
      const res = await fetch(`https://rickandmortyapi.com/api/character/${ids.join(',')}`)
      const data: { id: number; name: string; image: string }[] = await res.json()
      const characters = Array.isArray(data) ? data : [data]

      // Duplica cada personaje para crear pares; asigna IDs únicos a las tarjetas
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

      set({
        cards: [...originals, ...copies],
        isLoading: false,
        isPreview: true,
        flippedIds: [],
        matchedIds: [],
        errorIds: [],
        turns: 0,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  // El shuffle ocurre aquí, no al cargar — la previsualización permite memorizar posiciones
  startGame: () => {
    set((state) => ({
      cards: shuffle(state.cards),
      isPreview: false,
      isLocked: false,
      turns: 0,
      flippedIds: [],
      matchedIds: [],
      errorIds: [],
    }))
  },

  flipCard: (id: number) => {
    const { flippedIds, cards, matchedIds, isLocked, isPreview } = get()

    if (isPreview || isLocked || matchedIds.includes(id) || flippedIds.includes(id)) return
    if (flippedIds.length === 2) return

    const newFlipped = [...flippedIds, id]
    set({ flippedIds: newFlipped })

    // Espera la segunda carta antes de evaluar
    if (newFlipped.length < 2) return

    set({ isLocked: true })

    const [firstId, secondId] = newFlipped
    const first = cards.find((c) => c.id === firstId)!
    const second = cards.find((c) => c.id === secondId)!

    if (first.characterId === second.characterId) {
      // Par correcto: deja ver ambas cartas antes de confirmar (800ms)
      setTimeout(() => {
        set((state) => {
          const newMatchedIds = [...state.matchedIds, firstId, secondId]
          const newTurns = state.turns + 1

          // Persiste el resultado para que /result sobreviva un refresco de página
          if (newMatchedIds.length === 12) {
            localStorage.setItem('game-result', String(newTurns))
          }

          return {
            matchedIds: newMatchedIds,
            flippedIds: [],
            turns: newTurns,
            isLocked: false,
          }
        })
      }, 800)
    } else {
      // Sin par: misma pausa de 800ms, luego shake (600ms), luego volver a ocultar
      setTimeout(() => {
        set({ errorIds: newFlipped })
        setTimeout(() => {
          set((state) => ({
            flippedIds: [],
            errorIds: [],
            turns: state.turns + 1,
            isLocked: false,
          }))
        }, 600)
      }, 800)
    }
  },

  resetGame: () => {
    localStorage.removeItem('game-result')
    set({
      cards: [],
      flippedIds: [],
      matchedIds: [],
      errorIds: [],
      turns: 0,
      isPreview: true,
      isLocked: false,
      isLoading: false,
    })
    get().initGame()
  },
}))
