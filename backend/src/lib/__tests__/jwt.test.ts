import jwt from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken, generateExtensionToken } from '../jwt'

describe('jwt', () => {
  it("l'access token contient userId et role et se vérifie avec JWT_SECRET", () => {
    const token = generateAccessToken('u1', 'USER')
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload
    expect(payload.userId).toBe('u1')
    expect(payload.role).toBe('USER')
  })

  it("l'access token n'est pas valide avec le secret du refresh token", () => {
    const token = generateAccessToken('u1', 'USER')
    expect(() => jwt.verify(token, process.env.JWT_REFRESH_SECRET!)).toThrow()
  })

  it('le refresh token ne contient pas le rôle et se vérifie avec JWT_REFRESH_SECRET', () => {
    const token = generateRefreshToken('u1')
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as jwt.JwtPayload
    expect(payload.userId).toBe('u1')
    expect(payload.role).toBeUndefined()
    expect(() => jwt.verify(token, process.env.JWT_SECRET!)).toThrow()
  })

  it("le token d'extension se vérifie avec JWT_SECRET et expire après l'access token par défaut", () => {
    const access = jwt.decode(generateAccessToken('u1', 'USER')) as jwt.JwtPayload
    const ext = jwt.decode(generateExtensionToken('u1', 'USER')) as jwt.JwtPayload
    expect(ext.userId).toBe('u1')
    expect(ext.exp! - ext.iat!).toBeGreaterThan(access.exp! - access.iat!)
    expect(() => jwt.verify(generateExtensionToken('u1', 'USER'), process.env.JWT_SECRET!)).not.toThrow()
  })

  it("un token signé avec un autre secret est refusé", () => {
    const forged = jwt.sign({ userId: 'u1', role: 'ADMIN' }, 'autre-secret')
    expect(() => jwt.verify(forged, process.env.JWT_SECRET!)).toThrow()
  })
})
