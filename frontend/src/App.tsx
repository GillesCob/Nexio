import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/loginPage'
import { RegisterPage } from '@/pages/registerPage'
import { ForgotPasswordPage } from '@/pages/forgotPasswordPage'
import { DashboardPage } from '@/pages/dashboardPage'
import { StatsPage } from '@/pages/statsPage'
import { JobOffersPage } from '@/pages/jobOffersPage'
import { ProspectCompaniesPage } from '@/pages/prospectCompaniesPage'
import { ProtectedRoute } from '@/components/protectedRoute'
import AuthInitializer from '@/components/authInitializer'
import { ScrollToTop } from '@/components/scrollToTop'

export function App() {
  return (
    <AuthInitializer>
      <ScrollToTop />
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
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <StatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-offers"
          element={
            <ProtectedRoute>
              <JobOffersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prospects"
          element={
            <ProtectedRoute>
              <ProspectCompaniesPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthInitializer>
  )
}
