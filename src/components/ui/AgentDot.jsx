/**
 * Agent avatar — colored circle with initials derived from name.
 * Color is deterministic (hashed from name).
 *
 * @param {string} name - agent name
 * @param {number} size - pixel size (default 28)
 * @param {boolean} active - shows ring pulse animation
 */
// Vibrant saturated pastels
const AGENT_COLORS = [
  '#A78BFA', // lavender
  '#7BB8FF', // sky blue
  '#22D3EE', // cyan
  '#34D399', // mint
  '#9FE870', // lime (accent)
  '#CDCA2A', // chartreuse
  '#FB923C', // tangerine
  '#F87171', // coral
  '#F472B6', // pink
]

function hashColor(name) {
  if (!name) return '#999'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AGENT_COLORS[Math.abs(hash) % AGENT_COLORS.length]
}

export function AgentDot({ name, size = 28, active = false, className = '', style = {} }) {
  const bg = hashColor(name)
  const initials = name ? name.slice(0, 2).toUpperCase() : '??'
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${active ? 'agent-active-ring' : ''} ${className}`}
      style={{ width: size, height: size, background: bg, color: '#fff', fontSize: size * 0.38, fontWeight: 700, letterSpacing: '-0.02em', ...style }}
      title={name}
    >
      {initials}
    </span>
  )
}
