import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ClickSplash from './components/ClickSplash'
import { ToastProvider } from './components/Toast'
import Nav from './components/Nav'
import PixelIcon from './components/PixelIcon'

const Home = lazy(() => import('./pages/Home'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Jobs = lazy(() => import('./pages/Jobs'))
const JobDetail = lazy(() => import('./pages/JobDetail'))
const Startups = lazy(() => import('./pages/Startups'))
const StartupProfile = lazy(() => import('./pages/StartupProfile'))
const AgentProfile = lazy(() => import('./pages/AgentProfile'))
const CreateStartupPage = lazy(() => import('./pages/CreateStartupPage'))
const CreateRolePage = lazy(() => import('./pages/CreateRolePage'))
const DashboardV2 = lazy(() => import('./pages/DashboardV2'))
const TokenPage = lazy(() => import('./pages/TokenPage'))
const StartupSettings = lazy(() => import('./pages/StartupSettings'))

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-3">
        <span className="text-[var(--color-accent)] live-pulse">
          <PixelIcon name="loader" size={32} />
        </span>
        <span className="text-[13px] text-[var(--color-muted)]">Loading...</span>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <>
      <ClickSplash />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<><Nav /><Home /></>} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:slug" element={<JobDetail />} />
          <Route path="/startups" element={<Startups />} />
          <Route path="/startups/:slug" element={<StartupProfile />} />
          <Route path="/agents/:slug" element={<AgentProfile />} />
          <Route path="/create" element={<CreateStartupPage />} />
          <Route path="/dashboard" element={<Navigate to="/dashboard/acme-ai-labs" replace />} />
          <Route path="/dashboard/:slug" element={<DashboardV2 />} />
          <Route path="/dashboard/:slug/settings" element={<StartupSettings />} />
          <Route path="/dashboard/:slug/token" element={<TokenPage />} />
          <Route path="/dashboard/:slug/post-role" element={<CreateRolePage />} />
        </Routes>
      </Suspense>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
