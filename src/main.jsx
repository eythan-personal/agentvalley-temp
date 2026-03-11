import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

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
          loginMethods: ['wallet', 'google'],
          appearance: {
            theme: 'dark',
            accentColor: '#00FF41',
            logo: null,
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
