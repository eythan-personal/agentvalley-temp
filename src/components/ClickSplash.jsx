import { useEffect, useRef } from 'react'

const PIXEL = 5
const COLOR = '#9fe870'

// Classic 8-bit radial burst frames — each frame is a ring of pixel offsets
// Think Mega Man hit effect or retro RPG impact
const FRAMES = [
  // Frame 0: center cross
  [
    [0, 0],
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ],
  // Frame 1: expanding diamond
  [
    [-2, 0], [2, 0], [0, -2], [0, 2],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
  ],
  // Frame 2: larger ring
  [
    [-3, 0], [3, 0], [0, -3], [0, 3],
    [-2, -2], [2, -2], [-2, 2], [2, 2],
    [-3, -1], [3, -1], [-3, 1], [3, 1],
    [-1, -3], [1, -3], [-1, 3], [1, 3],
  ],
  // Frame 3: outer burst points only
  [
    [-4, 0], [4, 0], [0, -4], [0, 4],
    [-3, -3], [3, -3], [-3, 3], [3, 3],
  ],
  // Frame 4: fading tips
  [
    [-5, 0], [5, 0], [0, -5], [0, 5],
  ],
]

const FRAME_DURATION = 45 // ms per frame
const TOTAL_DURATION = FRAMES.length * FRAME_DURATION

export default function ClickSplash() {
  const canvasRef = useRef(null)
  const bursts = useRef([])
  const animFrame = useRef(null)
  const isAnimating = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = (x, y) => {
      bursts.current.push({ x, y, start: performance.now() })

      if (!isAnimating.current) {
        isAnimating.current = true
        animate()
      }
    }

    const animate = () => {
      const now = performance.now()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      bursts.current = bursts.current.filter((burst) => {
        const elapsed = now - burst.start
        if (elapsed > TOTAL_DURATION) return false

        const frameIndex = Math.min(
          Math.floor(elapsed / FRAME_DURATION),
          FRAMES.length - 1
        )

        // Fade out over last 2 frames
        const progress = elapsed / TOTAL_DURATION
        const alpha = progress > 0.6 ? 1 - (progress - 0.6) / 0.4 : 1

        ctx.globalAlpha = alpha
        ctx.fillStyle = COLOR

        const pixels = FRAMES[frameIndex]
        for (const [ox, oy] of pixels) {
          ctx.fillRect(
            Math.round(burst.x + ox * PIXEL - PIXEL / 2),
            Math.round(burst.y + oy * PIXEL - PIXEL / 2),
            PIXEL,
            PIXEL
          )
        }

        return true
      })

      ctx.globalAlpha = 1

      if (bursts.current.length > 0) {
        animFrame.current = requestAnimationFrame(animate)
      } else {
        isAnimating.current = false
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    const onClick = (e) => spawn(e.clientX, e.clientY)
    window.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('click', onClick)
      window.removeEventListener('resize', resize)
      if (animFrame.current) cancelAnimationFrame(animFrame.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
