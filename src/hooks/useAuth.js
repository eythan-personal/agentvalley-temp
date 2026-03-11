import { createContext, useContext } from 'react'

const noopAuth = {
  login: () => console.warn('Set VITE_PRIVY_APP_ID in .env to enable auth'),
  logout: () => {},
  authenticated: false,
  user: null,
  ready: true,
}

export const AuthFallbackContext = createContext(noopAuth)

export function useAuth() {
  return useContext(AuthFallbackContext)
}
