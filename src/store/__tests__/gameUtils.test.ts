import { getRandomIds, shuffle } from '../gameUtils'

// ─── getRandomIds ────────────────────────────────────────────────────────────

describe('getRandomIds', () => {
  it('devuelve exactamente la cantidad solicitada de IDs', () => {
    const ids = getRandomIds(6, 826)
    expect(ids).toHaveLength(6)
  })

  it('devuelve IDs únicos (sin repetidos)', () => {
    // Se ejecuta varias veces para reducir la probabilidad de falso positivo
    for (let i = 0; i < 20; i++) {
      const ids = getRandomIds(6, 10)
      expect(new Set(ids).size).toBe(6)
    }
  })

  it('todos los IDs están dentro del rango [1, max]', () => {
    const ids = getRandomIds(6, 10)
    ids.forEach((id) => {
      expect(id).toBeGreaterThanOrEqual(1)
      expect(id).toBeLessThanOrEqual(10)
    })
  })

  it('funciona cuando count es igual a max (range completo)', () => {
    const ids = getRandomIds(5, 5)
    expect(ids).toHaveLength(5)
    expect(new Set(ids).size).toBe(5)
  })
})

// ─── shuffle ─────────────────────────────────────────────────────────────────

describe('shuffle', () => {
  it('devuelve un array de la misma longitud', () => {
    expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5)
  })

  it('contiene exactamente los mismos elementos que el original', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffle(arr).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
  })

  it('no muta el array original', () => {
    const arr = [1, 2, 3, 4, 5]
    const copy = [...arr]
    shuffle(arr)
    expect(arr).toEqual(copy)
  })

  it('devuelve una copia nueva (no la misma referencia)', () => {
    const arr = [1, 2, 3]
    expect(shuffle(arr)).not.toBe(arr)
  })

  it('produce un orden diferente al original con Math.random controlado', () => {
    // Con Math.random siempre 0, j=0 en cada iteración, lo que mueve
    // elementos hacia el frente y produce un orden distinto al original.
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = shuffle([1, 2, 3, 4, 5])
    // Restaurar antes de cualquier expect que pueda fallar
    vi.restoreAllMocks()
    expect(result).not.toEqual([1, 2, 3, 4, 5])
  })

  it('maneja correctamente un array de un solo elemento', () => {
    expect(shuffle([42])).toEqual([42])
  })

  it('maneja correctamente un array vacío', () => {
    expect(shuffle([])).toEqual([])
  })
})
