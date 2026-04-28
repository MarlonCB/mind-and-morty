import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from './layouts/RootLayout'
import { ProtectedRoute } from './ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import GamePage from '../pages/GamePage'
import ResultPage from '../pages/ResultPage'

/**
 * Configuración centralizada de rutas con React Router v7.
 *
 * Estructura:
 *  /            → LoginPage  (pública; redirige a /game si ya hay sesión)
 *  /game        → GamePage   (protegida)
 *  /result      → ResultPage (protegida)
 *  /*           → redirige a / para evitar páginas 404 en blanco
 *
 * ProtectedRoute agrupa /game y /result bajo un layout route sin path;
 * si el usuario no está autenticado ambas redirigen al login.
 * RootLayout envuelve todo y provee el div raíz compartido.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LoginPage /> },
      {
        // Layout route sin path: no añade segmento a la URL pero
        // ejecuta la guarda de autenticación para todas sus rutas hijas.
        element: <ProtectedRoute />,
        children: [
          { path: 'game', element: <GamePage /> },
          { path: 'result', element: <ResultPage /> },
        ],
      },
      // Catch-all: cualquier ruta desconocida vuelve al inicio
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
