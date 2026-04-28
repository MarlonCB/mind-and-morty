import { useAuthStore } from '../authStore'

/** Credenciales correctas definidas en authStore.ts */
const VALID_EMAIL = 'demo@memorygame.com'
const VALID_PASSWORD = 'password123'
const VALID_TOKEN = 'fake-jwt-token-123456'

beforeEach(() => {
  vi.useFakeTimers()
  // Limpiar localStorage y resetear el store entre tests para evitar contaminación
  localStorage.clear()
  useAuthStore.setState({ isAuthenticated: false, token: null, user: null })
})

afterEach(() => {
  vi.useRealTimers()
})

// ─── login ───────────────────────────────────────────────────────────────────

describe('login', () => {
  it('devuelve false con email incorrecto', async () => {
    const promise = useAuthStore.getState().login('malo@email.com', VALID_PASSWORD)
    vi.advanceTimersByTime(800) // adelanta la pausa simulada de red
    expect(await promise).toBe(false)
  })

  it('devuelve false con contraseña incorrecta', async () => {
    const promise = useAuthStore.getState().login(VALID_EMAIL, 'contrasenaMala')
    vi.advanceTimersByTime(800)
    expect(await promise).toBe(false)
  })

  it('devuelve true con credenciales correctas', async () => {
    const promise = useAuthStore.getState().login(VALID_EMAIL, VALID_PASSWORD)
    vi.advanceTimersByTime(800)
    expect(await promise).toBe(true)
  })

  it('pone isAuthenticated en true al hacer login exitoso', async () => {
    const promise = useAuthStore.getState().login(VALID_EMAIL, VALID_PASSWORD)
    vi.advanceTimersByTime(800)
    await promise
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('guarda el token en el estado', async () => {
    const promise = useAuthStore.getState().login(VALID_EMAIL, VALID_PASSWORD)
    vi.advanceTimersByTime(800)
    await promise
    expect(useAuthStore.getState().token).toBe(VALID_TOKEN)
  })

  it('guarda el usuario con el email correcto', async () => {
    const promise = useAuthStore.getState().login(VALID_EMAIL, VALID_PASSWORD)
    vi.advanceTimersByTime(800)
    await promise
    expect(useAuthStore.getState().user).toEqual({ email: VALID_EMAIL })
  })

  it('no modifica el estado cuando las credenciales son incorrectas', async () => {
    const promise = useAuthStore.getState().login('x@x.com', 'wrong')
    vi.advanceTimersByTime(800)
    await promise
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })
})

// ─── logout ──────────────────────────────────────────────────────────────────

describe('logout', () => {
  // Helper: deja al store en estado autenticado para los tests de logout
  const authenticate = async () => {
    const promise = useAuthStore.getState().login(VALID_EMAIL, VALID_PASSWORD)
    vi.advanceTimersByTime(800)
    await promise
  }

  it('pone isAuthenticated en false', async () => {
    await authenticate()
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('limpia el token', async () => {
    await authenticate()
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('limpia el usuario', async () => {
    await authenticate()
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('elimina game-result de localStorage', () => {
    localStorage.setItem('game-result', '5')
    useAuthStore.getState().logout()
    expect(localStorage.getItem('game-result')).toBeNull()
  })
})
