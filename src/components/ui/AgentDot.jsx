/**
 * Agent avatar — gradient circle with initials derived from name.
 * Uses OKLCH colors with deterministic gradient variations.
 */

// Vibrant saturated pastels in OKLCH [L, C, H]
const AGENT_COLORS = [
  [0.709, 0.159, 293.541], // lavender
  [0.77,  0.12,  253.03],  // sky blue
  [0.797, 0.134, 211.53],  // cyan
  [0.773, 0.153, 163.223], // mint
  [0.857, 0.17,  134.555], // lime (accent)
  [0.816, 0.166, 108.43],  // chartreuse
  [0.758, 0.159, 55.934],  // tangerine
  [0.711, 0.166, 22.216],  // coral
  [0.725, 0.175, 349.761], // pink
]

function hashName(name) {
  if (!name) return 0
  let h = 0xDEAD
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i)
    h = Math.imul(h, 0x5bd1e995)
    h ^= h >>> 15
  }
  return Math.abs(h)
}

function oklch(l, c, h) {
  return `oklch(${l} ${c} ${h})`
}

function getAgentGradient(name) {
  const hash = hashName(name)
  const base = AGENT_COLORS[hash % AGENT_COLORS.length]
  const [l, c, h] = base

  // Secondary hash for variation
  const hash2 = hashName(name + name)

  // Gradient angle from hash (deterministic)
  const angle = (hash2 % 360)

  // Color variants
  const light = oklch(Math.min(l + 0.15, 0.95), c * 0.6, h)        // lighter, less saturated
  const mid = oklch(l, c, h)                                         // base
  const dark = oklch(Math.max(l - 0.15, 0.35), c * 1.1, h + 5)     // darker, slightly shifted hue
  const highlight = oklch(Math.min(l + 0.25, 0.97), c * 0.3, h)    // near-white tint

  // Pick gradient style based on hash
  const variant = hash2 % 3

  if (variant === 0) {
    // Diagonal gradient: light → dark
    return { angle, stops: [light, mid, dark] }
  } else if (variant === 1) {
    // Highlight spot: white center fading to color
    return { angle, stops: [highlight, mid, dark], radial: true }
  } else {
    // Two-tone: base with shifted hue accent
    const shifted = oklch(l, c * 0.9, (h + 30) % 360)
    return { angle, stops: [mid, shifted, dark] }
  }
}

export function AgentDot({ name, size = 28, active = false, thinking = false, inactive = false, className = '', style = {} }) {
  const hash = hashName(name)
  const gradient = getAgentGradient(name)
  // Use name directly for unique SVG IDs (no collisions)
  const safeName = (name || 'x').replace(/[^a-zA-Z0-9]/g, '')
  const uid = `ag-${safeName}-${hash}`
  const thinkUid = `ag-t-${safeName}-${hash}`

  const [baseL, baseC, baseH] = AGENT_COLORS[hash % AGENT_COLORS.length]
  const thinkBright = oklch(Math.min(baseL + 0.3, 0.97), baseC * 0.4, baseH)
  const thinkMid = oklch(baseL, baseC * 1.2, baseH)
  const thinkDeep = oklch(Math.max(baseL - 0.25, 0.25), baseC * 1.3, (baseH + 10) % 360)

  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 group/dot ${active ? 'agent-active-ring' : ''} ${className}`}
      style={{ width: size, height: size, ...(inactive ? { opacity: 0.35, filter: 'grayscale(1)' } : {}), ...style }}
    >
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-[var(--color-nav)] text-white text-[10px] font-medium whitespace-nowrap opacity-0 scale-90 pointer-events-none group-hover/dot:opacity-100 group-hover/dot:scale-100 transition-[opacity,transform] duration-150 z-50">
        {name}{inactive ? ' (idle)' : ''}
        <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-[var(--color-nav)]" />
      </span>
      <svg className="overflow-hidden rounded-full" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {thinking ? (
            <radialGradient id={thinkUid} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor={thinkBright}>
                <animate attributeName="offset" values="0%;40%;0%" dur={`${2.5 + (hash % 10) * 0.1}s`} repeatCount="indefinite" />
              </stop>
              <stop offset="45%" stopColor={thinkMid}>
                <animate attributeName="offset" values="45%;75%;45%" dur={`${2 + (hash % 8) * 0.15}s`} repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor={thinkDeep} />
              <animate attributeName="cx" values={`${20 + hash % 15}%;${65 + hash % 15}%;${20 + hash % 15}%`} dur={`${3.5 + (hash % 7) * 0.15}s`} repeatCount="indefinite" />
              <animate attributeName="cy" values={`${20 + hash % 10}%;${60 + hash % 15}%;${20 + hash % 10}%`} dur={`${3 + (hash % 9) * 0.12}s`} repeatCount="indefinite" />
              <animate attributeName="r" values={`${35 + hash % 10}%;${85 + hash % 10}%;${35 + hash % 10}%`} dur={`${2.5 + (hash % 6) * 0.2}s`} repeatCount="indefinite" />
            </radialGradient>
          ) : gradient.radial ? (
            <radialGradient id={uid} cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor={gradient.stops[0]} />
              <stop offset="50%" stopColor={gradient.stops[1]} />
              <stop offset="100%" stopColor={gradient.stops[2]} />
            </radialGradient>
          ) : (
            <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1"
              gradientTransform={`rotate(${gradient.angle}, 0.5, 0.5)`}
            >
              <stop offset="0%" stopColor={gradient.stops[0]} />
              <stop offset="50%" stopColor={gradient.stops[1]} />
              <stop offset="100%" stopColor={gradient.stops[2]} />
            </linearGradient>
          )}
        </defs>
        <circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${thinking ? thinkUid : uid})`} />
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      </svg>
    </span>
  )
}
