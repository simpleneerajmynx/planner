"use client"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Seat {
  id: string
  row: number
  col: number
  x: number
  y: number
  available: boolean
  section: string
  price: number
}

interface Section {
  id: string
  label: string
  seats: Seat[]
  minX?: number
  maxX?: number
  minY?: number
  maxY?: number
}

interface SelectedSeat {
  id: string
  section: string
  row: number
  col: number
  price: number
}

// Viewport rect tracked for minimap
interface ViewRect {
  x: number
  y: number
  w: number
  h: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const W = 960 // SVG viewBox width
const H = 760 // SVG viewBox height
const MINIMAP_W = 120
const MINIMAP_H = 96

const COLOR_AVAILABLE = "#2563eb"
const COLOR_SOLD = "#d1d5db"
const COLOR_SELECTED = "#1d4ed8"
const COLOR_BG = "#f3f4f6"

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Build section data ───────────────────────────────────────────────────────

function Minimap({
  sections,
  viewRect,
  selectedSeats,
  onClickMinimap,
}: {
  sections: Section[]
  viewRect: ViewRect
  selectedSeats: Map<string, SelectedSeat>
  onClickMinimap: (nx: number, ny: number) => void
}) {
  const scaleX = MINIMAP_W / W
  const scaleY = MINIMAP_H / H

  const allSeats = sections.flatMap((s) => s.seats)

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = (e.clientX - rect.left) / MINIMAP_W // 0–1 normalized
    const my = (e.clientY - rect.top) / MINIMAP_H
    onClickMinimap(mx, my)
  }

  return (
    <div className="absolute bottom-4 left-4 z-30 overflow-hidden rounded-xl border border-gray-300 bg-white/95 shadow-lg backdrop-blur-sm">
      {/* <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-2 py-1">
        <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
          Minimap
        </span>
        <span className="text-[10px] text-gray-400">
          {Math.round(viewRect.w > 0 ? (W / viewRect.w) * 100 : 100)}%
        </span>
      </div> */}
      <svg
        width={MINIMAP_W}
        height={MINIMAP_H}
        viewBox={`0 0 ${MINIMAP_W} ${MINIMAP_H}`}
        style={{ background: COLOR_BG, cursor: "crosshair", display: "block" }}
        onClick={handleClick}
      >
        {/* Panel backgrounds */}
        {[
          { x: 43, y: 90, w: 92, h: 445 },
          { x: 178, y: 90, w: 92, h: 445 },
          { x: 298, y: 90, w: 340, h: 445 },
          { x: 646, y: 90, w: 92, h: 445 },
          { x: 781, y: 90, w: 92, h: 445 },
        ].map((p, i) => (
          <rect
            key={i}
            x={p.x * scaleX}
            y={p.y * scaleY}
            width={p.w * scaleX}
            height={p.h * scaleY}
            fill="#e5e7eb"
            rx={1}
          />
        ))}

        {/* Stage */}
        <rect
          x={(W / 2 - 140) * scaleX}
          y={22 * scaleY}
          width={280 * scaleX}
          height={55 * scaleY}
          fill="#1f2937"
          rx={1}
        />

        {/* Seats — render as 1.2px dots at minimap scale */}
        {allSeats.map((seat) => (
          <circle
            key={seat.id}
            cx={seat.x * scaleX}
            cy={seat.y * scaleY}
            r={1.2}
            fill={
              !seat.available
                ? COLOR_SOLD
                : selectedSeats.has(seat.id)
                  ? COLOR_SELECTED
                  : COLOR_AVAILABLE
            }
          />
        ))}

        {/* Viewport indicator rect */}
        {viewRect.w > 0 && (
          <rect
            x={viewRect.x * scaleX}
            y={viewRect.y * scaleY}
            width={viewRect.w * scaleX}
            height={viewRect.h * scaleY}
            fill="rgba(37,99,235,0.08)"
            stroke="#2563eb"
            strokeWidth={1}
            rx={1}
          />
        )}
      </svg>
    </div>
  )
}

export default Minimap
