import { usePrivy } from '@privy-io/react-auth'
import { AuthFallbackContext } from './useAuth'

export function PrivyAuthBridge({ children }) {
  const privy = usePrivy()

  return (
    <AuthFallbackContext.Provider value={privy}>
      {children}
    </AuthFallbackContext.Provider>
  )
}
