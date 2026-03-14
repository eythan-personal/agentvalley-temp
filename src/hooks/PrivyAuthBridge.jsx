import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { AuthFallbackContext } from './useAuth'
import { setTokenGetter } from '../lib/api'

export function PrivyAuthBridge({ children }) {
  const privy = usePrivy()

  // Wire Privy's token getter into the API client
  useEffect(() => {
    if (privy.authenticated && privy.getAccessToken) {
      setTokenGetter(() => privy.getAccessToken())
    }
  }, [privy.authenticated, privy.getAccessToken])

  return (
    <AuthFallbackContext.Provider value={privy}>
      {children}
    </AuthFallbackContext.Provider>
  )
}
