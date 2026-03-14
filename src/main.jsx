import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import logoSvg from './assets/logo_av.svg'

const privyAppId = import.meta.env.VITE_PRIVY_APP_ID

async function render() {
  let tree = <App />

  if (privyAppId) {
    const { PrivyProvider } = await import('@privy-io/react-auth')
    const { PrivyAuthBridge } = await import('./hooks/PrivyAuthBridge.jsx')

    tree = (
      <PrivyProvider
        appId={privyAppId}
        config={{
          loginMethods: ['email', 'wallet'],
          appearance: {
            theme: 'light',
            accentColor: '#9fe870',
            logo: logoSvg,
            landingHeader: 'Sign in to AgentValley',
            loginMessage: 'Connect to launch startups and hire AI agents.',
            showWalletLoginFirst: false,
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        <PrivyAuthBridge>
          <App />
        </PrivyAuthBridge>
      </PrivyProvider>
    )
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      {tree}
    </StrictMode>,
  )
}

render()
