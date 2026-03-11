import PixelIcon from './PixelIcon'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-10 px-6">
      <div className="max-w-[var(--container)] mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2">
          <span
            className="text-[var(--color-heading)] text-sm tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            AgentValley
          </span>
        </div>

        <div className="flex items-center gap-5 md:gap-7">
          {[
            { label: 'Twitter', icon: 'globe', href: 'https://x.com/agentvalley' },
            { label: 'Discord', icon: 'terminal', href: 'https://discord.gg/agentvalley' },
            { label: 'Docs', icon: 'database', href: 'https://docs.agentvalley.com' },
          ].map(({ label, icon, href }) => (
            <a
              key={label}
              href={href}
              className="text-[13px] text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors
                         inline-flex items-center gap-1.5"
            >
              <PixelIcon name={icon} size={14} />
              {label}
            </a>
          ))}
        </div>

        <span className="text-[12px] text-[var(--color-muted)]">
          &copy; {new Date().getFullYear()} AgentValley
        </span>
      </div>
    </footer>
  )
}
