import { useGameStore } from '../gameStore'
import type { GameCard } from '../../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Crea una carta de prueba con los campos mínimos necesarios */
const makeCard = (id: number, characterId: number): GameCard => ({
  id,
  characterId,
  name: `Personaje ${characterId}`,
  image: `img-${characterId}.png`,
})

/**
 * 6 pares (12 cartas en total) que coinciden con la suposición del store
 * de que la partida termina cuando matchedIds.length === 12.
 * Los pares comparten characterId: (0,1)→char1, (2,3)→char2, etc.
 */
const testCards: GameCard[] = [
  makeCard(0, 1), makeCard(1, 1), // par 1
  makeCard(2, 2), makeCard(3, 2), // par 2
  makeCard(4, 3), makeCard(5, 3), // par 3
  makeCard(6, 4), makeCard(7, 4), // par 4
  makeCard(8, 5), makeCard(9, 5), // par 5
  makeCard(10, 6), makeCard(11, 6), // par 6
]

/** Estado inicial limpio del store (espeja los valores de gameStore.ts) */
const initialState = {
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
}

// Mock de fetch para que initGame no haga llamadas reales a la API
const mockCharacters = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: `Char${i + 1}`,
  image: `img${i + 1}.png`,
}))

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue(mockCharacters),
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

beforeEach(() => {
  vi.useFakeTimers()
  // Resetear el store a estado limpio antes de cada test
  useGameStore.setState(initialState)
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

// ─── startGame ───────────────────────────────────────────────────────────────

describe('startGame', () => {
  it('activa la fase de memorización', () => {
    useGameStore.setState({ ...initialState, cards: testCards })
    useGameStore.getState().startGame()
    expect(useGameStore.getState().isMemorizing).toBe(true)
  })

  it('mantiene isPreview en true durante la memorización', () => {
    useGameStore.setState({ ...initialState, cards: testCards })
    useGameStore.getState().startGame()
    // Las cartas deben seguir boca arriba hasta que beginPlay las voltee
    expect(useGameStore.getState().isPreview).toBe(true)
  })

  it('resetea los contadores de turno', () => {
    useGameStore.setState({ ...initialState, cards: testCards, turns: 5 })
    useGameStore.getState().startGame()
    expect(useGameStore.getState().turns).toBe(0)
  })

  it('baraja las cartas (produce un orden diferente)', () => {
    useGameStore.setState({ ...initialState, cards: testCards })
    // Forzar que Math.random devuelva 0 para garantizar un shuffle predecible
    vi.spyOn(Math, 'random').mockReturnValue(0)
    useGameStore.getState().startGame()
    vi.restoreAllMocks()
    const shuffledIds = useGameStore.getState().cards.map((c) => c.id)
    expect(shuffledIds).not.toEqual(testCards.map((c) => c.id))
  })
})

// ─── beginPlay ───────────────────────────────────────────────────────────────

describe('beginPlay', () => {
  it('pone isPreview en false (voltea las cartas boca abajo)', () => {
    useGameStore.setState({ isPreview: true, isMemorizing: true })
    useGameStore.getState().beginPlay()
    expect(useGameStore.getState().isPreview).toBe(false)
  })

  it('pone isMemorizing en false', () => {
    useGameStore.setState({ isMemorizing: true })
    useGameStore.getState().beginPlay()
    expect(useGameStore.getState().isMemorizing).toBe(false)
  })

  it('libera el bloqueo (isLocked)', () => {
    useGameStore.setState({ isLocked: true })
    useGameStore.getState().beginPlay()
    expect(useGameStore.getState().isLocked).toBe(false)
  })
})

// ─── flipCard ────────────────────────────────────────────────────────────────

describe('flipCard', () => {
  // Estado base para los tests de flipCard: juego activo con cartas cargadas
  beforeEach(() => {
    useGameStore.setState({ ...initialState, isPreview: false, cards: testCards })
  })

  it('ignora el click si isPreview es true', () => {
    useGameStore.setState({ isPreview: true })
    useGameStore.getState().flipCard(0)
    expect(useGameStore.getState().flippedIds).toHaveLength(0)
  })

  it('ignora el click si isLocked es true', () => {
    useGameStore.setState({ isLocked: true })
    useGameStore.getState().flipCard(0)
    expect(useGameStore.getState().flippedIds).toHaveLength(0)
  })

  it('ignora cartas ya emparejadas', () => {
    useGameStore.setState({ matchedIds: [0, 1] })
    useGameStore.getState().flipCard(0)
    expect(useGameStore.getState().flippedIds).toHaveLength(0)
  })

  it('ignora una carta que ya está volteada', () => {
    useGameStore.getState().flipCard(0)
    useGameStore.getState().flipCard(0) // segundo click en la misma carta
    expect(useGameStore.getState().flippedIds).toHaveLength(1)
  })

  it('agrega la carta a flippedIds al primer click', () => {
    useGameStore.getState().flipCard(0)
    expect(useGameStore.getState().flippedIds).toContain(0)
  })

  it('bloquea el store cuando se voltean dos cartas', () => {
    useGameStore.getState().flipCard(0) // char1
    useGameStore.getState().flipCard(2) // char2 — par incorrecto
    expect(useGameStore.getState().isLocked).toBe(true)
  })

  it('confirma el par correcto después de 800ms y agrega a matchedIds', () => {
    useGameStore.getState().flipCard(0) // char1
    useGameStore.getState().flipCard(1) // char1 — mismo characterId

    vi.advanceTimersByTime(800)

    expect(useGameStore.getState().matchedIds).toContain(0)
    expect(useGameStore.getState().matchedIds).toContain(1)
  })

  it('vacía flippedIds después de confirmar el par', () => {
    useGameStore.getState().flipCard(0)
    useGameStore.getState().flipCard(1)
    vi.advanceTimersByTime(800)
    expect(useGameStore.getState().flippedIds).toHaveLength(0)
  })

  it('incrementa los turnos al confirmar un par', () => {
    useGameStore.getState().flipCard(0)
    useGameStore.getState().flipCard(1)
    vi.advanceTimersByTime(800)
    expect(useGameStore.getState().turns).toBe(1)
  })

  it('libera isLocked después de confirmar el par', () => {
    useGameStore.getState().flipCard(0)
    useGameStore.getState().flipCard(1)
    vi.advanceTimersByTime(800)
    expect(useGameStore.getState().isLocked).toBe(false)
  })

  it('activa isGameFinished al emparejar las 12 cartas', () => {
    // Pre-emparejar 5 pares para solo necesitar el 6to en el test
    useGameStore.setState({ matchedIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] })
    useGameStore.getState().flipCard(10)
    useGameStore.getState().flipCard(11)
    vi.advanceTimersByTime(800)
    expect(useGameStore.getState().isGameFinished).toBe(true)
  })

  it('guarda el puntaje en localStorage al completar la partida', () => {
    useGameStore.setState({ matchedIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], turns: 7 })
    useGameStore.getState().flipCard(10)
    useGameStore.getState().flipCard(11)
    vi.advanceTimersByTime(800)
    expect(localStorage.getItem('game-result')).toBe('8') // turns 7 + 1
  })

  it('activa errorIds después de 800ms cuando el par no coincide', () => {
    useGameStore.getState().flipCard(0) // char1
    useGameStore.getState().flipCard(2) // char2 — diferente
    vi.advanceTimersByTime(800)
    expect(useGameStore.getState().errorIds).toContain(0)
    expect(useGameStore.getState().errorIds).toContain(2)
  })

  it('limpia errorIds y flippedIds después de la animación de shake (800 + 600ms)', () => {
    useGameStore.getState().flipCard(0)
    useGameStore.getState().flipCard(2)
    vi.advanceTimersByTime(800 + 600)
    expect(useGameStore.getState().errorIds).toHaveLength(0)
    expect(useGameStore.getState().flippedIds).toHaveLength(0)
  })

  it('incrementa los turnos cuando el par no coincide', () => {
    useGameStore.getState().flipCard(0)
    useGameStore.getState().flipCard(2)
    vi.advanceTimersByTime(800 + 600)
    expect(useGameStore.getState().turns).toBe(1)
  })

  it('libera isLocked después del shake en par incorrecto', () => {
    useGameStore.getState().flipCard(0)
    useGameStore.getState().flipCard(2)
    vi.advanceTimersByTime(800 + 600)
    expect(useGameStore.getState().isLocked).toBe(false)
  })
})

