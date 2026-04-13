"use client"

import { useAtom } from "jotai"
import { useCallback, useId } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Settings2, Shuffle, RotateCcw, Image as ImageIcon } from "lucide-react"
import {
  layoutTypeAtom,
  capsuleTierColorsAtom,
  colosseumTierColorsAtom,
  rectangularTierColorsAtom,
  stadiumImageUrlAtom,
} from "./store"
import type { StadiumLayoutType } from "./config"

// ── Curated palettes (harmonious, good contrast) ────────────────────────────
const PALETTES: Record<StadiumLayoutType, string[][]> = {
  colosseum: [
    ["#38bdf8", "#fbbf24", "#94a3b8", "#c084fc"],
    ["#f43f5e", "#fb923c", "#facc15", "#34d399"],
    ["#818cf8", "#38bdf8", "#2dd4bf", "#a3e635"],
    ["#e879f9", "#f472b6", "#fb7185", "#fda4af"],
    ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b"],
    ["#dc2626", "#ea580c", "#d97706", "#65a30d"],
  ],
  capsule: [
    ["#7A1E1E", "#1F6F5E", "#4A2C5A"],
    ["#b91c1c", "#0f766e", "#7c3aed"],
    ["#9f1239", "#065f46", "#1e3a5f"],
    ["#c2410c", "#15803d", "#6b21a8"],
    ["#a16207", "#166534", "#1e3a8a"],
    ["#881337", "#064e3b", "#3b0764"],
  ],
  rectangular: [
    ["#38bdf8", "#fbbf24", "#94a3b8"],
    ["#f43f5e", "#fb923c", "#facc15"],
    ["#6366f1", "#0ea5e9", "#10b981"],
    ["#e879f9", "#f472b6", "#fb7185"],
    ["#dc2626", "#ea580c", "#d97706"],
    ["#818cf8", "#38bdf8", "#2dd4bf"],
  ],
}

const DEFAULT_COLORS: Record<StadiumLayoutType, Record<string, string>> = {
  colosseum: {
    "100": "#38bdf8",
    "200": "#fbbf24",
    "300": "#94a3b8",
    "400": "#c084fc",
  },
  capsule: { "100": "#7A1E1E", "200": "#1F6F5E", "300": "#4A2C5A" },
  rectangular: { "100": "#38bdf8", "200": "#fbbf24", "300": "#94a3b8" },
}

const CONFIG_META: {
  type: StadiumLayoutType
  label: string
  description: string
  tiers: string[]
}[] = [
  {
    type: "colosseum",
    label: "Colosseum",
    description: "Full 360° oval",
    tiers: ["100", "200", "300", "400"],
  },
  {
    type: "capsule",
    label: "Capsule",
    description: "Stadium with end-caps",
    tiers: ["100", "200", "300"],
  },
  {
    type: "rectangular",
    label: "Rectangular",
    description: "Square arena",
    tiers: ["100", "200", "300"],
  },
]

const TIER_LABELS: Record<string, string> = {
  "100": "Field / Pitch",
  "200": "Lower Bowl",
  "300": "Upper Bowl",
  "400": "Nosebleed",
}

function tierColorAtom(layout: StadiumLayoutType) {
  if (layout === "capsule") return capsuleTierColorsAtom
  if (layout === "rectangular") return rectangularTierColorsAtom
  return colosseumTierColorsAtom
}

// ── Color swatch row for one tier ────────────────────────────────────────────
function TierColorRow({
  tierId,
  value,
  onChange,
}: {
  tierId: string
  value: string
  onChange: (color: string) => void
}) {
  const inputId = useId()
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-24 shrink-0 text-xs text-muted-foreground">
        {TIER_LABELS[tierId] ?? `Tier ${tierId}`}
      </span>
      {/* Native color picker wrapped in a styled swatch */}
      <label
        htmlFor={inputId}
        className="relative h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 border-white/20 shadow-sm ring-1 ring-black/10 transition-transform hover:scale-110 dark:ring-white/10"
        style={{ background: value }}
      >
        <input
          id={inputId}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <span className="font-mono text-xs text-muted-foreground">{value}</span>
    </div>
  )
}

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

