/**
 * Small token icon — shows uploaded image or colored letter fallback.
 * token: "$ACME", color: "#9fe870", icon: image URL or null, size: px
 */
export default function TokenIcon({ token, color, icon, size = 16, className = '' }) {
  const letter = token?.replace('$', '')[0] || '?'

  if (icon) {
    return (
      <img
        src={icon}
        alt=""
        className={`rounded-full shrink-0 object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 text-white ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color || '#8A8582',
        fontSize: size * 0.55,
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        lineHeight: 1,
      }}
    >
      {letter}
    </span>
  )
}
