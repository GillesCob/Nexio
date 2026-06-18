import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { ReactNode } from 'react'

interface IProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: IProtectedRouteProps) {
  const accessToken = useAuthStore((s) => s.accessToken)

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

ProtectedRoute.displayName = 'ProtectedRoute'
