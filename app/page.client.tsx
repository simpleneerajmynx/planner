"use client"

import Header from "@/components/home/Header"
import React, { useEffect, useMemo, useRef } from "react"
import StadiumSeatSelector from "./seat-picker"
import MapLegend from "@/components/home/MapLegend"
import ReviewStep from "@/components/home/ReviewStep"
import ConfirmStep from "@/components/home/ConfirmStep"
import { buildSections } from "./seat-picker/create-data"
import { BookingStep, useBookingStore } from "@/store/bookingStore"
import { AnimatePresence, motion } from "motion/react"
import { useHotkeys } from "react-hotkeys-hook"
import { AppShortcuts } from "@/types/shortcuts"
import { useAtomValue } from "jotai"
import {
  layoutTypeAtom,
  capsuleTierColorsAtom,
  colosseumTierColorsAtom,
  rectangularTierColorsAtom,
} from "./seat-picker/store"
import {
  CAPSULE_CONFIG,
  COLOSSEUM_CONFIG,
  RECTANGULAR_CONFIG,
  StadiumConfig,
} from "./seat-picker/config"

// Build a config with overridden tier colors
function buildConfigWithColors(
  layout: string,
  capsuleColors: Record<string, string>,
  colosseumColors: Record<string, string>,
  rectColors: Record<string, string>
): StadiumConfig {
  if (layout === "capsule") {
    return {
      ...CAPSULE_CONFIG,
      tiers: CAPSULE_CONFIG.tiers.map((t) => ({
        ...t,
        color: capsuleColors[t.id] ?? t.color,
      })),
    }
  }
  if (layout === "rectangular") {
    return {
      ...RECTANGULAR_CONFIG,
      tiers: RECTANGULAR_CONFIG.tiers.map((t) => ({
        ...t,
        color: rectColors[t.id] ?? t.color,
      })),
    }
  }
  // colosseum (default)
  return {
    ...COLOSSEUM_CONFIG,
    tiers: COLOSSEUM_CONFIG.tiers.map((t) => ({
      ...t,
      color: colosseumColors[t.id] ?? t.color,
    })),
  }
}

const BookingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const { setSeats, step, selectedSeats, toggleSeat, setStep, clearSelection } =
    useBookingStore()

  // ── Read Jotai atoms ──────────────────────────────────────────────────────
  const layout = useAtomValue(layoutTypeAtom)
  const capsuleColors = useAtomValue(capsuleTierColorsAtom)
  const colosseumColors = useAtomValue(colosseumTierColorsAtom)
  const rectColors = useAtomValue(rectangularTierColorsAtom)

  // ── Derive the active stadium config ─────────────────────────────────────
  const activeConfig = useMemo(
    () =>
      buildConfigWithColors(layout, capsuleColors, colosseumColors, rectColors),
    [layout, capsuleColors, colosseumColors, rectColors]
  )

  // ── Build sections from config (re-runs when config changes) ─────────────
  const sections = useMemo(() => {
    // Clear selection when layout changes to avoid stale seat IDs
    clearSelection()
    return buildSections(activeConfig)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConfig])

  // Sync seats into global store whenever sections rebuild
  useEffect(() => {
    const allSeats = sections.flatMap((s) => s.seats)
    setSeats(allSeats)
  }, [sections, setSeats])

  useHotkeys(
    AppShortcuts.ESCAPE,
    () => {
      if (step === BookingStep.REVIEW) {
        setStep(BookingStep.MAP)
      } else if (step === BookingStep.CONFIRM) {
        setStep(BookingStep.REVIEW)
      }
    },
    { enableOnFormTags: false },
    [step, setStep]
  )

  useHotkeys(
    AppShortcuts.PROCEED,
    () => {
      if (step === BookingStep.MAP && selectedSeats.length > 0) {
        setStep(BookingStep.REVIEW)
      } else if (step === BookingStep.REVIEW) {
        setStep(BookingStep.CONFIRM)
      }
    },
    { enableOnFormTags: false },
    [step, selectedSeats.length, setStep]
  )

  const content = React.useMemo(() => {
    switch (step) {
      case BookingStep.MAP:
        return (
          <motion.div
            key={`map-${layout}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex min-h-0 flex-1 overflow-hidden"
          >
            <div
              ref={containerRef}
              className="flex min-w-0 flex-1 flex-col overflow-hidden"
            >
              <StadiumSeatSelector
                key={layout}
                sections={sections}
                toggleSeat={toggleSeat}
                selectedSeats={selectedSeats}
              />
              <MapLegend />
            </div>
          </motion.div>
        )
      case BookingStep.REVIEW:
        return (
          <motion.div
            key="review"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ReviewStep />
          </motion.div>
        )
      case BookingStep.CONFIRM:
        return (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ConfirmStep />
          </motion.div>
        )
    }
  }, [step, selectedSeats, toggleSeat, sections, layout])

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#faf9f6] dark:bg-zinc-950">
      {/* Warm Ambient Mesh Background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-orange-400/5 blur-[120px] dark:bg-orange-900/5" />
        <div className="absolute top-[10%] right-[0%] h-[40%] w-[40%] rounded-full bg-rose-400/5 blur-[100px] dark:bg-rose-900/5" />
        <div className="absolute -bottom-[10%] left-[5%] h-[50%] w-[60%] rounded-full bg-amber-400/5 blur-[120px] dark:bg-amber-900/5" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <Header />
        <AnimatePresence mode="wait">{content}</AnimatePresence>
      </div>
    </div>
  )
}

export default BookingPage
