import { useEffect } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { RootLayout } from './layouts/RootLayout'
import { useAuthStore } from '../store'
import LoginPage from '../pages/LoginPage'
import GamePage from '../pages/GamePage'
import ResultPage from '../pages/ResultPage'

function ProtectedRoute() {
  const { isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'game', element: <GamePage /> },
          { path: 'result', element: <ResultPage /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