// ─── resetGame ───────────────────────────────────────────────────────────────

describe('resetGame', () => {
  it('resetea contadores y arrays de estado', () => {
    useGameStore.setState({
      turns: 5,
      matchedIds: [0, 1, 2, 3],
      flippedIds: [4],
      errorIds: [4, 5],
      isGameFinished: true,
    })
    useGameStore.getState().resetGame()
    const state = useGameStore.getState()
    expect(state.turns).toBe(0)
    expect(state.matchedIds).toHaveLength(0)
    expect(state.flippedIds).toHaveLength(0)
    expect(state.errorIds).toHaveLength(0)
    expect(state.isGameFinished).toBe(false)
  })

  it('restaura las flags de control', () => {
    useGameStore.setState({ isPreview: false, isMemorizing: true, isLocked: true })
    useGameStore.getState().resetGame()
    const state = useGameStore.getState()
    expect(state.isPreview).toBe(true)
    expect(state.isMemorizing).toBe(false)
    expect(state.isLocked).toBe(false)
  })

  it('elimina game-result de localStorage', () => {
    localStorage.setItem('game-result', '10')
    useGameStore.getState().resetGame()
    expect(localStorage.getItem('game-result')).toBeNull()
  })

  it('inicia la carga de nuevas cartas (isLoading pasa a true)', () => {
    useGameStore.getState().resetGame()
    // initGame se llama internamente; su primera operación es set({ isLoading: true })
    expect(useGameStore.getState().isLoading).toBe(true)
  })
})
