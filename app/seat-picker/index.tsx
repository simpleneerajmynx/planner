"use client"

import * as d3 from "d3"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { AnimatePresence } from "motion/react"
import { Section } from "./types"
import { Seat as GlobalSeat } from "@/types/seat"
import { HIT_ZONES, BLOCK_BACKGROUNDS, SECTION_GROUPS } from "./config"
import { ACTIVE_THEME, H, SEAT_R, W, ZOOM_BREAKPOINTS } from "./config"
import SeatTooltip from "./tooltip"
import BlockTooltip from "./block-tooltip"
import StadiumControls from "./stadium-controls"
import { useHotkeys } from "react-hotkeys-hook"
import { AppShortcuts } from "@/types/shortcuts"

type Props = {
  sections: Section[]
  selectedSeats: GlobalSeat[]
  toggleSeat: (seatId: string) => void
}

export default function StadiumSeatSelector({
  sections,
  toggleSeat,
  selectedSeats,
}: Props) {
  const currentScaleRef = useRef(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionsRef = useRef<Section[]>(sections)

  const zoomRef = useRef<d3.ZoomBehavior<HTMLCanvasElement, unknown> | null>(
    null
  )
  const drawRef = useRef<(() => void) | null>(null)

  // Convert array to set for O(1) lookups
  const selectedSeatIds = useMemo(
    () => new Set(selectedSeats.map((s) => s.id)),
    [selectedSeats]
  )

  const selectedSeatIdsRef = useRef(selectedSeatIds)
  useEffect(() => {
    selectedSeatIdsRef.current = selectedSeatIds
    if (drawRef.current) {
      requestAnimationFrame(drawRef.current)
    }
  }, [selectedSeatIds])

  const [zoomedGroup, setZoomedGroup] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    seat: GlobalSeat
  } | null>(null)
  const [blockTooltip, setBlockTooltip] = useState<{
    x: number
    y: number
    group: string
  } | null>(null)

  const hoveredSeatRef = useRef<GlobalSeat | null>(null)
  const blockTooltipRef = useRef<string | null>(null)

  const sectionColorMapRef = useRef<Record<string, string>>({})
  const seatColorMapRef = useRef<Record<string, string>>({})

  useEffect(() => {
    const nextSectionColorMap: Record<string, string> = {}
    const nextSeatColorMap: Record<string, string> = {}
    
    sections.forEach(s => {
      if (s.seats.length > 0) {
        nextSectionColorMap[s.id] = s.seats[0].color || ACTIVE_THEME.tooltip.availableBg
      }
      s.seats.forEach(seat => {
         nextSeatColorMap[seat.id] = seat.color || ACTIVE_THEME.tooltip.availableBg
      })
    })

    sectionColorMapRef.current = nextSectionColorMap
    seatColorMapRef.current = nextSeatColorMap

    if (drawRef.current) {
      requestAnimationFrame(drawRef.current)
    }
  }, [sections])

  const hideTooltipTimer = useRef<NodeJS.Timeout | null>(null)

  const selectedSeatsInHoveredBlock = useMemo(() => {
    if (!blockTooltip) return 0
    const sectionIds = SECTION_GROUPS[blockTooltip.group] || [
      blockTooltip.group,
    ]
    return selectedSeats.filter((seat) => sectionIds.includes(seat.section))
      .length
  }, [blockTooltip, selectedSeats])

  const hoveredGroupData = useMemo(() => {
    if (!blockTooltip)
      return { total: 0, available: 0, price: 0, color: "#3b82f6" }
    const sectionIds = SECTION_GROUPS[blockTooltip.group] || [
      blockTooltip.group,
    ]
    const seats = sectionsRef.current
      .filter((s) => sectionIds.includes(s.id))
      .flatMap((s) => s.seats)
    return {
      total: seats.length,
      available: seats.filter((s) => s.status === "available").length,
      price: seats[0]?.price || 0,
      color: seats[0]?.color || ACTIVE_THEME.tooltip.availableBg,
    }
  }, [blockTooltip])

  const [hintDone, setHintDone] = useState(false)
  const seatsUnlockedRef = useRef(false)
  const [seatsUnlocked, setSeatsUnlocked] = useState(false)
  const seatAnimationTimesRef = useRef<Record<string, number>>({})

  useEffect(() => {
    // Sync animated sets:
    let needsAnimation = false
    const now = performance.now()

    // Add new selections
    selectedSeats.forEach((seat) => {
      if (!seatAnimationTimesRef.current[seat.id]) {
        seatAnimationTimesRef.current[seat.id] = now
        needsAnimation = true
      }
    })

    // Cleanup removed selections
    const currentSelectedIds = new Set(selectedSeats.map((s) => s.id))
    Object.keys(seatAnimationTimesRef.current).forEach((id) => {
      if (!currentSelectedIds.has(id)) {
        delete seatAnimationTimesRef.current[id]
        needsAnimation = true
      }
    })

    if (needsAnimation && drawRef.current) {
      requestAnimationFrame(drawRef.current)
    }
  }, [selectedSeats])

  useEffect(() => {
    seatsUnlockedRef.current = seatsUnlocked
  }, [seatsUnlocked])

  const getInitialTransform = useCallback(() => {
    if (!canvasRef.current) return d3.zoomIdentity
    const cw = canvasRef.current.clientWidth || W
    const ch = canvasRef.current.clientHeight || H
    const scale = Math.min(cw / W, ch / H) * 0.75
    const tx = (cw - W * scale) / 2
    const ty = (ch - H * scale) / 2
    return d3.zoomIdentity.translate(tx, ty).scale(scale)
  }, [])

  const zoomToGroup = useCallback((groupId: string) => {
    if (!canvasRef.current || !zoomRef.current) return
    const ids = SECTION_GROUPS[groupId] ?? []
    const group = sectionsRef.current.filter((s) => ids.includes(s.id))
    if (!group.length) return

    const minX = Math.min(...group.map((s) => s.minX ?? 0)) - 28
    const maxX = Math.max(...group.map((s) => s.maxX ?? 0)) + 28
    const minY = Math.min(...group.map((s) => s.minY ?? 0)) - 28
    const maxY = Math.max(...group.map((s) => s.maxY ?? 0)) + 28

    const el = canvasRef.current
    const rect = el.getBoundingClientRect()
    const vw = rect.width || W
    const vh = rect.height || H
    const bw = maxX - minX,
      bh = maxY - minY

    let nextScale = ZOOM_BREAKPOINTS.MACRO_ZOOM
    if (currentScaleRef.current >= ZOOM_BREAKPOINTS.MACRO_ZOOM - 0.1) {
      nextScale = ZOOM_BREAKPOINTS.MICRO_ZOOM
    }

    const tx = vw / 2 - nextScale * (minX + bw / 2)
    const ty = vh / 2 - nextScale * (minY + bh / 2)

    setSeatsUnlocked(false)

    d3.select(canvasRef.current)
      .transition()
      .duration(650)
      .ease(d3.easeCubicInOut)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(tx, ty).scale(nextScale)
      )
      .on("end", () => {
        if (nextScale >= ZOOM_BREAKPOINTS.MICRO_ZOOM) {
          setSeatsUnlocked(true)
        }
      })

    setZoomedGroup(groupId)
    setHintDone(true)
  }, [])

  const resetZoom = useCallback(() => {
    if (!canvasRef.current || !zoomRef.current) return
    setSeatsUnlocked(false)
    d3.select(canvasRef.current)
      .transition()
      .duration(500)
      .ease(d3.easeCubicInOut)
      .call(zoomRef.current.transform, getInitialTransform())

    setZoomedGroup(null)
    setTooltip(null)
    setBlockTooltip(null)
    blockTooltipRef.current = null
    hoveredSeatRef.current = null
  }, [getInitialTransform])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    let transform = getInitialTransform()
    const allSeats = sectionsRef.current.flatMap((s) => s.seats)

    // seatById — built once, shared by both pointermove and selected-count badge
    const seatById = new Map(allSeats?.map((s) => [s?.id, s]))

    // sectionAvailableCount is still computed once, but colors read from ref dynamically
    const sectionAvailableCount: Record<string, number> = {}
    sectionsRef.current.forEach((s) => {
      if (s.seats.length > 0) {
        sectionAvailableCount[s.id] = s.seats.filter(
          (seat) => seat.status === "available"
        ).length
      }
    })

    // Pre-process hit paths for fast block detection
    const hitZonePaths = HIT_ZONES.map((z) => {
      const p = new Path2D()
      if (z.path) {
        const path2d = new Path2D(z.path)
        if (z.rotate && z.cx !== undefined && z.cy !== undefined) {
          const matrix = new DOMMatrix()
            .translate(z.cx, z.cy)
            .rotate(z.rotate)
            .translate(-z.cx, -z.cy)
          p.addPath(path2d, matrix)
        } else {
          p.addPath(path2d)
        }
      } else {
        p.roundRect(z.x, z.y, z.w || 0, z.h || 0, 4)
        if (z.rotate && z.cx !== undefined && z.cy !== undefined) {
          const matrix = new DOMMatrix()
            .translate(z.cx, z.cy)
            .rotate(z.rotate)
            .translate(-z.cx, -z.cy)
          const pRotated = new Path2D()
          pRotated.addPath(p, matrix)
          return { group: z.group, path: pRotated }
        }
      }
      return { group: z.group, path: p }
    })

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      if (
        canvas.width !== rect.width * dpr ||
        canvas.height !== rect.height * dpr
      ) {
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
      }

      context.save()
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.scale(dpr, dpr)
      context.translate(transform.x, transform.y)
      context.scale(transform.k, transform.k)

      const K_SCALE_FACTOR = transform.k
      const isDarkMode = document.documentElement.classList.contains("dark")

      // Per-block selected seat count — uses seatById built once outside draw()
      const sectionSelectedCount: Record<string, number> = {}
      selectedSeatIdsRef.current.forEach((id) => {
        const seat = seatById?.get(id)
        if (seat?.section) {
          sectionSelectedCount[seat.section] =
            (sectionSelectedCount[seat.section] ?? 0) + 1
        }
      })

      // ── Block Backgrounds ──────────────────────────────────────────────────
      BLOCK_BACKGROUNDS.forEach((b) => {
        context.save()
        if (b.rotate) {
          context.translate(b.cx, b.cy)
          context.rotate((b.rotate * Math.PI) / 180)
          context.translate(-b.cx, -b.cy)
        }

        const baseColor = sectionColorMapRef.current[b.type]
        let fillStyle = isDarkMode ? "#27272a" : ACTIVE_THEME.block.fill
        let strokeStyle = isDarkMode ? "#3f3f46" : ACTIVE_THEME.block.stroke

        if (baseColor) {
          const d3c = d3.color(baseColor)
          if (d3c) {
            if (K_SCALE_FACTOR <= ZOOM_BREAKPOINTS.TRANSITION_ZOOM) {
              // [CHANGE HERE] Zoomed OUT (Macro View)
              // Currently: light bg opacity (0.15 / 0.1), solid border
              d3c.opacity = isDarkMode ? 0.15 : 0.1
              fillStyle = d3c.toString()
              strokeStyle = baseColor
            } else {
              // [CHANGE HERE] Zoomed IN (Micro View)
              // Currently: transparent background, light border opacity (0.3 / 0.2)
              fillStyle = "transparent"
              d3c.opacity = isDarkMode ? 0.3 : 0.2
              strokeStyle = d3c.toString()
            }
          }
        } else {
          if (K_SCALE_FACTOR > ZOOM_BREAKPOINTS.TRANSITION_ZOOM)
            fillStyle = "transparent"
        }

        context.fillStyle = fillStyle
        context.strokeStyle = strokeStyle
        context.lineWidth = 1.5
        context.lineJoin = "round"

        context.beginPath()
        if (b.path) {
          const p = new Path2D(b.path)
          context.fill(p)
          if (context.lineWidth > 0) context.stroke(p)
        } else {
          // @ts-ignore rx may be from create-data block
          context.roundRect(b.x, b.y, b.w, b.h, b.rx ?? b.rxTop ?? 4)
          context.fill()
          if (context.lineWidth > 0) context.stroke()
        }
        context.restore()

        // ── Available Seat Count Overlay ─────────────────────────────────────
        if (K_SCALE_FACTOR < ZOOM_BREAKPOINTS.TRANSITION_ZOOM) {
          const count = sectionAvailableCount[b.type] ?? 0
          if (count > 0) {
            context.save()
            let textX = b.x + b.w / 2
            let textY = b.y + b.h / 2

            // Calculate true unrotated center if the section was rotated
            if (b.rotate && b.cx !== undefined && b.cy !== undefined) {
              const rad = (b.rotate * Math.PI) / 180
              const dx = textX - b.cx
              const dy = textY - b.cy
              textX = b.cx + dx * Math.cos(rad) - dy * Math.sin(rad)
              textY = b.cy + dx * Math.sin(rad) + dy * Math.cos(rad)
            }

            context.font = "800 20px sans-serif"
            context.textAlign = "center"
            context.textBaseline = "middle"

            const text = count.toString()
            const metrics = context.measureText(text)
            const textHeight = 16
            const padX = 10
            const padY = 6

            const badgeW = Math.max(34, metrics.width + padX * 2)
            const badgeH = textHeight + padY * 2

            // Badge Background
            context.beginPath()
            context.roundRect(
              textX - badgeW / 2,
              textY - badgeH / 2,
              badgeW,
              badgeH,
              12
            )

            context.shadowColor = isDarkMode
              ? "rgba(0,0,0,0.6)"
              : "rgba(0,0,0,0.15)"
            context.shadowBlur = 8
            context.shadowOffsetY = 3

            // Background is a darker derivation of the block tier color
            const tierColor =
              sectionColorMapRef.current[b.type] || (isDarkMode ? "#ffffff" : "#18181b")
            const badgeBgColor =
              d3.color(tierColor)?.darker(0.8)?.toString() || tierColor

            context.fillStyle = badgeBgColor
            context.fill()

            // Reset shadows for crisp text
            context.shadowBlur = 0
            context.shadowOffsetY = 0

            // Text color is crisp white for legibility against the darker badge
            context.fillStyle = "#ffffff"
            context.fillText(text, textX, textY + 0.5)

            // ── Selected count bubble ─────────────────────────────────────────
            // Small glowing green pip offset to top-right of the main badge
            // const selCount = sectionSelectedCount[b.type] ?? 0
            // if (selCount > 0) {
            //   const bubbleR   = 11
            //   const bubbleX   = textX + badgeW / 2 + bubbleR * 0.6
            //   const bubbleY   = textY - badgeH / 2 - bubbleR * 0.4

            //   // Outer glow ring
            //   context.beginPath()
            //   context.arc(bubbleX, bubbleY, bubbleR + 3.5, 0, Math.PI * 2)
            //   context.fillStyle = "rgba(34,197,94,0.20)"
            //   context.shadowColor = "rgba(34,197,94,0.55)"
            //   context.shadowBlur  = 8
            //   context.fill()

            //   // Green pill background
            //   context.beginPath()
            //   context.arc(bubbleX, bubbleY, bubbleR, 0, Math.PI * 2)
            //   context.fillStyle = "#16a34a"   // green-700
            //   context.shadowColor = "rgba(22,163,74,0.7)"
            //   context.shadowBlur  = 6
            //   context.shadowOffsetY = 2
            //   context.fill()

            //   // Reset shadow
            //   context.shadowBlur = 0
            //   context.shadowOffsetY = 0

            //   // White count text
            //   context.font = "800 12px sans-serif"
            //   context.textAlign = "center"
            //   context.textBaseline = "middle"
            //   context.fillStyle = "#ffffff"
            //   context.fillText(selCount.toString(), bubbleX, bubbleY + 0.5)
            // }

            context.restore()
          }
        }
      })

      if (K_SCALE_FACTOR <= ZOOM_BREAKPOINTS.TRANSITION_ZOOM) {
        if (blockTooltipRef.current) {
          const baseColor = sectionColorMapRef.current[blockTooltipRef.current]
          if (baseColor) {
            const d3c = d3.color(baseColor)
            if (d3c) {
              d3c.opacity = isDarkMode ? 0.35 : 0.25
              context.fillStyle = d3c.toString()
            }
          } else {
            context.fillStyle = isDarkMode
              ? "rgba(255,255,255,0.06)"
              : ACTIVE_THEME.block.hoverFill
          }
          for (const z of hitZonePaths) {
            if (z.group === blockTooltipRef.current) {
              context.fill(z.path)
            }
          }
        }
      }

      // ── Seats ──────────────────────────────────────────────────────────────
      context.globalAlpha =
        K_SCALE_FACTOR < ZOOM_BREAKPOINTS.TRANSITION_ZOOM ? 0.15 : 1

      const now = performance.now()
      const BOUNCE_DURATION = 500 // ms — scale bounce on click
      const RIPPLE_DURATION = 750 // ms — expanding ring burst

      for (let i = 0; i < allSeats.length; i++) {
        const d = allSeats[i]
        if (hoveredSeatRef.current?.id === d.id) continue

        const isSelected = selectedSeatIdsRef.current?.has(d?.id)
        const seatColor = seatColorMapRef.current[d.id] || d.color || ACTIVE_THEME.seat.selectedStroke

        if (d.status !== "available") {
          // ── Sold / unavailable ───────────────────────────────────────────────
          context.beginPath()
          context.arc(d.x, d.y, SEAT_R, 0, Math.PI * 2)
          context.fillStyle =
            isDarkMode && ACTIVE_THEME.seat.sold === "#dededf"
              ? "#3f3f46"
              : ACTIVE_THEME.seat.sold
          context.fill()
        } else if (isSelected) {
          // ── Selected: white pill with colored outer ring ─────────────────────
          // Outer colored ring
          context.beginPath()
          context.arc(d.x, d.y, SEAT_R + 1.5, 0, Math.PI * 2)
          context.fillStyle = seatColor
          context.fill()
          // White inner disc
          context.beginPath()
          context.arc(d.x, d.y, SEAT_R - 0.5, 0, Math.PI * 2)
          context.fillStyle = "#ffffff"
          context.fill()
        } else {
          // ── Available ────────────────────────────────────────────────────────
          context.beginPath()
          context.arc(d.x, d.y, SEAT_R, 0, Math.PI * 2)
          context.fillStyle = seatColor
          context.fill()
        }
      }

      // ── Hovered seat ─────────────────────────────────────────────────────────
      if (hoveredSeatRef.current) {
        const d = hoveredSeatRef.current
        const isSelectedHover = selectedSeatIdsRef.current.has(d.id)
        const seatColor = seatColorMapRef.current[d.id] || d.color || ACTIVE_THEME.seat.hover
        const d3c = d3.color(seatColor)

        // Outer halo glow (soft, wide)
        context.beginPath()
        context.arc(d.x, d.y, SEAT_R + 5.5, 0, Math.PI * 2)
        if (d3c) {
          d3c.opacity = isDarkMode ? 0.22 : 0.15
          context.fillStyle = d3c.toString()
        }
        context.fill()

        // Inner ring
        context.beginPath()
        context.arc(d.x, d.y, SEAT_R + 2.5, 0, Math.PI * 2)
        if (d3c) {
          d3c.opacity = isDarkMode ? 0.75 : 0.6
          context.strokeStyle = d3c.toString()
          context.lineWidth = 1.2
        }
        context.stroke()

        // Seat body (selected or available)
        if (isSelectedHover) {
          context.beginPath()
          context.arc(d.x, d.y, SEAT_R + 1.5, 0, Math.PI * 2)
          context.fillStyle = seatColor
          context.fill()
          context.beginPath()
          context.arc(d.x, d.y, SEAT_R - 0.5, 0, Math.PI * 2)
          context.fillStyle = "#ffffff"
          context.fill()
        } else {
          context.beginPath()
          context.arc(d.x, d.y, SEAT_R, 0, Math.PI * 2)
          context.fillStyle = seatColor
          context.fill()
        }
      }

      // ── Selected seat animations + checkmarks ────────────────────────────────
      let isAnimating = false
      context.lineCap = "round"
      context.lineJoin = "round"

      for (let i = 0; i < allSeats.length; i++) {
        const d = allSeats[i]
        if (!selectedSeatIdsRef.current.has(d.id)) continue

        const seatColor = seatColorMapRef.current[d.id] || d.color || ACTIVE_THEME.seat.selectedStroke
        const startTime = seatAnimationTimesRef.current[d.id] || now
        const elapsed = now - startTime
        const bounceT = Math.min(elapsed / BOUNCE_DURATION, 1)
        const rippleT = Math.min(elapsed / RIPPLE_DURATION, 1)
        if (bounceT < 1 || rippleT < 1) isAnimating = true

        // ── 1. Ripple burst — expanding ring that fades out ──────────────────
        if (rippleT < 1) {
          // easeOutExpo
          const rp = rippleT === 1 ? 1 : 1 - Math.pow(2, -10 * rippleT)
          const rippleR = SEAT_R + 1.5 + rp * SEAT_R * 4.5
          const rippleAlpha = (1 - rp) * 0.75
          const rc = d3.color(seatColor)
          if (rc) {
            rc.opacity = rippleAlpha
            context.beginPath()
            context.arc(d.x, d.y, rippleR, 0, Math.PI * 2)
            context.strokeStyle = rc.toString()
            context.lineWidth = 2
            context.stroke()
          }
          // Second inner ripple ring (delayed slightly)
          const rp2 = Math.max(0, rippleT - 0.15) / 0.85
          if (rp2 > 0) {
            const rippleR2 = SEAT_R + 1.5 + rp2 * SEAT_R * 2.5
            const rippleAlpha2 = (1 - rp2) * 0.45
            const rc2 = d3.color(seatColor)
            if (rc2) {
              rc2.opacity = rippleAlpha2
              context.beginPath()
              context.arc(d.x, d.y, rippleR2, 0, Math.PI * 2)
              context.strokeStyle = rc2.toString()
              context.lineWidth = 1.2
              context.stroke()
            }
          }
        }

        // ── 2. Scale bounce — seat pops in with easeOutBack ──────────────────
        // c1=1.70158, c3=c1+1 — standard easeOutBack coefficients
        const c1 = 1.70158
        const c3 = c1 + 1
        const scale =
          bounceT < 1
            ? Math.max(
                0,
                1 +
                  c3 * Math.pow(bounceT - 1, 3) +
                  c1 * Math.pow(bounceT - 1, 2)
              )
            : 1

        // ── 3. Checkmark — bold, proportional tick in seat's own color ────────
        context.save()
        context.translate(d.x, d.y)
        context.scale(scale, scale)

        // Re-draw the white+ring at the bounced scale so it pops cleanly
        if (bounceT < 1) {
          context.beginPath()
          context.arc(0, 0, SEAT_R + 1.5, 0, Math.PI * 2)
          context.fillStyle = seatColor
          context.fill()
          context.beginPath()
          context.arc(0, 0, SEAT_R - 0.5, 0, Math.PI * 2)
          context.fillStyle = "#ffffff"
          context.fill()
        }

        // Bold tick — arms proportional to SEAT_R for crisp rendering at any zoom
        const cr = SEAT_R * 0.5
        context.beginPath()
        context.moveTo(-cr * 0.6, cr * 0.05)
        context.lineTo(-cr * 0.05, cr * 0.6)
        context.lineTo(cr * 0.72, -cr * 0.52)
        context.strokeStyle = seatColor
        context.lineWidth = SEAT_R * 0.42 // scales with seat radius
        context.stroke()

        context.restore()
      }

      context.restore()

      // Keep drawing loop alive while any animation is running
      if (isAnimating && drawRef.current) {
        requestAnimationFrame(drawRef.current)
      }
    }

    drawRef.current = draw
    draw()

    // ── Zoom Setup ──────────────────────────────────────────────────────────
    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.1, 14])
      .on("zoom", (event) => {
        transform = event.transform
        currentScaleRef.current = event.transform.k
        draw()
      })

    zoomRef.current = zoom
    const canvasSel = d3.select(canvas)
    canvasSel.call(zoom)
    canvasSel.call(zoom.transform, getInitialTransform())

    canvasSel.on("dblclick.zoom", null)
    canvasSel.on("dblclick", () => resetZoom())

    // ── Interaction ─────────────────────────────────────────────────────────

    const quadtree = d3
      .quadtree<GlobalSeat>()
      .x((d) => d.x)
      .y((d) => d.y)
      .addAll(allSeats)

    canvasSel.on("pointermove", (event) => {
      if (event.pointerType === "touch" || event.buttons > 0) return

      const [mx, my] = d3.pointer(event, canvas)
      const ix = (mx - transform.x) / transform.k
      const iy = (my - transform.y) / transform.k

      let didFindSeat = false
      let didFindBlock = false

      const isSeatSelectable = transform.k >= ZOOM_BREAKPOINTS.MICRO_ZOOM

      if (isSeatSelectable) {
        const SEARCH_RADIUS = (SEAT_R + 5) / transform.k
        const nearestSeat = quadtree.find(ix, iy, SEARCH_RADIUS)

        if (nearestSeat && nearestSeat.status === "available") {
          didFindSeat = true
          if (hoveredSeatRef.current?.id !== nearestSeat.id) {
            hoveredSeatRef.current = nearestSeat
            draw()

            const screenX = nearestSeat.x * transform.k + transform.x
            const screenY = nearestSeat.y * transform.k + transform.y

            if (hideTooltipTimer.current) clearTimeout(hideTooltipTimer.current)
            setTooltip({
              x: screenX,
              y: screenY,
              seat: nearestSeat,
            })
          }
        }
      }

      if (!didFindSeat) {
        if (hoveredSeatRef.current) {
          hoveredSeatRef.current = null
          draw()
          hideTooltipTimer.current = setTimeout(() => setTooltip(null), 150)
        }

        if (!isSeatSelectable) {
          let hoveredBlock = null
          for (const z of hitZonePaths) {
            if (context.isPointInPath(z.path, ix, iy)) {
              hoveredBlock = z.group
              break
            }
          }

          if (hoveredBlock) {
            didFindBlock = true
            if (blockTooltipRef.current !== hoveredBlock) {
              blockTooltipRef.current = hoveredBlock
              setBlockTooltip({ x: mx, y: my, group: hoveredBlock })
              draw()
            } else {
              setBlockTooltip({ x: mx, y: my, group: hoveredBlock })
            }
          } else {
            if (blockTooltipRef.current) {
              blockTooltipRef.current = null
              setBlockTooltip(null)
              draw()
            }
          }
        }
      }

      const newCursor = didFindSeat
        ? "pointer"
        : didFindBlock
          ? "zoom-in"
          : "grab"
      if (canvas.style.cursor !== newCursor) canvas.style.cursor = newCursor
    })

    canvasSel.on("click", (event) => {
      event.stopPropagation()

      const [mx, my] = d3.pointer(event, canvas)
      const ix = (mx - transform.x) / transform.k
      const iy = (my - transform.y) / transform.k

      const isSeatSelectable = transform.k >= ZOOM_BREAKPOINTS.MICRO_ZOOM

      if (isSeatSelectable) {
        const nearestSeat = quadtree.find(ix, iy, (SEAT_R + 5) / transform.k)
        if (nearestSeat && nearestSeat.status === "available") {
          toggleSeat(nearestSeat.id)
          return
        }
      }

      if (!isSeatSelectable) {
        for (const z of hitZonePaths) {
          if (context.isPointInPath(z.path, ix, iy)) {
            setBlockTooltip(null)
            blockTooltipRef.current = null
            zoomToGroup(z.group)
            break
          }
        }
      }
    })

    canvasSel.on("pointerleave", (event) => {
      if (event.pointerType === "touch") return
      if (hoveredSeatRef.current) {
        hoveredSeatRef.current = null
        draw()
        hideTooltipTimer.current = setTimeout(() => setTooltip(null), 150)
      }
      if (blockTooltipRef.current) {
        blockTooltipRef.current = null
        setBlockTooltip(null)
        draw()
      }
      canvas.style.cursor = "grab"
    })

    const observer = new ResizeObserver(() => {
      if (drawRef.current) requestAnimationFrame(drawRef.current)
    })
    observer.observe(canvas)

    return () => {
      canvasSel.on(".zoom", null)
      canvasSel.on("dblclick", null)
      canvasSel.on("pointermove", null)
      canvasSel.on("click", null)
      canvasSel.on("pointerleave", null)
      observer.disconnect()
    }
  }, [getInitialTransform, zoomToGroup, resetZoom, toggleSeat])

  const zoomBy = useCallback((factor: number) => {
    if (!canvasRef.current || !zoomRef.current) return
    d3.select(canvasRef.current)
      .transition()
      .duration(300)
      .call(zoomRef.current.scaleBy, factor)
  }, [])

  useHotkeys(
    AppShortcuts.ZOOM_IN,
    (e) => {
      e.preventDefault()
      zoomBy(1.5)
    },
    { preventDefault: true },
    [zoomBy]
  )

  useHotkeys(
    AppShortcuts.ZOOM_OUT,
    (e) => {
      e.preventDefault()
      zoomBy(0.667)
    },
    { preventDefault: true },
    [zoomBy]
  )

  useHotkeys(
    [AppShortcuts.RESET_ZOOM],
    (e) => {
      e.preventDefault()
      resetZoom()
    },
    { preventDefault: true },
    [resetZoom]
  )

  useHotkeys(
    AppShortcuts.ESCAPE,
    (e) => {
      if (zoomedGroup) {
        e.preventDefault()
        resetZoom()
      }
    },
    { enableOnFormTags: false },
    [zoomedGroup, resetZoom]
  )

  return (
    <div
      className="relative min-h-0 flex-1 overflow-hidden"
      style={{ touchAction: "none" }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full outline-none"
        style={{
          touchAction: "none",
          WebkitTapHighlightColor: "transparent",
          cursor: "grab",
        }}
      />

      <AnimatePresence>
        {blockTooltip && !zoomedGroup && (
          <BlockTooltip
            key={blockTooltip.group}
            x={blockTooltip.x}
            y={blockTooltip.y}
            group={blockTooltip.group}
            total={hoveredGroupData.total}
            available={hoveredGroupData.available}
            price={hoveredGroupData.price}
            color={hoveredGroupData.color}
            selectedCount={selectedSeatsInHoveredBlock}
            onPointerEnter={() => {
              if (hideTooltipTimer.current)
                clearTimeout(hideTooltipTimer.current)
            }}
            onPointerLeave={() => {
              hideTooltipTimer.current = setTimeout(
                () => setBlockTooltip(null),
                150
              )
            }}
          />
        )}

        {tooltip && (
          <SeatTooltip
            key="seat-tooltip"
            {...tooltip}
            selectedSeatIds={selectedSeatIds}
            onPointerEnter={() => {
              if (hideTooltipTimer.current)
                clearTimeout(hideTooltipTimer.current)
            }}
            onPointerLeave={() => {
              hideTooltipTimer.current = setTimeout(() => setTooltip(null), 150)
            }}
          />
        )}
      </AnimatePresence>

      <StadiumControls
        zoomedGroup={zoomedGroup}
        resetZoom={resetZoom}
        zoomBy={zoomBy}
      />
    </div>
  )
}
