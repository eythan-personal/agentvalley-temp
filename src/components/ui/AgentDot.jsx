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
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash)
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

export function AgentDot({ name, size = 28, active = false, className = '', style = {} }) {
  const hash = hashName(name)
  const gradient = getAgentGradient(name)
  const uid = `ag-${hash % 9999}`

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden ${active ? 'agent-active-ring' : ''} ${className}`}
      style={{ width: size, height: size, ...style }}
      title={name}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {gradient.radial ? (
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
        <circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${uid})`} />
      </svg>
    </span>
  )
}
