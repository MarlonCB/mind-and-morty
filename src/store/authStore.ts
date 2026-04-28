import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState } from '../types'

/**
 * Credenciales de demostración hardcodeadas.
 * `as const` hace que TypeScript infiera los tipos literales exactos
 * (e.g. 'password123' en lugar de string) y evita mutaciones accidentales.
 * En producción esto sería reemplazado por una llamada a un endpoint de autenticación real.
 */
const MOCK_CREDENTIALS = {
  email: 'demo@memorygame.com',
  password: 'password123',
  token: 'fake-jwt-token-123456',
} as const

/**
 * El middleware `persist` de Zustand sincroniza automáticamente las partes
 * seleccionadas del estado con localStorage. Elimina la necesidad de llamar
 * manualmente a localStorage.setItem/getItem/removeItem para la sesión.
 *
 * Cómo funciona:
 *  - Al arrancar la app, `persist` rehidrata el store desde localStorage.
 *  - Cada vez que el estado cambia, `persist` serializa y guarda las partes
 *    definidas en `partialize`.
 *  - Al hacer logout y setear { isAuthenticated: false, token: null, user: null },
 *    `persist` actualiza localStorage con esos valores automáticamente.
 *
 * `partialize` selecciona solo los campos de datos (no las funciones) para
 * que no se intente serializar callbacks en JSON.
 *
 * Nota: `create<AuthState>()()` — la doble invocación es el patrón requerido
 * por Zustand 5 al usar middleware con TypeScript.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Valores por defecto: persist los sobreescribe con los datos guardados al hidratar
      isAuthenticated: false,
      token: null,
      user: null,

      /**
       * Simula el inicio de sesión con un retardo de 800ms para imitar la latencia
       * de una API real. Esto mejora la UX (feedback de carga visible) y evita
       * que el formulario dé una respuesta instantánea que parezca errónea.
       *
       * Devuelve true si las credenciales son correctas, false si no.
       * El componente Login usa este valor para mostrar el error o navegar al juego.
       * persist se encarga de guardar el nuevo estado en localStorage automáticamente.
       */
      login: async (email, password) => {
        // Pausa artificial que simula la llamada al backend
        await new Promise((resolve) => setTimeout(resolve, 800))

        if (email !== MOCK_CREDENTIALS.email || password !== MOCK_CREDENTIALS.password) {
          return false
        }

        set({ isAuthenticated: true, token: MOCK_CREDENTIALS.token, user: { email } })
        return true
      },

      /**
       * Cierra la sesión. persist actualiza localStorage automáticamente al cambiar
       * el estado. game-result se elimina manualmente porque es una clave del juego,
       * no de autenticación, y no está gestionada por este store.
       */
      logout: () => {
        localStorage.removeItem('game-result')
        set({ isAuthenticated: false, token: null, user: null })
      },
    }),
    {
      name: 'auth-storage', // clave en localStorage donde persist guarda el estado
      // Solo persiste los campos de datos, nunca las funciones (no son serializables a JSON)
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
      }),
    }
  )
)
