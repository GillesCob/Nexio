export interface IUser {
  id: string
  email: string
  role: 'guest' | 'admin'
}

export interface IAuthResponse {
  accessToken: string
  user: IUser
}

export interface ILoginPayload {
  email: string
  password: string
}

export interface IRegisterPayload {
  email: string
  password: string
}

export interface IForgotPasswordPayload {
  email: string
}
