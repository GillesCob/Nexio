import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/lib/axiosClient'
import { useAuthStore } from '@/store/authStore'
import type {
  IAuthResponse,
  ILoginPayload,
  IRegisterPayload,
  IForgotPasswordPayload,
} from '@/types/auth'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (payload: ILoginPayload) =>
      apiClient.post<IAuthResponse>('/auth/login', payload).then((r) => r.data),
    onSuccess: ({ accessToken, user }) => {
      setAuth(accessToken, user)
      navigate('/dashboard', { replace: true })
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (payload: IRegisterPayload) =>
      apiClient.post<IAuthResponse>('/auth/register', payload).then((r) => r.data),
    onSuccess: ({ accessToken, user }) => {
      setAuth(accessToken, user)
      navigate('/dashboard', { replace: true })
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: IForgotPasswordPayload) =>
      apiClient.post('/auth/forgot-password', payload).then((r) => r.data),
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return useMutation({
    mutationFn: () => apiClient.post('/auth/logout').then((r) => r.data),
    onSettled: () => {
      clearAuth()
      navigate('/login', { replace: true })
    },
  })
}
