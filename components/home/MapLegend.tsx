"use client"

import React from "react"
import { SEAT_COLORS } from "@/types/seat"
import { useBookingStore } from "@/store/bookingStore"
import { useAtomValue } from "jotai"
import {
  layoutTypeAtom,
  capsuleTierColorsAtom,
  colosseumTierColorsAtom,
  rectangularTierColorsAtom,
} from "@/app/seat-picker/store"
import { CAPSULE_CONFIG, COLOSSEUM_CONFIG, RECTANGULAR_CONFIG } from "@/app/seat-picker/config"

const LEGEND_ITEMS = [
  { label: "Available", color: SEAT_COLORS.available },
  { label: "Selected", color: SEAT_COLORS.selected },
  { label: "Taken", color: SEAT_COLORS.taken, border: SEAT_COLORS.takenStroke },
]

const TIER_LABELS: Record<string, string> = {
  "100": "Floor",
  "200": "Lower Bowl",
  "300": "Upper Bowl",
  "400": "Nosebleed",
}

const MapLegend: React.FC = () => {
  const { seats } = useBookingStore()
  const available = seats.filter(
    (s) => s.status === "available" || s.status === "vip"
  ).length
  const taken = seats.filter((s) => s.status === "taken").length

  const layout = useAtomValue(layoutTypeAtom)
  const capsuleColors = useAtomValue(capsuleTierColorsAtom)
  const colosseumColors = useAtomValue(colosseumTierColorsAtom)
  const rectColors = useAtomValue(rectangularTierColorsAtom)

  const baseConfig =
    layout === "capsule"
      ? CAPSULE_CONFIG
      : layout === "rectangular"
        ? RECTANGULAR_CONFIG
        : COLOSSEUM_CONFIG

  const currentColors =
    layout === "capsule"
      ? capsuleColors
      : layout === "rectangular"
        ? rectColors
        : colosseumColors

  const priceZones = baseConfig.tiers.map((t) => ({
    label: TIER_LABELS[t.id] ?? `Tier ${t.id}`,
    price: `$${t.price}`,
    color: currentColors[t.id] ?? t.color,
  }))

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

      {/* Right: Dynamic tier price zones */}
      <div className="flex items-center gap-3">
        {priceZones.map((zone) => (
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
