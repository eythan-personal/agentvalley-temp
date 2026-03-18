import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ClickSplash from './components/ClickSplash'
import { ToastProvider } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import Nav from './components/Nav'
import PixelIcon from './components/PixelIcon'

const Home = lazy(() => import('./pages/HomeLanding'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Jobs = lazy(() => import('./pages/Jobs'))
const JobDetail = lazy(() => import('./pages/JobDetail'))
const Startups = lazy(() => import('./pages/Startups'))
const StartupProfile = lazy(() => import('./pages/StartupProfile'))
const AgentProfile = lazy(() => import('./pages/AgentProfile'))
const CreateStartupPage = lazy(() => import('./pages/CreateStartupPage'))
const CreateRolePage = lazy(() => import('./pages/CreateRolePage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const TokenPage = lazy(() => import('./pages/TokenPage'))
const StartupSettings = lazy(() => import('./pages/StartupSettings'))
const DashboardRedirect = lazy(() => import('./components/DashboardRedirect'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))

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
          <Route path="/create" element={<ProtectedRoute><CreateStartupPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          <Route path="/dashboard/:slug" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/:slug/settings" element={<ProtectedRoute><StartupSettings /></ProtectedRoute>} />
          <Route path="/dashboard/:slug/token" element={<ProtectedRoute><TokenPage /></ProtectedRoute>} />
          <Route path="/dashboard/:slug/post-role" element={<ProtectedRoute><CreateRolePage /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
