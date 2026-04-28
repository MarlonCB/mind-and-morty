import { create } from 'zustand'
import type { GameCard, GameState } from '../types'
import { getRandomIds, shuffle } from './gameUtils'

export const useGameStore = create<GameState>((set, get) => ({
  // Estado inicial: sin cartas cargadas, en modo preview para la primera carga
  cards: [],
  flippedIds: [],
  matchedIds: [],
  errorIds: [],
  turns: 0,
  isPreview: true,
  isMemorizing: false,
  isLocked: false,
  isLoading: false,
  isGameFinished: false,
  hasError: false,

  /**
   * Carga 6 personajes aleatorios de la Rick and Morty API y crea los pares.
   * Las cartas se ordenan como [A, A', B, B', ...] para que en la fase de
   * preview el jugador vea claramente qué cartas forman cada par antes de
   * que se baraje al pulsar "Iniciar".
   */
  initGame: async () => {
    set({ isLoading: true })
    try {
      const ids = getRandomIds(6, 10)

      // La API acepta IDs separados por coma y devuelve un array;
      // si solo hay un ID devuelve un objeto, de ahí la normalización con Array.isArray.
      const res = await fetch(`https://rickandmortyapi.com/api/character/${ids.join(',')}`)
      const data: { id: number; name: string; image: string }[] = await res.json()
      const characters = Array.isArray(data) ? data : [data]

      // flatMap crea los pares entrelazados: cada personaje genera dos tarjetas
      // consecutivas con el mismo characterId pero IDs de tarjeta únicos (i*2 y i*2+1).
      // Así el jugador ve [A, A', B, B'...] en la previsualización.
      const paired: GameCard[] = characters.flatMap((char, i) => [
        { id: i * 2, characterId: char.id, name: char.name, image: char.image },
        { id: i * 2 + 1, characterId: char.id, name: char.name, image: char.image },
      ])

      set({
        cards: paired,
        isLoading: false,
        isPreview: true,      // cartas boca arriba en orden
        isMemorizing: false,
        flippedIds: [],
        matchedIds: [],
        errorIds: [],
        turns: 0,
        isGameFinished: false,
        hasError: false,
      })
    } catch {
      // Si la API falla se expone hasError para que GamePage muestre
      // un mensaje con botón de reintento en lugar de una pantalla en blanco.
      set({ isLoading: false, hasError: true })
    }
  },

  /**
   * Baraja las cartas y activa la fase de memorización.
   * El shuffle ocurre aquí (al pulsar "Iniciar") y no en initGame a propósito:
   * durante la preview el jugador estudia los pares en orden; al iniciar las
   * posiciones cambian y comienza la cuenta regresiva de 3 segundos.
   * isPreview sigue siendo true porque las cartas todavía están boca arriba.
   */
  startGame: () => {
    set((state) => ({
      cards: shuffle(state.cards),
      isMemorizing: true, // activa el overlay con cuenta regresiva en GamePage
      turns: 0,
      flippedIds: [],
      matchedIds: [],
      errorIds: [],
    }))
  },

  /**
   * Finaliza la fase de memorización y arranca el juego real.
   * Lo llama GamePage tras el setTimeout de 3 segundos.
   * Pone isPreview en false, lo que hace que todas las cartas se volteen boca abajo.
   * También libera isLocked por si quedó bloqueado en algún estado intermedio.
   */
  beginPlay: () => {
    set({ isPreview: false, isMemorizing: false, isLocked: false })
  },

  /**
   * Gestiona el volteo de una carta y la evaluación del par.
   *
   * Guardas de entrada (en orden de evaluación):
   *  1. isPreview  → no se puede jugar durante preview ni memorización
   *  2. isLocked   → evita race conditions: bloquea nuevos clicks mientras
   *                  la animación de evaluación del par anterior está en curso
   *  3. matchedIds → la carta ya fue encontrada, no tiene efecto
   *  4. flippedIds → no se puede voltear una carta que ya está volteada
   *  5. length 2   → ya hay dos cartas en evaluación, ignora clicks extra
   */
  flipCard: (id: number) => {
    const { flippedIds, cards, matchedIds, isLocked, isPreview } = get()

    if (isPreview || isLocked || matchedIds.includes(id) || flippedIds.includes(id)) return
    if (flippedIds.length === 2) return

    const newFlipped = [...flippedIds, id]
    set({ flippedIds: newFlipped })

    // Con solo una carta volteada esperamos la segunda antes de evaluar
    if (newFlipped.length < 2) return

    // Bloquea inmediatamente para que ningún click adicional interfiera
    // mientras los timeouts de evaluación están pendientes
    set({ isLocked: true })

    const [firstId, secondId] = newFlipped
    const first = cards.find((c) => c.id === firstId)!
    const second = cards.find((c) => c.id === secondId)!

    // La comparación se hace por characterId, no por card.id, porque dos cartas
    // del mismo personaje tienen card.id distintos (e.g. 0 y 1) pero el mismo characterId.
    if (first.characterId === second.characterId) {
      // Par correcto: 800ms de pausa para que el jugador vea ambas cartas
      // antes de confirmar el acierto y liberar el bloqueo.
      setTimeout(() => {
        set((state) => {
          const newMatchedIds = [...state.matchedIds, firstId, secondId]
          const newTurns = state.turns + 1

          const finished = newMatchedIds.length === 12 // 6 pares × 2 cartas

          // Persiste el puntaje en localStorage para que la pantalla de resultado
          // pueda mostrar los turnos incluso si el usuario recarga la página.
          if (finished) {
            localStorage.setItem('game-result', String(newTurns))
          }

          return {
            matchedIds: newMatchedIds,
            flippedIds: [],
            turns: newTurns,
            isLocked: false,
            isGameFinished: finished, // dispara la navegación a /result en GamePage
          }
        })
      }, 800)
    } else {
      // Sin par: 800ms de pausa para que el jugador memorice las posiciones,
      // luego se activa errorIds para la animación de shake (600ms),
      // y finalmente las cartas vuelven boca abajo y se libera el bloqueo.
      setTimeout(() => {
        set({ errorIds: newFlipped })
        setTimeout(() => {
          set((state) => ({
            flippedIds: [],
            errorIds: [],
            turns: state.turns + 1,
            isLocked: false,
          }))
        }, 600) // duración de la animación de shake definida en GameCard
      }, 800)
    }
  },

  /**
   * Reinicia completamente el juego y carga personajes nuevos.
   * Limpia el localStorage primero para no mostrar un puntaje viejo
   * si el usuario navega a /result sin completar la nueva partida.
   * cards se vacía antes de llamar a initGame para evitar que las cartas
   * de la partida anterior aparezcan un instante durante la carga.
   */
  resetGame: () => {
    localStorage.removeItem('game-result')
    set({
      cards: [],
      flippedIds: [],
      matchedIds: [],
      errorIds: [],
      turns: 0,
      isPreview: true,
      isMemorizing: false,
      isLocked: false,
      isLoading: false,
      isGameFinished: false,
      hasError: false,
    })
    get().initGame()
  },
}))
