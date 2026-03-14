import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const TransitionContext = createContext(null)

export function usePixelTransition() {
  return useContext(TransitionContext)
}

// Seeded PRNG
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const greenShades = [
  '#9fe870', '#8ad85e', '#b5f090', '#7cc84a',
  '#6db83c', '#5ea830', '#a8ec7a', '#92e064',
  '#c2f4a0', '#85d050',
]

const PIXEL_SIZE = 14
const SWEEP_DURATION = 600
// How wide the "band" of active pixels is (0–1, as fraction of screen width)
const BAND_WIDTH = 0.45

export function PixelTransitionProvider({ children }) {
  const canvasRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [transitioning, setTransitioning] = useState(false)
  const animRef = useRef(null)

  const buildGrid = useCallback(() => {
    const w = window.innerWidth
    const h = window.innerHeight
    const cols = Math.ceil(w / PIXEL_SIZE)
    const rows = Math.ceil(h / PIXEL_SIZE)
    const rng = mulberry32(Date.now())

    const cells = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({
          x: c * PIXEL_SIZE,
          y: r * PIXEL_SIZE,
          // Normalized horizontal position (0–1) with slight vertical jitter
          pos: (c / cols) + (rng() - 0.5) * 0.08,
          color: greenShades[Math.floor(rng() * greenShades.length)],
        })
      }
    }

    return { cells, w, h }
  }, [])

  const navigateTo = useCallback(
    (to) => {
      if (transitioning) return
      if (to === location.pathname) return

      setTransitioning(true)
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      canvas.style.display = 'block'

      const grid = buildGrid()
      let start = null
      let navigated = false

      const animate = (timestamp) => {
        if (!start) start = timestamp
        // Progress goes from 0 to 1+BAND_WIDTH so the band fully exits the screen
        const progress = Math.min((timestamp - start) / SWEEP_DURATION, 1 + BAND_WIDTH)

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // The "band" leading edge moves from -BAND_WIDTH to 1.0
        // Pixels appear as the leading edge passes, disappear as the trailing edge passes
        const leadingEdge = progress
        const trailingEdge = progress - BAND_WIDTH

        for (const cell of grid.cells) {
          // How far into the band this cell is
          const enterProgress = (leadingEdge - cell.pos) / (BAND_WIDTH * 0.3)
          const exitProgress = (cell.pos - trailingEdge) / (BAND_WIDTH * 0.3)

          const appear = Math.max(0, Math.min(1, enterProgress))
          const remain = Math.max(0, Math.min(1, exitProgress))
          const visibility = Math.min(appear, remain)

          if (visibility > 0) {
            const size = visibility * PIXEL_SIZE
            const offset = (PIXEL_SIZE - size) / 2
            ctx.fillStyle = cell.color
            ctx.fillRect(cell.x + offset, cell.y + offset, size, size)
          }
        }

        // Navigate when the band is roughly at the center of the screen
        if (!navigated && progress >= 0.5) {
          navigate(to)
          navigated = true
        }

        if (progress >= 1 + BAND_WIDTH) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          canvas.style.display = 'none'
          setTransitioning(false)
          animRef.current = null
          return
        }

        animRef.current = requestAnimationFrame(animate)
      }

      animRef.current = requestAnimationFrame(animate)
    },
    [transitioning, location.pathname, navigate, buildGrid]
  )

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <TransitionContext.Provider value={navigateTo}>
      {children}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{ display: 'none' }}
      />
    </TransitionContext.Provider>
  )
}
