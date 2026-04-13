"use client"

import React, { useEffect, useRef, useCallback, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "motion/react"
import { X, Eye } from "lucide-react"
import { Seat } from "@/types/seat"

// ── Camera tilt config ────────────────────────────────────────────────────────
/** Row 0 (pitch-side) → 10° base tilt. Row 40 (top tier) → 2°. */
function getBaseTiltFromRow(row: string | number): number {
  const r = typeof row === "string" ? parseInt(row) : (row ?? 0)
  const clamped = Math.max(0, Math.min(r, 40))
  return 10 - (clamped / 40) * 8
}

type Props = {
  seat: Seat
  open: boolean
  onClose: () => void
  imageUrl: string
  imageLabel: string
  objectPosition: string
}

export default function StadiumViewModal({
  seat,
  open,
  onClose,
  imageUrl,
  imageLabel,
  objectPosition,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const baseTilt = getBaseTiltFromRow(seat.row)

  // ── Spring state (mutated in rAF, never causes re-renders) ───────────────────
  const spring = useRef({
    rotX: baseTilt,
    rotY: 0,
    scale: 1.02,
    vX: 0,
    vY: 0,
    vS: 0,
  })
  const mouse = useRef({ nx: 0, ny: 0 }) // normalised -1 → +1

  // ── Spring animation loop ─────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const sp = spring.current
    const el = wrapperRef.current
    const gl = glareRef.current
    if (!el) return

    const mx = mouse.current.nx
    const my = mouse.current.ny

    // Target state derived from mouse position
    const targetRotX = baseTilt - my * 5 // pitch: tilt up/down
    const targetRotY = mx * 8 // yaw: tilt left/right
    const targetScale = 1.04 + Math.abs(mx) * 0.01 + Math.abs(my) * 0.006

    // Spring physics — stiffness = how snappy, damping = how much drag
    const stiffness = 0.055
    const damping = 0.8

    sp.vX += (targetRotX - sp.rotX) * stiffness
    sp.vY += (targetRotY - sp.rotY) * stiffness
    sp.vS += (targetScale - sp.scale) * stiffness

    sp.vX *= damping
    sp.vY *= damping
    sp.vS *= damping

    sp.rotX += sp.vX
    sp.rotY += sp.vY
    sp.scale += sp.vS

    // Apply transform
    el.style.transform = `perspective(1000px) rotateX(${sp.rotX.toFixed(3)}deg) rotateY(${sp.rotY.toFixed(3)}deg) scale(${sp.scale.toFixed(4)})`

    // Shift glare opposite to tilt — simulates real surface light reflection
    if (gl) {
      const gx = 50 + sp.rotY * -3 // glare moves left when rotated right
      const gy = 50 + sp.rotX * -2
      gl.style.background = `
        radial-gradient(
          ellipse 140% 100% at ${gx}% ${gy}%,
          rgba(255,255,255,0.18) 0%,
          transparent 55%
        ),
        linear-gradient(
          ${135 + sp.rotY * 2}deg,
          rgba(255,255,255,0.10) 0%,
          transparent 45%,
          rgba(0,0,0,0.22) 100%
        )
      `
    }

    // Keep looping while still settling (micro-threshold to kill the loop)
    const stillMoving =
      Math.abs(sp.vX) > 0.0008 ||
      Math.abs(sp.vY) > 0.0008 ||
      Math.abs(sp.vS) > 0.00005

    if (stillMoving) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      rafRef.current = null
    }
  }, [baseTilt])

  // Kick the loop when mouse moves
  const startSpring = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [tick])

  // ── Mouse tracking ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return

    const handleMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      mouse.current.nx =
        (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      mouse.current.ny =
        (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
      startSpring()
    }

    window.addEventListener("mousemove", handleMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", handleMove)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [open, startSpring])

  // Reset spring when modal closes
  useEffect(() => {
    if (!open) {
      mouse.current = { nx: 0, ny: 0 }
      spring.current = {
        rotX: baseTilt,
        rotY: 0,
        scale: 1.02,
        vX: 0,
        vY: 0,
        vS: 0,
      }
    }
  }, [open, baseTilt])

  // Keyboard Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const sectionLabel = seat.section?.replace(/T|-|_/g, " ").trim() || "134"
  const rowLabel = (parseInt(String(seat.row)) + 1).toString()
  const seatLabel = (seat.number + 1).toString()

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        // ── Backdrop ─────────────────────────────────────────────────────────
        <motion.div
          key="stadium-modal-backdrop"
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* ── Modal card ─────────────────────────────────────────────────── */}
          <motion.div
            key="stadium-modal-card"
            className="relative z-10 mx-4 w-full max-w-[660px]"
            // Cinematic entrance: card swings in from above
            initial={{ scale: 0.8, opacity: 0, y: 40, rotateX: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 16 }}
            transition={{
              type: "spring",
              damping: 18,
              stiffness: 200,
              mass: 1.1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 3D scene — the containerRef is used for mouse normalisation */}
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-[22px] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
              style={{ perspective: "1000px" }}
            >
              {/* Image wrapper — this is what the spring tilts */}
              <div
                ref={wrapperRef}
                className="relative w-full overflow-hidden"
                style={{
                  transform: `perspective(1000px) rotateX(${baseTilt}deg) rotateY(0deg) scale(1.02)`,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                  borderRadius: "22px",
                }}
              >
                <img
                  src={imageUrl}
                  alt={`View from seat — ${imageLabel}`}
                  className="w-full object-cover select-none"
                  style={{ height: "420px", display: "block", objectPosition }}
                  draggable={false}
                />

                {/* Dynamic glare — updated by spring loop via ref */}
                <div
                  ref={glareRef}
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 140% 100% at 50% 50%, rgba(255,255,255,0.18) 0%, transparent 55%)",
                    borderRadius: "22px",
                    transition: "none",
                  }}
                />

                {/* Vignette (static) */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.60) 100%)",
                    borderRadius: "22px",
                  }}
                />

                {/* Bottom gradient for text legibility */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 55%)",
                    borderRadius: "22px",
                  }}
                />

                {/* VIEW FROM SEAT badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur-md">
                  <Eye className="h-3 w-3 text-white" />
                  <span className="text-[10px] font-bold tracking-widest text-white">
                    {imageLabel.toUpperCase()} VIEW
                  </span>
                </div>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 ring-1 ring-white/15 backdrop-blur-md transition-colors hover:bg-black/80"
                  aria-label="Close view"
                >
                  <X className="h-4 w-4 text-white" />
                </button>

                {/* Info row */}
                <div className="absolute right-0 bottom-0 left-0 flex items-end justify-between px-5 py-4">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium tracking-wider text-white/55">
                      SEAT PREVIEW
                    </span>
                    <span className="text-xl leading-tight font-black text-white drop-shadow">
                      Section {sectionLabel}
                    </span>
                    <span className="text-[13px] font-semibold text-white/80">
                      Row {rowLabel} · Seat {seatLabel}
                    </span>
                  </div>

                  {/* Price chip */}
                  <div
                    className="flex flex-col items-end rounded-xl px-4 py-2.5 ring-1 ring-white/15 backdrop-blur-md"
                    style={{
                      backgroundColor: seat.color
                        ? seat.color + "cc"
                        : "rgba(59,130,246,0.8)",
                    }}
                  >
                    <span className="text-[10px] font-bold tracking-wider text-white/75">
                      PRICE
                    </span>
                    <span className="text-[20px] leading-none font-black text-white">
                      ${seat.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tip */}
            <p className="mt-3 text-center text-[12px] text-white/35">
              Move your mouse to look around ·{" "}
              <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-white/55">
                Esc
              </kbd>{" "}
              to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