// ── Main component ────────────────────────────────────────────────────────────
export default function StadiumOptions() {
  const [layout, setLayout] = useAtom(layoutTypeAtom)
  const [capsuleColors, setCapsuleColors] = useAtom(capsuleTierColorsAtom)
  const [colosseumColors, setColosseumColors] = useAtom(colosseumTierColorsAtom)
  const [rectColors, setRectColors] = useAtom(rectangularTierColorsAtom)
  const [imageUrl, setImageUrl] = useAtom(stadiumImageUrlAtom)

  const currentColors =
    layout === "capsule"
      ? capsuleColors
      : layout === "rectangular"
        ? rectColors
        : colosseumColors

  const setCurrentColors = useCallback(
    (colors: Record<string, string>) => {
      if (layout === "capsule") setCapsuleColors(colors)
      else if (layout === "rectangular") setRectColors(colors)
      else setColosseumColors(colors)
    },
    [layout, setCapsuleColors, setRectColors, setColosseumColors]
  )

  const meta = CONFIG_META.find((m) => m.type === layout)!

  const handleTierColor = (tierId: string, color: string) => {
    setCurrentColors({ ...currentColors, [tierId]: color })
  }

  const handleRandomPalette = () => {
    const palettes = PALETTES[layout as StadiumLayoutType]
    const pick = palettes[Math.floor(Math.random() * palettes.length)]
    const newColors: Record<string, string> = {}
    meta.tiers.forEach((t: string, i: number) => {
      newColors[t] = pick[i % pick.length]
    })
    setCurrentColors(newColors)
  }

  const handleResetColors = () => {
    setCurrentColors(DEFAULT_COLORS[layout as StadiumLayoutType])
  }

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline" />}
        className="flex items-center gap-1.5"
      >
        <Settings2 className="h-4 w-4" />
        <span className="hidden sm:inline">Config</span>
      </PopoverTrigger>

      <PopoverPopup className="w-80" side="bottom" align="end" sideOffset={8}>
        <div className="space-y-4">
          {/* ── Header ── */}
          <div>
            <PopoverTitle className="flex items-center gap-2 text-sm font-semibold">
              <Settings2 className="h-4 w-4 text-primary" />
              Configuration
            </PopoverTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Changes sync to the URL automatically.
            </p>
          </div>

          <Separator />

          {/* ── Layout picker ── */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {CONFIG_META.map((m) => (
                <LayoutCard
                  key={m.type}
                  {...m}
                  active={layout === m.type}
                  onClick={() => setLayout(m.type)}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* ── Tier colors ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold tracking-wider text-muted-foreground capitalize">
                Tier Colors — {layout}
              </Label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRandomPalette}
                  className="h-6 gap-1 px-2 text-[11px]"
                >
                  <Shuffle className="h-3 w-3" />
                  {/* Random */}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetColors}
                  className="h-6 gap-1 px-2 text-[11px]"
                >
                  <RotateCcw className="h-3 w-3" />
                  {/* Reset */}
                </Button>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border bg-muted/30 px-3 py-2.5">
              {meta.tiers.map((tierId) => (
                <TierColorRow
                  key={tierId}
                  tierId={tierId}
                  value={currentColors[tierId] ?? "#888888"}
                  onChange={(c) => handleTierColor(tierId, c)}
                />
              ))}
            </div>

            {/* Quick palette swatches */}
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">
                Quick palettes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PALETTES[layout as StadiumLayoutType].map(
                  (palette: string[], i: number) => (
                    <button
                      key={i}
                      onClick={() => {
                        const newColors: Record<string, string> = {}
                        meta.tiers.forEach((t: string, j: number) => {
                          newColors[t] = palette[j % palette.length]
                        })
                        setCurrentColors(newColors)
                      }}
                      className="flex overflow-hidden rounded-md shadow-sm ring-1 ring-black/10 transition-transform hover:scale-110 dark:ring-white/10"
                      title={`Palette ${i + 1}`}
                    >
                      {palette
                        .slice(0, meta.tiers.length)
                        .map((c: string, j: number) => (
                          <span
                            key={j}
                            className="block h-5 w-4"
                            style={{ background: c }}
                          />
                        ))}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* ── Image URL ── */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <ImageIcon className="h-3 w-3" />
              Stadium Background Image URL
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/stadium.jpg"
                value={imageUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setImageUrl(e.target.value)
                }
                className="h-8 text-xs"
              />
              {imageUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 shrink-0 px-2"
                  onClick={() => setImageUrl("")}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
            </div>
            {imageUrl && (
              <div
                className="h-20 w-full overflow-hidden rounded-md border bg-muted/40"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  )
}
