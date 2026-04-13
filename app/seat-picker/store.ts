"use client"

import { atomWithHash } from "jotai-location"
import type { StadiumLayoutType } from "./config"

// ── Layout type (capsule | colosseum | rectangular) ─────────────────────────
export const layoutTypeAtom = atomWithHash<StadiumLayoutType>(
  "layout",
  "capsule",
  { setHash: "replaceState" }
)

// ── Stadium image URL ────────────────────────────────────────────────────────
export const stadiumImageUrlAtom = atomWithHash<string>("imgUrl", "", {
  setHash: "replaceState",
})

// ── Tier colors per layout – each stored separately ─────────────────────────
export const capsuleTierColorsAtom = atomWithHash<Record<string, string>>(
  "capsuleColors",
  {
    "100": "#7A1E1E",
    "200": "#1F6F5E",
    "300": "#4A2C5A",
  },
  { setHash: "replaceState" }
)

export const colosseumTierColorsAtom = atomWithHash<Record<string, string>>(
  "colosseumColors",
  {
    "100": "#38bdf8",
    "200": "#fbbf24",
    "300": "#94a3b8",
    "400": "#c084fc",
  },
  { setHash: "replaceState" }
)

export const rectangularTierColorsAtom = atomWithHash<Record<string, string>>(
  "rectColors",
  {
    "100": "#38bdf8",
    "200": "#fbbf24",
    "300": "#94a3b8",
  },
  { setHash: "replaceState" }
)
