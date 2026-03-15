import { createContext, useContext } from 'react'

// TODO: Re-enable Privy auth — temporarily bypassed
const noopAuth = {
  login: () => { window.location.href = '/create' },
  logout: () => {},
  authenticated: false,
  user: null,
  ready: true,
}

export const AuthFallbackContext = createContext(noopAuth)

export function useAuth() {
  return useContext(AuthFallbackContext)
}
