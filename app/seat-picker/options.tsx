"use client"

import { useAtom } from "jotai"
import { useCallback, useId } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Settings2,
  Shuffle,
  RotateCcw,
  Paintbrush2,
  Palette,
  Check,
} from "lucide-react"
import {
  layoutTypeAtom,
  capsuleTierColorsAtom,
  colosseumTierColorsAtom,
  rectangularTierColorsAtom,
  stadiumImageUrlAtom,
} from "./store"
import type { StadiumLayoutType } from "./config"
import LayoutCard from "./layout-card"
import { DEFAULT_COLORS, PALETTES } from "./palettes"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"

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
  "100": "Field Level",
  "200": "Lower Bowl",
  "300": "Upper Bowl",
  "400": "Nosebleed",
}

const TIER_DESCRIPTIONS: Record<string, string> = {
  "100": "Closest to the action",
  "200": "Great sightlines",
  "300": "Wide panoramic view",
  "400": "Best value seats",
}

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
    <div className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50">
      <label
        htmlFor={inputId}
        className="relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 border-white/30 shadow-md ring-1 ring-black/10 transition-all hover:scale-110 hover:ring-2 hover:ring-primary/40 dark:ring-white/10"
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
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground">
          {TIER_LABELS[tierId] ?? `Tier ${tierId}`}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {TIER_DESCRIPTIONS[tierId] ?? ""}
        </p>
      </div>
      <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        {value.toUpperCase()}
      </span>
    </div>
  )
}

export default function StadiumOptions() {
  const [layout, setLayout] = useAtom(layoutTypeAtom)
  const [capsuleColors, setCapsuleColors] = useAtom(capsuleTierColorsAtom)
  const [colosseumColors, setColosseumColors] = useAtom(colosseumTierColorsAtom)
  const [rectColors, setRectColors] = useAtom(rectangularTierColorsAtom)
  // const [imageUrl, setImageUrl] = useAtom(stadiumImageUrlAtom)

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

  const activePaletteIndex = PALETTES[layout as StadiumLayoutType].findIndex(
    (palette: string[]) =>
      meta.tiers.every(
        (t: string, j: number) => currentColors[t] === palette[j]
      )
  )

  const onResetAll = () => {
    setLayout("capsule")
    setCapsuleColors(DEFAULT_COLORS["capsule"])
    setColosseumColors(DEFAULT_COLORS["colosseum"])
    setRectColors(DEFAULT_COLORS["rectangular"])
  }

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline" />}
        className="flex items-center gap-1.5"
      >
        <Settings2 className="h-4 w-4" />
      </PopoverTrigger>

      <PopoverPopup className="flex w-84 flex-col gap-2">
        <div className="pb-3">
          <PopoverTitle className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <Settings2 className="h-3.5 w-3.5 text-primary" />
            </div>
            Stadium Settings
          </PopoverTitle>
        </div>

        <Separator />

        <div className="space-y-2 py-3">
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
        <div className="space-y-2 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Paintbrush2 className="h-4 w-4 text-muted-foreground" />
              <Label className="text-muted-foreground">Tier Colors</Label>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRandomPalette}
                className="text-muted-foreground hover:text-foreground"
              >
                <Shuffle className="h-3 w-3" />
                Shuffle
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetColors}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 py-1">
            {meta.tiers.map((tierId, idx) => (
              <div key={tierId}>
                <TierColorRow
                  tierId={tierId}
                  value={currentColors[tierId] ?? "#888888"}
                  onChange={(c) => handleTierColor(tierId, c)}
                />
                {idx < meta.tiers.length - 1 && (
                  <div className="mx-3 border-t border-border/40" />
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Quick palettes */}
        <div className="space-y-2 pb-3">
          <div className="flex items-center gap-1.5 pb-1">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <Label className="text-muted-foreground">Quick Palettes</Label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PALETTES[layout as StadiumLayoutType].map(
              (palette: string[], i: number) => {
                const isActive = i === activePaletteIndex
                return (
                  <motion.button
                    key={i}
                    onClick={() => {
                      const newColors: Record<string, string> = {}
                      meta.tiers.forEach((t: string, j: number) => {
                        newColors[t] = palette[j % palette.length]
                      })
                      setCurrentColors(newColors)
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={cn(
                      "relative flex cursor-pointer overflow-hidden rounded-xl ring-1 transition-shadow",
                      isActive
                        ? "ring-2 ring-primary"
                        : "ring-black/10 dark:ring-white/10"
                    )}
                    title={`Palette ${i + 1}`}
                  >
                    {palette
                      .slice(0, meta.tiers.length)
                      .map((c: string, j: number) => (
                        <span
                          key={j}
                          className="block h-6 w-full"
                          style={{ background: c }}
                        />
                      ))}

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-black/20"
                        >
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm">
                            <Check className="h-2.5 w-2.5 text-black" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              }
            )}
          </div>
        </div>

        <Separator />
        <div className="flex items-center justify-center pt-3">
          <Button onClick={onResetAll} variant={"outline"}>
            Reset All
          </Button>
        </div>
        {/* ── Image URL ── */}
        {/* <div className="space-y-2 py-3">
          <div className="flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
            <Label className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              Background Image
            </Label>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Paste a URL to use a custom stadium photo as the background.
          </p>
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
                className="h-8 shrink-0 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => setImageUrl("")}
                title="Clear image"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
          {imageUrl && (
            <div
              className="relative h-24 w-full overflow-hidden rounded-xl border bg-muted/40"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-2 left-2.5 flex items-center gap-1">
                <ImageIcon className="h-3 w-3 text-white/80" />
                <span className="text-[10px] text-white/80">Preview</span>
              </div>
            </div>
          )}
        </div> */}
      </PopoverPopup>
    </Popover>
  )
}
