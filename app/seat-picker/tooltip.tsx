"use client"

import React, { forwardRef, useState } from "react"
import { Seat as GlobalSeat } from "@/types/seat"
import { ACTIVE_THEME } from "./config"
import { Check, Maximize2, Eye } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import StadiumViewModal from "./stadium-view-modal"

import { useAtomValue } from "jotai"
import { stadiumImageUrlAtom } from "@/app/seat-picker/store"

// ── Default Stadium image ────────────────────────────────────────────────────
const DEFAULT_STADIUM_IMAGE =
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1770&auto=format&fit=crop"

// Tier → friendly label
const TIER_LABEL: Record<string, string> = {
  "100": "Pitch Side",
  "200": "Lower Bowl",
  "300": "Upper Deck",
  "400": "Top Tier",
}

/**
 * The single stadium panoramic image has the following layout:
 *   ← West end-zone   |   North stand   |   South stand   |   East end-zone →
 *   (left of image)                                        (right of image)
 *   top = upper roof/sky, bottom = pitch level
 *
 * We shift object-position X based on which SIDE of the stadium the seat is on
 * (parsed from section IDs like T100_N_3, T200_SW_5, T300_E_2, etc.)
 * and object-position Y based on ROW (low row = pitch-side = look more across,
 * high row = top tier = look more steeply down).
 */

// Direction code → object-position X (%)
// Think of it as: "I am sitting on the North side → I look South
//   → I see the South stand which is at the X=50 centre of the image"
const DIR_OBJ_X: Record<string, number> = {
  N: 50, // North stand: look south → centre of image
  S: 50, // South stand: look north → centre of image
  E: 15, // East end-zone: look west → left portion (west side) of image
  W: 85, // West end-zone: look east → right portion (east side)
  NE: 25, // NE corner: look SW → slightly left-of-centre
  NW: 75, // NW corner: look SE → slightly right-of-centre
  SE: 25, // SE corner: look NW → slightly left
  SW: 75, // SW corner: look NE → slightly right
}

type ViewParams = {
  url: string
  label: string
  objectPosition: string
}

function getDirectionFromSection(section?: string): string {
  if (!section) return "N"
  // Matches codes like _N_, _NE_, _SW_, _E_ in section IDs
  const match = section.match(/_([NSEW]{1,2})_/i)
  return match ? match[1].toUpperCase() : "N"
}

function getTierLabelFromSection(section?: string): string {
  if (!section) return TIER_LABEL["100"]
  const match = section.match(/(\d{3})/)
  if (!match) return TIER_LABEL["100"]
  const keys = [100, 200, 300, 400]
  const num = parseInt(match[1])
  const closest = keys.reduce((prev, curr) =>
    Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
  )
  return TIER_LABEL[String(closest)] ?? TIER_LABEL["100"]
}

