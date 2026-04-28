import { useState, useEffect } from 'react'

/**
 * Devuelve el ancho y alto actuales de la ventana y los mantiene sincronizados
 * con los eventos de resize del navegador.
 *
 * Por qué existe: leer window.innerWidth/Height directamente en un componente
 * solo captura el valor en el momento del render inicial. Si la ventana cambia
 * de tamaño, el componente no se actualiza. Este hook suscribe un listener para
 * que el estado de React refleje siempre el tamaño real de la ventana.
 *
 * El cleanup (removeEventListener) es necesario para evitar memory leaks:
 * si el componente que usa este hook se desmonta, el listener debe eliminarse
 * o seguiría intentando actualizar estado en un componente ya destruido.
 *
 * Las deps de useEffect son [] porque el listener se registra una sola vez;
 * `handler` no necesita estar en deps porque siempre lee window directamente
 * (no depende de props ni estado del componente).
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,   // valor inicial en el momento de montar el componente
    height: window.innerHeight,
  })

  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler) // cleanup al desmontar
  }, [])

  return size
}
