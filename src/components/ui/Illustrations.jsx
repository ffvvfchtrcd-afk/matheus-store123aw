export function LogoSVG({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" className="fill-accent" />
      <path d="M12 28V14l8-4 8 4v14l-8 4-8-4z" className="fill-surface" />
      <path d="M14 15l6-3 6 3v11l-6 3-6-3V15z" className="fill-accent" opacity="0.2" />
      <path d="M20 12v16" className="stroke-surface" strokeWidth="1.5" />
      <path d="M14 18h12M14 22h12" className="stroke-surface" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

export function Logotype({ className = 'w-32' }) {
  return (
    <svg className={className} viewBox="0 0 140 28" fill="none">
      <rect width="28" height="28" rx="6" className="fill-accent" />
      <path d="M8 20V10l6-3 6 3v10l-6 3-6-3z" className="fill-surface" />
      <path d="M10 11l4-2 4 2v8l-4 2-4-2V11z" className="fill-accent" opacity="0.2" />
      <text x="36" y="20" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="16" letterSpacing="-0.5" className="fill-text-primary">
        LOJA
      </text>
      <text x="76" y="20" fontFamily="Inter, sans-serif" fontWeight="300" fontSize="16" letterSpacing="-0.5" className="fill-text-secondary">
        Vault
      </text>
      <circle cx="128" cy="18" r="1.5" className="fill-accent" opacity="0.4" />
    </svg>
  )
}

export function HeroIllustration({ className }) {
  return (
    <svg className={className} viewBox="0 0 600 500" fill="none">
      <rect x="60" y="180" width="480" height="280" rx="16" className="fill-surface-secondary" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
      <path d="M180 200h240v80H180z" className="fill-surface-tertiary" rx="8" />
      <rect x="200" y="220" width="60" height="8" rx="4" className="fill-text-muted" opacity="0.3" />
      <rect x="200" y="236" width="100" height="6" rx="3" className="fill-text-muted" opacity="0.2" />
      <rect x="200" y="250" width="80" height="6" rx="3" className="fill-text-muted" opacity="0.2" />
      <circle cx="340" cy="240" r="30" className="fill-surface-hover" />
      <path d="M330 240h20M340 230v20" className="stroke-text-muted" strokeWidth="2" strokeLinecap="round" />
      <rect x="120" y="300" width="160" height="60" rx="8" className="fill-surface-hover" />
      <rect x="320" y="300" width="160" height="60" rx="8" className="fill-surface-hover" />
      <rect x="140" y="316" width="80" height="6" rx="3" className="fill-text-muted" opacity="0.2" />
      <rect x="340" y="316" width="80" height="6" rx="3" className="fill-text-muted" opacity="0.2" />
      <rect x="140" y="330" width="120" height="6" rx="3" className="fill-text-muted" opacity="0.15" />
      <rect x="340" y="330" width="120" height="6" rx="3" className="fill-text-muted" opacity="0.15" />
      <rect x="120" y="380" width="360" height="40" rx="8" className="fill-accent" opacity="0.9" />
      <rect x="240" y="394" width="80" height="6" rx="3" className="fill-surface" opacity="0.5" />
      <circle cx="300" cy="140" r="60" className="fill-surface-hover" opacity="0.3" />
      <circle cx="300" cy="140" r="40" className="fill-surface-tertiary" opacity="0.5" />
      <circle cx="300" cy="140" r="20" className="fill-text-muted" opacity="0.3" />
      <rect x="220" y="120" width="160" height="4" rx="2" className="fill-accent" opacity="0.15" transform="rotate(-30 220 120)" />
      <rect x="180" y="160" width="40" height="4" rx="2" className="fill-text-muted" opacity="0.15" transform="rotate(45 180 160)" />
      <rect x="380" y="160" width="40" height="4" rx="2" className="fill-text-muted" opacity="0.15" transform="rotate(-45 380 160)" />
    </svg>
  )
}

export function EmptyCartIllustration({ className }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="80" className="fill-surface-secondary" />
      <circle cx="100" cy="100" r="60" className="fill-surface-tertiary" />
      <path d="M60 140l8-48h64l8 48H60z" className="fill-surface-hover" />
      <path d="M72 92l-4-16h64l-4 16H72z" className="fill-surface-hover" />
      <path d="M80 140V92M120 140V92" className="stroke-text-muted" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M68 76h64l-4 10H72l-4-10z" className="fill-surface-hover" />
      <circle cx="80" cy="150" r="8" className="fill-surface-hover" />
      <circle cx="120" cy="150" r="8" className="fill-surface-hover" />
      <circle cx="80" cy="150" r="4" className="fill-text-muted" />
      <circle cx="120" cy="150" r="4" className="fill-text-muted" />
      <path d="M90 85l20-10M90 95l20-10" className="stroke-text-muted" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

export function NotFoundIllustration({ className }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="90" r="50" className="fill-surface-secondary" />
      <circle cx="100" cy="90" r="35" className="fill-surface-tertiary" />
      <circle cx="90" cy="82" r="3" className="fill-text-muted" />
      <circle cx="110" cy="82" r="3" className="fill-text-muted" />
      <path d="M88 98c5 5 14 5 20 0" className="stroke-text-muted" strokeWidth="2" strokeLinecap="round" />
      <path d="M70 140h60M80 150h40M90 160h20" className="stroke-text-muted" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <text x="100" y="170" textAnchor="middle" className="fill-text-muted" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">404</text>
    </svg>
  )
}

export function PackageIllustration({ className }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <rect x="40" y="30" width="120" height="140" rx="12" className="fill-surface-secondary" />
      <rect x="55" y="45" width="90" height="70" rx="6" className="fill-surface-tertiary" />
      <path d="M90 48v64M70 58h60M70 72h60M70 86h60" className="stroke-text-muted" strokeWidth="1" opacity="0.2" />
      <rect x="60" y="130" width="80" height="6" rx="3" className="fill-text-muted" opacity="0.3" />
      <rect x="60" y="142" width="60" height="6" rx="3" className="fill-text-muted" opacity="0.2" />
      <rect x="60" y="154" width="80" height="6" rx="3" className="fill-text-muted" opacity="0.15" />
      <circle cx="155" cy="35" r="5" className="fill-accent" opacity="0.2" />
      <path d="M153 33h4M155 31v4" className="stroke-accent" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function ProductSearchIllustration({ className }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <rect x="40" y="40" width="120" height="120" rx="12" className="fill-surface-secondary" />
      <rect x="60" y="60" width="80" height="60" rx="6" className="fill-surface-tertiary" />
      <circle cx="120" cy="120" r="20" className="fill-surface-hover" />
      <circle cx="120" cy="120" r="10" className="fill-text-muted" opacity="0.3" />
      <path d="M127 127l8 8" className="stroke-text-muted" strokeWidth="2" strokeLinecap="round" />
      <rect x="60" y="132" width="50" height="4" rx="2" className="fill-text-muted" opacity="0.2" />
      <rect x="60" y="142" width="35" height="4" rx="2" className="fill-text-muted" opacity="0.15" />
      <circle cx="50" cy="50" r="6" className="fill-accent" opacity="0.2" />
      <path d="M48 48h4M50 46v4" className="stroke-accent" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function CategoryIllustration({ type = 'masculino', className }) {
  if (type === 'masculino') {
    return (
      <svg className={className} viewBox="0 0 200 200" fill="none">
        <rect x="30" y="20" width="140" height="160" rx="16" className="fill-surface-secondary" />
        <rect x="50" y="40" width="100" height="80" rx="8" className="fill-surface-tertiary" />
        <circle cx="100" cy="80" r="20" className="fill-surface-hover" />
        <circle cx="100" cy="80" r="10" className="fill-text-muted" opacity="0.3" />
        <rect x="50" y="130" width="40" height="6" rx="3" className="fill-text-muted" opacity="0.3" />
        <rect x="50" y="142" width="60" height="6" rx="3" className="fill-text-muted" opacity="0.2" />
        <rect x="50" y="154" width="100" height="6" rx="3" className="fill-text-muted" opacity="0.15" />
        <circle cx="160" cy="40" r="4" className="fill-accent" opacity="0.3" />
      </svg>
    )
  }
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <rect x="30" y="20" width="140" height="160" rx="16" className="fill-surface-secondary" />
      <rect x="50" y="40" width="100" height="80" rx="8" className="fill-surface-tertiary" />
      <path d="M75 70l25-10 25 10v20l-25 10-25-10V70z" className="fill-surface-hover" />
      <circle cx="100" cy="80" r="15" className="fill-surface-hover" />
      <circle cx="100" cy="80" r="8" className="fill-text-muted" opacity="0.2" />
      <rect x="50" y="130" width="50" height="6" rx="3" className="fill-text-muted" opacity="0.3" />
      <rect x="50" y="142" width="70" height="6" rx="3" className="fill-text-muted" opacity="0.2" />
      <rect x="50" y="154" width="100" height="6" rx="3" className="fill-text-muted" opacity="0.15" />
      <circle cx="160" cy="40" r="4" className="fill-accent" opacity="0.3" />
    </svg>
  )
}
