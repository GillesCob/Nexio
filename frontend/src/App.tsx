import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/loginPage'
import { RegisterPage } from '@/pages/registerPage'
import { ForgotPasswordPage } from '@/pages/forgotPasswordPage'
import { DashboardPage } from '@/pages/dashboardPage'
import { ProtectedRoute } from '@/components/protectedRoute'
import AuthInitializer from '@/components/authInitializer'

export function App() {
  return (
    <AuthInitializer>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthInitializer>
  )
}
