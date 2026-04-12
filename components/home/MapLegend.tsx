"use client"

import React from "react"
import { SEAT_COLORS } from "@/types/seat"
import { useBookingStore } from "@/store/bookingStore"

const LEGEND_ITEMS = [
  { label: "Available", color: SEAT_COLORS.available },
  { label: "Selected", color: SEAT_COLORS.selected },
  { label: "VIP", color: SEAT_COLORS.vip },
  { label: "Taken", color: SEAT_COLORS.taken, border: SEAT_COLORS.takenStroke },
]

const PRICE_ZONES = [
  { label: "Floor", price: "$185", color: "#3b82f6" },
  { label: "Lower Bowl", price: "$125", color: "#8b5cf6" },
  { label: "Upper Bowl", price: "$85", color: "#f59e0b" },
  { label: "Balcony", price: "$55", color: "#6b7280" },
  { label: "VIP", price: "$450", color: "#b45309" },
]

const MapLegend: React.FC = () => {
  const { seats } = useBookingStore()
  const available = seats.filter(
    (s) => s.status === "available" || s.status === "vip"
  ).length
  const taken = seats.filter((s) => s.status === "taken").length

  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      style={{
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      {/* Left: Status legend */}
      <div className="flex items-center gap-4">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 flex-shrink-0 rounded-full"
              style={{
                background: item.color,
                border: item.border ? `1px solid ${item.border}` : undefined,
                opacity: item.label === "Taken" ? 0.4 : 1,
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Center: Availability */}
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "#22c55e",
            fontFamily: "var(--font-mono)",
          }}
        >
          {available} avail
        </span>
        <span style={{ color: "var(--border-medium)" }}>·</span>
        <span
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {taken} taken
        </span>
      </div>

      {/* Right: Price zones */}
      <div className="flex items-center gap-3">
        {PRICE_ZONES.map((zone) => (
          <div key={zone.label} className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: zone.color }}
            />
            <span
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {zone.label}{" "}
              <span style={{ color: zone.color }}>{zone.price}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MapLegend
