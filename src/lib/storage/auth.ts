import { readJSON, writeJSON } from './base'
import { STORAGE_KEYS } from './keys'

export type User = {
  username: string
  password: string
}

export type AuthSession = {
  isLoggedIn: boolean
  username: string | null
  lastLoginAt: string | null
}

const AUTH_KEY = 'physiolog_auth_session'
const USERS_KEY = 'physiolog_users'

export const authStore = {
  getSession(): AuthSession {
    return readJSON<AuthSession>(AUTH_KEY, {
      isLoggedIn: false,
      username: null,
      lastLoginAt: null,
    })
  },

  getUsers(): User[] {
    return readJSON<User[]>(USERS_KEY, [])
  },

  signup(username: string, password: string): boolean {
    if (typeof window === 'undefined') return false
    const users = this.getUsers()
    if (users.find((u) => u.username === username)) return false // 중복 가입 방지

    const newUser: User = { username, password }
    writeJSON(USERS_KEY, [...users, newUser])
    return true
  },

  login(username: string, password: string): boolean {
    if (typeof window === 'undefined') return false
    const users = this.getUsers()
    const user = users.find((u) => u.username === username && u.password === password)
    
    if (user) {
      const session: AuthSession = {
        isLoggedIn: true,
        username: user.username,
        lastLoginAt: new Date().toISOString(),
      }
      writeJSON(AUTH_KEY, session)
      return true
    }
    return false
  },

  logout() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(AUTH_KEY)
  },

  isInitialized(): boolean {
    if (typeof window === 'undefined') return false
    return this.getUsers().length > 0
  }
}
