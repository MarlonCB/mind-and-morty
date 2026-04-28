/**
 * Genera `count` IDs únicos aleatorios en el rango [1, max].
 * Usa un Set para garantizar que no se repitan sin necesidad de filtrado
 * posterior; el bucle simplemente reintenta si saca un duplicado.
 */
export function getRandomIds(count: number, max: number): number[] {
  const ids = new Set<number>()
  while (ids.size < count) {
    ids.add(Math.floor(Math.random() * max) + 1) // +1 porque la API empieza en ID 1
  }
  return Array.from(ids)
}

/**
 * Barajado Fisher-Yates (Knuth shuffle).
 * Recorre el array de atrás hacia adelante e intercambia cada elemento
 * con uno aleatorio de los que quedan por procesar, garantizando distribución
 * uniforme en O(n). Devuelve una copia nueva para no mutar el array original.
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
