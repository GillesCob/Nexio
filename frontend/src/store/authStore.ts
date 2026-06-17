import { create } from 'zustand'
import type { IUser } from '@/types/auth'

interface IAuthState {
  accessToken: string | null
  user: IUser | null
  setAuth: (token: string, user: IUser) => void
  clearAuth: () => void
}

export const useAuthStore = create<IAuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
}))
