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
            theme: {
              colors: {
                background: '#ffffff',
                backgroundSecondary: '#f5f5f0',
                text: '#1a1a1a',
                textSecondary: '#6b6b6b',
                accent: '#9fe870',
                accentText: '#0d2000',
                border: '#e5e5e0',
                inputBackground: '#f5f5f0',
                inputBorder: '#e5e5e0',
                inputText: '#1a1a1a',
                inputPlaceholder: '#a0a0a0',
                error: '#ef4444',
              },
              borderRadius: 'lg',
              fontFamily: "'Sora', sans-serif",
            },
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
