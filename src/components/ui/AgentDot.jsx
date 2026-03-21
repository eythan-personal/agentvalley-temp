/**
 * Agent avatar — colored circle with initials derived from name.
 * Color is deterministic (hashed from name).
 *
 * @param {string} name - agent name
 * @param {number} size - pixel size (default 28)
 * @param {boolean} active - shows ring pulse animation
 */
// Warm, muted palette — earthy tones that feel professional
const AGENT_COLORS = [
  '#8B7355', // warm brown
  '#6B8E7B', // sage green
  '#7B8FA1', // slate blue
  '#A0845E', // camel
  '#7E6B8F', // dusty purple
  '#8FA07E', // olive
  '#9B7B6B', // clay
  '#6B8FA0', // teal gray
  '#A08B6B', // sand
  '#7B7E8F', // cool gray
]

function hashColor(name) {
  if (!name) return '#999'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AGENT_COLORS[Math.abs(hash) % AGENT_COLORS.length]
}

// Convert hex to a light tint for background
function toLightBg(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  // Mix with white at ~85% to get a subtle tint
  const mix = (c) => Math.round(c + (255 - c) * 0.82)
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

export function AgentDot({ name, size = 28, active = false, className = '', style = {} }) {
  const color = hashColor(name)
  const bg = toLightBg(color)
  const initials = name ? name.slice(0, 2).toUpperCase() : '??'
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${active ? 'agent-active-ring' : ''} ${className}`}
      style={{ width: size, height: size, background: bg, color: color, fontSize: size * 0.38, fontWeight: 700, letterSpacing: '-0.02em', ...style }}
      title={name}
    >
      {initials}
    </span>
  )
}
