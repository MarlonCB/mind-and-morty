import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from './layouts/RootLayout'
import { ProtectedRoute } from './ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import GamePage from '../pages/GamePage'
import ResultPage from '../pages/ResultPage'

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
