import { StadiumLayoutType } from "./config"

// ── Layout card ───────────────────────────────────────────────────────────────
function LayoutCard({
  type,
  label,
  description,
  active,
  onClick,
}: {
  type: StadiumLayoutType
  label: string
  description: string
  active: boolean
  onClick: () => void
}) {
  const icons: Record<StadiumLayoutType, React.ReactNode> = {
    colosseum: (
      <svg viewBox="0 0 40 28" className="h-7 w-10" fill="none">
        <ellipse
          cx="20"
          cy="14"
          rx="18"
          ry="11"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <ellipse
          cx="20"
          cy="14"
          rx="12"
          ry="7"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <ellipse
          cx="20"
          cy="14"
          rx="6"
          ry="3.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    ),
    capsule: (
      <svg viewBox="0 0 44 24" className="h-6 w-11" fill="none">
        <rect
          x="8"
          y="2"
          width="28"
          height="20"
          rx="2"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path d="M8 5 Q2 12 8 19" stroke="currentColor" strokeWidth="2" />
        <path d="M36 5 Q42 12 36 19" stroke="currentColor" strokeWidth="2" />
        <rect
          x="15"
          y="7"
          width="14"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    ),
    rectangular: (
      <svg viewBox="0 0 40 28" className="h-7 w-10" fill="none">
        <rect
          x="2"
          y="2"
          width="36"
          height="24"
          rx="2"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <rect
          x="7"
          y="7"
          width="26"
          height="14"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="13"
          y="11"
          width="14"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    ),
  }

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-2.5 text-center transition-all ${
        active
          ? "border-primary bg-primary/8 text-primary dark:bg-primary/12"
          : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
      }`}
    >
      {icons[type]}
      <span className="text-xs leading-none font-semibold">{label}</span>
      <span className="text-[10px] opacity-70">{description}</span>
    </button>
  )
}

export default LayoutCard
