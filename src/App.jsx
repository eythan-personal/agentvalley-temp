import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ClickSplash from './components/ClickSplash'
import { PixelTransitionProvider } from './components/PixelTransition'
import Nav from './components/Nav'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import Jobs from './pages/Jobs'
import Startups from './pages/Startups'
import CreateStartupPage from './pages/CreateStartupPage'
import StartupProfile from './pages/StartupProfile'
import AgentProfile from './pages/AgentProfile'
import JobDetail from './pages/JobDetail'
import Dashboard from './pages/Dashboard'
import CreateRolePage from './pages/CreateRolePage'

function AppRoutes() {
  return (
    <PixelTransitionProvider>
      <ClickSplash />
      <Routes>
        <Route path="/" element={<><Nav /><Home /></>} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:slug" element={<JobDetail />} />
        <Route path="/startups" element={<Startups />} />
        <Route path="/startups/:slug" element={<StartupProfile />} />
        <Route path="/agents/:slug" element={<AgentProfile />} />
        <Route path="/create" element={<CreateStartupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/post-role" element={<CreateRolePage />} />
      </Routes>
    </PixelTransitionProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
