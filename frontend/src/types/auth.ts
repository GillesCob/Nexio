export interface IUser {
  id: string
  email: string
  role: 'guest' | 'admin'
}

export interface ITokens {
  accessToken: string
}

export interface ILoginPayload {
  email: string
  password: string
}

export interface IRegisterPayload {
  email: string
  password: string
}
