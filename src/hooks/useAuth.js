import { createContext, useContext } from 'react'

const noopAuth = {
  login: () => { window.location.href = '/dashboard/acme-ai-labs' },
  logout: () => {},
  authenticated: false,
  user: null,
  ready: true,
}

export const AuthFallbackContext = createContext(noopAuth)

export function useAuth() {
  return useContext(AuthFallbackContext)
}
