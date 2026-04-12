"use client"

import * as d3 from "d3"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { ZoomIn, ZoomOut, Maximize, ArrowLeft } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { HitZone, Section, ViewRect } from "./types"
import { Seat as GlobalSeat } from "@/types/seat"
import {
  ACTIVE_THEME,
  H,
  HIT_ZONES,
  SEAT_R,
  BLOCK_BACKGROUNDS,
  SECTION_GROUPS,
  W,
  ZOOM_IN_SCALE,
} from "./create-data"
import SeatTooltip from "./tooltip"

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
  const svgRef = useRef<SVGSVGElement>(null)
  const sectionsRef = useRef<Section[]>(sections)

  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  // Convert array to set for O(1) D3 painting lookups
  const selectedSeatIds = useMemo(
    () => new Set(selectedSeats.map((s) => s.id)),
    [selectedSeats]
  )

  const selectedSeatIdsRef = useRef(selectedSeatIds)
  useEffect(() => {
    selectedSeatIdsRef.current = selectedSeatIds
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

  const hideTooltipTimer = useRef<NodeJS.Timeout | null>(null)

  const selectedSeatsInHoveredBlock = useMemo(() => {
    if (!blockTooltip) return 0
    const sectionIds = SECTION_GROUPS[blockTooltip.group] || [
      blockTooltip.group,
    ]
    return selectedSeats.filter((seat) => sectionIds.includes(seat.section))
      .length
  }, [blockTooltip, selectedSeats])

  const [hintDone, setHintDone] = useState(false)
  const [seatsUnlocked, setSeatsUnlocked] = useState(false)
  // Minimap viewport rect (in SVG viewBox coordinates)
  const [viewRect, setViewRect] = useState<ViewRect>({ x: 0, y: 0, w: W, h: H })

  const INITIAL_SCALE = 0.75
  const INITIAL_TRANSFORM = useMemo(() => {
    return d3.zoomIdentity
      .translate((W - W * INITIAL_SCALE) / 2, (H - H * INITIAL_SCALE) / 2)
      .scale(INITIAL_SCALE)
  }, [])

  // ── Update minimap viewport rect from current D3 transform ────────────────
  const updateMinimap = useCallback((transform: d3.ZoomTransform) => {
    const el = svgRef.current
    if (!el) return
    const vw = el.clientWidth || W
    const vh = el.clientHeight || H
    // Inverse transform: screen corners → SVG coords
    const x = -transform.x / transform.k
    const y = -transform.y / transform.k
    const rw = vw / transform.k
    const rh = vh / transform.k
    setViewRect({ x, y, w: rw, h: rh })
  }, [])

  // ── Pan main map when clicking minimap ────────────────────────────────────
  const handleMinimapClick = useCallback((nx: number, ny: number) => {
    if (!svgRef.current || !zoomRef.current) return
    const el = svgRef.current
    const vw = el.clientWidth || W
    const vh = el.clientHeight || H
    const k = currentScaleRef.current
    // Convert normalized minimap click → SVG coords → translated transform
    const tx = vw / 2 - nx * W * k
    const ty = vh / 2 - ny * H * k
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .ease(d3.easeCubicOut)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(tx, ty).scale(k)
      )
  }, [])

  // ── Zoom to group ─────────────────────────────────────────────────────────
  const zoomToGroup = useCallback((groupId: string) => {
    if (!svgRef.current || !zoomRef.current) return
    const ids = SECTION_GROUPS[groupId] ?? []
    const group = sectionsRef.current.filter((s) => ids.includes(s.id))
    if (!group.length) return

    const minX = Math.min(...group.map((s) => s.minX ?? 0)) - 28
    const maxX = Math.max(...group.map((s) => s.maxX ?? 0)) + 28
    const minY = Math.min(...group.map((s) => s.minY ?? 0)) - 28
    const maxY = Math.max(...group.map((s) => s.maxY ?? 0)) + 28

    const el = svgRef.current
    const vw = el.clientWidth || W
    const vh = el.clientHeight || H
    const bw = maxX - minX,
      bh = maxY - minY
    const scale = Math.max(ZOOM_IN_SCALE, Math.min(vw / bw, vh / bh) * 0.82)
    const tx = vw / 2 - scale * (minX + bw / 2)
    const ty = vh / 2 - scale * (minY + bh / 2)

    setSeatsUnlocked(false)

    d3.select(svgRef.current)
      .transition()
      .duration(650)
      .ease(d3.easeCubicInOut)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(tx, ty).scale(scale)
      )
      .on("end", () => {
        d3.select(svgRef.current!)
          .selectAll<SVGCircleElement, GlobalSeat>("circle.seat")
          .style("pointer-events", "all")
        d3.select(svgRef.current!)
          .selectAll<SVGRectElement, HitZone>("rect.hit")
          .style("pointer-events", "none")
        setSeatsUnlocked(true)
      })

    setZoomedGroup(groupId)
    setHintDone(true)
  }, [])

  // ── Reset zoom ────────────────────────────────────────────────────────────
  const resetZoom = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current)
      .selectAll<SVGCircleElement, GlobalSeat>("circle.seat")
      .style("pointer-events", "none")
    d3.select(svgRef.current)
      .selectAll<SVGRectElement, HitZone>("rect.hit")
      .style("pointer-events", "all")
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .ease(d3.easeCubicInOut)
      .call(zoomRef.current.transform, INITIAL_TRANSFORM)
    setZoomedGroup(null)
    setSeatsUnlocked(false)
    setTooltip(null)
  }, [INITIAL_TRANSFORM])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    svg
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("width", "100%")
      .attr("height", "100%")
      .style("cursor", "grab")

    const root = svg.append("g").attr("class", "root")

    // Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 14])
      .on("zoom", (event) => {
        root.attr("transform", event.transform)
        currentScaleRef.current = event.transform.k
        updateMinimap(event.transform)

        // Hide microscopic seats on far zoom out to reveal clean macro sections
        root
          .select(".seat-layer")
          .style("opacity", event.transform.k < 2.5 ? 0.5 : 1)
        root
          .select(".check-layer")
          .style("opacity", event.transform.k < 2.5 ? 0.5 : 1)
      })

    zoomRef.current = zoom
    svg.call(zoom)

    // Apply immediate initial scale
    svg.call(zoom.transform, INITIAL_TRANSFORM)

    svg.on("dblclick.zoom", null)
    svg.on("dblclick", () => resetZoom())

    // Initial minimap state
    // updateMinimap(d3.zoomIdentity)

    // ── Block Backgrounds ──────────────────────────────────────────────────
    const blocksLayer = root.append("g").attr("class", "blocks-layer")

    BLOCK_BACKGROUNDS.forEach((b) => {
      const g = blocksLayer.append("g")

      if (b.rotate) {
        g.attr(
          "transform",
          `translate(${b.cx}, ${b.cy}) rotate(${b.rotate}) translate(${-b.cx}, ${-b.cy})`
        )
      }

      g.append("rect")
        .attr("class", "block-bg")
        .attr("x", b.x)
        .attr("y", b.y)
        .attr("width", b.w)
        .attr("height", b.h)
        .attr("rx", b.rx ?? b.rxTop ?? 4)
        .attr("fill", ACTIVE_THEME.block.fill)
        .attr("stroke", ACTIVE_THEME.block.stroke)
        .attr("stroke-width", ACTIVE_THEME.block.stroke === "none" ? 0 : 1.5)

      // .attr("fill", b.fill)
      // .style("fill-opacity", 0.08)
      // .attr("stroke", b.fill)
      // .attr("stroke-width", 1.5)

      if (b.text) {
        // the user requested to remove the D3 text code here so they can write it in JSX
      }
    })

    // ── Hit zones ────────────────────────────────────────────────────────────
    root
      .append("g")
      .attr("class", "hit-layer")
      .selectAll<SVGRectElement, HitZone>("rect.hit")
      .data(HIT_ZONES)
      .join("rect")
      .attr("class", "hit")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", (d) => d.w)
      .attr("height", (d) => d.h)
      .attr("transform", (d) =>
        d.rotate
          ? `translate(${d.cx}, ${d.cy}) rotate(${d.rotate}) translate(${-d.cx!}, ${-d.cy!})`
          : null
      )
      .attr("fill", "transparent")
      .attr("rx", 4)
      .style("cursor", "zoom-in")
      .on("pointerenter", function (event) {
        if (event.pointerType === "touch") return
        d3.select(this)
          .transition()
          .duration(120)
          .attr("fill", ACTIVE_THEME.block.hoverFill)
      })
      .on("pointermove", function (event, d) {
        if (currentScaleRef.current >= 1.5 || event.pointerType === "touch") {
          setBlockTooltip(null)
          return
        }
        const svgEl = svgRef.current!
        const svgBox = svgEl.getBoundingClientRect()
        setBlockTooltip({
          x: event.clientX - svgBox.left,
          y: event.clientY - svgBox.top,
          group: d.group,
        })
      })
      .on("pointerleave", function (event) {
        if (event.pointerType === "touch") return
        d3.select(this).transition().duration(120).attr("fill", "transparent")
        setBlockTooltip(null)
      })
      .on("click", (event, d) => {
        event.stopPropagation()
        setBlockTooltip(null)
        zoomToGroup(d.group)
      })

    // ── Seats ────────────────────────────────────────────────────────────────
    const allSeats = sectionsRef.current.flatMap((s) => s.seats)

    root
      .append("g")
      .attr("class", "seat-layer")
      .style("opacity", INITIAL_SCALE < 2.5 ? 0.5 : 1)
      .style("transition", "opacity 0.2s ease-in-out")
      .selectAll<SVGCircleElement, GlobalSeat>("circle.seat")
      .data(allSeats, (d) => d.id)
      .join("circle")
      .attr("class", "seat")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", SEAT_R)
      .attr("fill", (d) =>
        d.status === "available"
          ? d.color || ACTIVE_THEME.seat.availableFallback
          : ACTIVE_THEME.seat.sold
      )
      .style("pointer-events", "none")
      .style("cursor", (d) =>
        d.status === "available" ? "pointer" : "default"
      )
      .on("pointerenter", function (event, d) {
        if (d.status !== "available" || event.pointerType === "touch") return
        if (hideTooltipTimer.current) clearTimeout(hideTooltipTimer.current)
        d3.select(this)
          .raise()
          .transition()
          .duration(60)
          .attr("r", SEAT_R + 3)
          .attr("fill", ACTIVE_THEME.seat.hover)
        const svgEl = svgRef.current!
        const svgBox = svgEl.getBoundingClientRect()
        const pt = svgEl.createSVGPoint()
        pt.x = d.x
        pt.y = d.y
        const rootEl = svgEl.querySelector<SVGGElement>("g.root")!
        const screen = pt.matrixTransform(rootEl.getScreenCTM()!)
        setTooltip({
          x: screen.x - svgBox.left,
          y: screen.y - svgBox.top,
          seat: d,
        })
      })
      .on("pointerleave", function (event, d) {
        if (event.pointerType === "touch") return
        d3.select(this)
          .transition()
          .duration(60)
          .attr("r", SEAT_R)
          .attr("fill", () =>
            d.status !== "available"
              ? ACTIVE_THEME.seat.sold
              : selectedSeatIdsRef.current.has(d.id)
                ? ACTIVE_THEME.seat.selectedFill
                : d.color || ACTIVE_THEME.seat.availableFallback
          )
          .attr("stroke", () =>
            selectedSeatIdsRef.current.has(d.id)
              ? ACTIVE_THEME.seat.selectedStroke
              : "none"
          )
          .attr("stroke-width", () =>
            selectedSeatIdsRef.current.has(d.id) ? 1 : 0
          )
        hideTooltipTimer.current = setTimeout(() => setTooltip(null), 250)
      })
      .on("click", (event, d) => {
        event.stopPropagation()
        if (d.status !== "available") return
        toggleSeat(d.id)
      })

    return () => {
      svg.on(".zoom", null)
      svg.on("dblclick", null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Repaint seat colours reactively from global state ───────────────────
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    const root = svg.select("g.root")

    // Update Seat Circles
    svg
      .selectAll<SVGCircleElement, GlobalSeat>("circle.seat")
      .attr("fill", (d) =>
        d.status !== "available"
          ? ACTIVE_THEME.seat.sold
          : selectedSeatIds.has(d.id)
            ? ACTIVE_THEME.seat.selectedFill
            : d.color || ACTIVE_THEME.seat.availableFallback
      )
      .attr("stroke", (d) =>
        selectedSeatIds.has(d.id) ? ACTIVE_THEME.seat.selectedStroke : "none"
      )
      .attr("stroke-width", (d) => (selectedSeatIds.has(d.id) ? 1 : 0))

    // Animated Checkmarks Layer
    let checkLayer = root.select<SVGGElement>("g.check-layer")
    if (checkLayer.empty()) {
      checkLayer = root
        .append("g")
        .attr("class", "check-layer")
        .style("pointer-events", "none")
        .style("opacity", INITIAL_SCALE < 2.5 ? 0.5 : 1)
        .style("transition", "opacity 0.2s ease-in-out")
    }

    const allSeats = sectionsRef.current.flatMap((s) => s.seats)
    const activeSeats = allSeats.filter((s) => selectedSeatIds.has(s.id))

    checkLayer
      .selectAll<SVGPathElement, GlobalSeat>("path.check")
      .data(activeSeats, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "check")
            .attr("d", "M-1.5,0.5 L-0.5,1.5 L1.5,-1.5") // Tiny crisp checkmark
            .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
            .style("stroke", ACTIVE_THEME.seat.selectedStroke)
            .style("stroke-width", 1.5)
            .style("stroke-linecap", "round")
            .style("stroke-linejoin", "round")
            .style("fill", "none")
            .style("opacity", 0)
            .call((e) => e.transition().duration(200).style("opacity", 1)),
        (update) => update,
        (exit) => exit.transition().duration(200).style("opacity", 0).remove()
      )
  }, [selectedSeatIds])

  const zoomBy = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomRef.current.scaleBy, factor)
  }

  return (
    <div
      className="relative min-h-0 flex-1 overflow-hidden"
      style={{ touchAction: "none" }}
    >
      <svg
        ref={svgRef}
        className="h-full w-full outline-none"
        style={{ touchAction: "none", WebkitTapHighlightColor: "transparent" }}
      />

      <style>{`
        .dark .block-bg {
          fill: #27272a !important; /* zinc-800 */
          stroke: #3f3f46 !important; /* zinc-700 */
        }
        .dark .hit:hover {
          fill: rgba(255,255,255,0.06) !important;
        }
        .dark .seat-layer circle.seat[fill="#dededf"] {
          fill: #3f3f46 !important; /* Make sold seats dark compatible */
        }
      `}</style>

      <AnimatePresence>
        {blockTooltip && !zoomedGroup && (
          <motion.div
            key="block-tooltip"
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 2 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-[calc(100%+16px)] transform drop-shadow-xl transition-all duration-75 ease-out"
            style={{ left: blockTooltip.x, top: blockTooltip.y }}
          >
            <div className="flex flex-col items-center justify-center rounded-xl bg-white px-5 py-3 shadow-lg ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
              <span className="mb-0.5 text-[10px] font-bold tracking-widest text-[#a1a1aa] dark:text-zinc-400">
                SECTION
              </span>
              <span className="text-[20px] leading-none font-black text-[#18181b] dark:text-white">
                {blockTooltip.group}
              </span>
              {selectedSeatsInHoveredBlock > 0 ? (
                <div className="mt-2.5 flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1 text-green-700 ring-1 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 shadow-sm" />
                  <span className="text-[11px] font-bold tracking-wide">
                    {selectedSeatsInHoveredBlock} SELECTED
                  </span>
                </div>
              ) : (
                <span className="mt-2 text-[10px] font-semibold text-[#3b82f6] dark:text-blue-400">
                  Click to explore
                </span>
              )}
            </div>
          </motion.div>
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
              hideTooltipTimer.current = setTimeout(() => setTooltip(null), 250)
            }}
          />
        )}

        {zoomedGroup && (
          <motion.button
            key="back-button"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={resetZoom}
            className="absolute top-6 left-6 flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-bold text-[#18181b] shadow-xl ring-1 ring-black/5 transition hover:bg-gray-50 focus:outline-none dark:bg-zinc-900 dark:text-white dark:ring-white/10 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Stadium
          </motion.button>
        )}
      </AnimatePresence>

      <div className="absolute right-6 bottom-6 flex flex-col gap-2">
        <button
          onClick={() => zoomBy(1.5)}
          className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-white text-gray-700 shadow-md ring-1 ring-black/5 transition hover:bg-gray-50 focus:outline-none dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/10 dark:hover:bg-zinc-800"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          onClick={() => zoomBy(0.667)}
          className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-white text-gray-700 shadow-md ring-1 ring-black/5 transition hover:bg-gray-50 focus:outline-none dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/10 dark:hover:bg-zinc-800"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          onClick={resetZoom}
          className="mt-2 flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-white text-gray-700 shadow-md ring-1 ring-black/5 transition hover:bg-gray-50 focus:outline-none dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/10 dark:hover:bg-zinc-800"
          title="Reset View"
        >
          <Maximize className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

{
  /* <Minimap
          viewRect={viewRect}
          sections={sectionsRef.current}
          selectedSeats={selectedSeats}
          onClickMinimap={handleMinimapClick}
        /> */
}
