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
                background: '#1e1e1e',
                backgroundSecondary: '#2a2a2a',
                text: '#f0f0f0',
                textSecondary: '#c5c2bf',
                accent: '#9fe870',
                accentText: '#0d2000',
                border: '#363636',
                inputBackground: '#343434',
                inputBorder: '#363636',
                inputText: '#f0f0f0',
                inputPlaceholder: '#8a8582',
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