function getViewParams(seat: GlobalSeat, customImageUrl: string): ViewParams {
  const label = getTierLabelFromSection(seat.section)
  const direction = getDirectionFromSection(seat.section)

  // X: which horizontal slice of the image to show
  const objX = DIR_OBJ_X[direction] ?? 50

  // Y: vertical position — low row = more pitch visible (lower %);
  //    high row = looking steeply down (higher %)
  const rowNum =
    typeof seat.row === "string" ? parseInt(seat.row) : (seat.row ?? 0)
  const clamped = Math.max(0, Math.min(rowNum, 40))
  const objY = 25 + (clamped / 40) * 40 // 25% (pitch-level) → 65% (top-tier)

  return {
    url: customImageUrl || DEFAULT_STADIUM_IMAGE,
    label,
    objectPosition: `${objX}% ${objY}%`,
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────
type TooltipProps = {
  seat: GlobalSeat
  x: number
  y: number
  selectedSeatIds: Set<string>
  onPointerEnter?: () => void
  onPointerLeave?: () => void
}

const SeatTooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ x, y, seat, selectedSeatIds, onPointerEnter, onPointerLeave }, ref) => {
    const [modalOpen, setModalOpen] = useState(false)
    const [imgHovered, setImgHovered] = useState(false)

    const customImageUrl = useAtomValue(stadiumImageUrlAtom)

    const isSelected = selectedSeatIds.has(seat.id)
    const sectionLabel = seat.section?.replace(/T|-|_/g, " ").trim() || "C134"
    const rowLabel = (parseInt(String(seat.row)) + 1).toString()
    const seatLabel = (seat.number + 1).toString()

    const viewParams = getViewParams(seat, customImageUrl)

    const openModal = (e: React.MouseEvent) => {
      e.stopPropagation()
      setModalOpen(true)
    }

    return (
      <>
        <motion.div
          ref={ref}
          onPointerEnter={onPointerEnter}
          // KEY FIX: suppress leave handler while modal is open so the
          // tooltip doesn't self-destroy when the modal backdrop covers it
          onPointerLeave={modalOpen ? undefined : onPointerLeave}
          initial={{ opacity: 0, scale: 0.95, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 4 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="absolute z-50 -translate-x-1/2 -translate-y-[calc(100%+16px)] transform drop-shadow-2xl"
          style={{ left: x, top: y - 15 }}
        >
          <div className="flex w-72 flex-col overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-black/5">
            {/* ── Stadium Preview Image ──────────────────────────────────────── */}
            <div
              className="group relative h-[130px] w-full cursor-pointer overflow-hidden bg-gray-900"
              onMouseEnter={() => setImgHovered(true)}
              onMouseLeave={() => setImgHovered(false)}
              onClick={openModal}
              role="button"
              aria-label="Open full stadium view"
            >
              <motion.img
                src={viewParams.url}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: viewParams.objectPosition }}
                alt={`View from seat — ${viewParams.label}`}
                draggable={false}
                animate={{ scale: imgHovered ? 1.07 : 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />

              {/* Tinted gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />

              {/* VIEW FROM SEAT badge — top-left */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 ring-1 ring-white/10 backdrop-blur-sm">
                <Eye className="h-[10px] w-[10px] text-white" />
                <span className="text-[8px] font-bold tracking-widest text-white">
                  VIEW FROM SEAT
                </span>
              </div>

              {/* Tier label chip — bottom-left, hidden when hover CTA shows */}
              {!imgHovered && (
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="text-[9px] font-bold tracking-wider text-white/70">
                    {viewParams.label.toUpperCase()}
                  </span>
                </div>
              )}

              {/* "Open full screen" CTA — appears on hover */}
              <AnimatePresence>
                {imgHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.16 }}
                    className="absolute inset-x-0 bottom-2.5 flex justify-center"
                  >
                    <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 shadow-lg backdrop-blur-sm">
                      <Maximize2 className="h-3 w-3 text-gray-800" />
                      <span className="text-[10px] font-bold text-gray-800">
                        Open full screen
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Section / Row / Seat numbers ──────────────────────────────── */}
            <div className="flex h-[68px] bg-white">
              <div className="flex flex-1 flex-col items-center justify-center border-r border-[#f0f0f4]">
                <span className="mb-0.5 text-[10px] font-bold tracking-wider text-gray-400">
                  SECTION
                </span>
                <span
                  className="text-[20px] leading-none font-black capitalize"
                  style={{ color: ACTIVE_THEME.tooltip.textPrimary }}
                >
                  {sectionLabel}
                </span>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center border-r border-[#f0f0f4]">
                <span className="mb-0.5 text-[10px] font-bold tracking-wider text-gray-400">
                  ROW
                </span>
                <span
                  className="text-[20px] leading-none font-black"
                  style={{ color: ACTIVE_THEME.tooltip.textPrimary }}
                >
                  {rowLabel}
                </span>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center">
                <span className="mb-0.5 text-[10px] font-bold tracking-wider text-gray-400">
                  SEAT
                </span>
                <span
                  className="text-[20px] leading-none font-black"
                  style={{ color: ACTIVE_THEME.tooltip.textPrimary }}
                >
                  {seatLabel}
                </span>
              </div>
            </div>

            {/* ── Status / Price bar ────────────────────────────────────────── */}
            {isSelected ? (
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{
                  backgroundColor:
                    seat.color || ACTIVE_THEME.tooltip.selectedBg,
                }}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-4 ring-white/20">
                    <Check
                      className="h-5 w-5"
                      style={{
                        color: seat.color || ACTIVE_THEME.tooltip.selectedBg,
                      }}
                      strokeWidth={3.5}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[16px] leading-tight font-bold tracking-tight text-white">
                      Selected
                    </span>
                    <span className="text-[11px] leading-tight font-medium text-white/90">
                      {viewParams.label}
                    </span>
                  </div>
                </div>
                <span className="text-[20px] font-bold tracking-tight text-white">
                  ${seat.price}
                </span>
              </div>
            ) : (
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{
                  backgroundColor:
                    seat.color || ACTIVE_THEME.tooltip.availableBg,
                }}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25">
                    <div className="h-2.5 w-2.5 rounded-full bg-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[16px] leading-tight font-bold tracking-tight text-white">
                      Available
                    </span>
                    <span className="text-[11px] leading-tight font-medium text-white/80">
                      {viewParams.label}
                    </span>
                  </div>
                </div>
                <span className="text-[20px] font-bold tracking-tight text-white">
                  ${seat.price}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Full-screen 3D Modal (portal → document.body) ─────────────────── */}
        {modalOpen && (
          <StadiumViewModal
            seat={seat}
            imageUrl={viewParams.url}
            imageLabel={viewParams.label}
            objectPosition={viewParams.objectPosition}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        )}
      </>
    )
  }
)

SeatTooltip.displayName = "SeatTooltip"

export default SeatTooltip
