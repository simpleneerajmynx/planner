import { HitZone, Section } from "./types"
import { Seat as GlobalSeat } from "@/types/seat"

export const SEAT_R = 3.5 // radius of the seat circle
export const SEAT_GAP = 12 // gap between seats
export const W = 960 // SVG viewBox width
export const H = 1040 // making it taller to fit all rings
export const MINIMAP_W = 160
export const MINIMAP_H = 160
export const ZOOM_IN_SCALE = 3.5

export interface StadiumTheme {
  background: string
  block: {
    fill: string
    stroke: string
    hoverFill: string
  }
  seat: {
    availableFallback: string
    sold: string
    hover: string
    selectedFill: string
    selectedStroke: string
  }
  tooltip: {
    selectedBg: string
    availableBg: string
    textPrimary: string
  }
}

export const DEFAULT_THEME: StadiumTheme = {
  background: "transparent",
  block: {
    fill: "#ffffff",
    stroke: "#cbd5e1",
    hoverFill: "rgba(0,0,0,0.06)",
  },
  seat: {
    availableFallback: "#2a2a2a",
    sold: "#dededf",
    hover: "#f59e0b",
    selectedFill: "#ecfccb",
    selectedStroke: "#3f6212",
  },
  tooltip: {
    // selectedBg: "#ff5252",
    selectedBg: "#24A846",
    availableBg: "#3b82f6",
    textPrimary: "#18181b",
  },
}

export const sparseSold = (density: number) => (r: number, c: number) =>
  (r * 7 + c * 13 + r * c * 3) % 17 < density

export function addBounds(sec: Section): Section {
  const xs = sec.seats.map((s) => s.x)
  const ys = sec.seats.map((s) => s.y)
  return {
    ...sec,
    minX: Math.min(...xs) - SEAT_R,
    maxX: Math.max(...xs) + SEAT_R,
    minY: Math.min(...ys) - SEAT_R,
    maxY: Math.max(...ys) + SEAT_R,
  }
}

export function makeGrid(
  id: string,
  label: string,
  ox: number,
  oy: number,
  rows: number,
  cols: number,
  sold: (r: number, c: number) => boolean,
  price: number,
  color: string
): Section {
  const seats: GlobalSeat[] = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      seats.push({
        id: `${id}-${r}-${c}`,
        row: r.toString(),
        number: c,
        x: ox + c * SEAT_GAP,
        y: oy + r * SEAT_GAP,
        status: !sold(r, c) ? "available" : "taken",
        category: "lower",
        section: id,
        price,
        color,
      })
  return addBounds({ id, label, seats })
}

export const BLOCK_BACKGROUNDS: any[] = []
export const SECTION_LABELS: any[] = []
export const HIT_ZONES: HitZone[] = []
export const PANEL_BACKGROUNDS: any[] = [] // keeping for fallback or replace with blocks
export const SECTION_GROUPS: Record<string, string[]> = {}

export function makeRotatedGrid(
  id: string,
  label: string,
  cx: number,
  cy: number,
  rows: number,
  cols: number,
  angleDeg: number,
  yOffset: number,
  sold: (r: number, c: number) => boolean,
  price: number,
  color: string
): Section {
  const seats: GlobalSeat[] = []
  const rad = (angleDeg * Math.PI) / 180
  const leftX = cx - ((cols - 1) * SEAT_GAP) / 2
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lx = leftX + c * SEAT_GAP - cx
      const ly = yOffset + r * SEAT_GAP
      const x = cx + lx * Math.cos(rad) - ly * Math.sin(rad)
      const y = cy + lx * Math.sin(rad) + ly * Math.cos(rad)
      seats.push({
        id: `${id}-${r}-${c}`,
        row: r.toString(),
        number: c,
        x,
        y,
        status: !sold(r, c) ? "available" : "taken",
        category: "lower",
        section: id,
        price,
        color,
      })
    }
  }
  return addBounds({ id, label, seats })
}

export type StadiumLayoutType = "capsule" | "colosseum" | "rectangular"

export interface TierConfig {
  id: string
  price: number
  color: string
  rows?: number
  r?: number // Inner radius for curved layouts

  // For capsule
  curveBlocks?: number
  blockCols?: number

  // For colosseum
  cols?: number
  count?: number

  // For rectangular
  wCols?: number
  hRows?: number
  thick?: number
}

export interface StadiumConfig {
  type: StadiumLayoutType
  pitch: { w: number; h: number }
  straightCols?: number // for capsule
  tiers: TierConfig[]
  theme?: Partial<StadiumTheme>
}

export const CAPSULE_CONFIG: StadiumConfig = {
  type: "capsule",
  pitch: { w: 240 * 2, h: 240 },
  straightCols: 28,
  tiers: [
    {
      id: "100",
      r: 160,
      rows: 6,
      curveBlocks: 6,
      blockCols: 5,
      price: 150,
      color: "#38bdf8",
    },
    {
      id: "200",
      r: 250,
      rows: 8,
      curveBlocks: 8,
      blockCols: 6,
      price: 80,
      color: "#fbbf24",
    },
    {
      id: "300",
      r: 360,
      rows: 10,
      curveBlocks: 10,
      blockCols: 7,
      price: 50,
      color: "#94a3b8",
    },
  ],
}

export const COLOSSEUM_CONFIG: StadiumConfig = {
  type: "colosseum",
  pitch: { w: 160, h: 110 },
  tiers: [
    {
      id: "100",
      r: 170,
      rows: 3,
      cols: 6,
      count: 12,
      price: 150,
      color: "#38bdf8",
    },
    {
      id: "200",
      r: 232,
      rows: 5,
      cols: 6,
      count: 16,
      price: 80,
      color: "#fbbf24",
    },
    {
      id: "300",
      r: 318,
      rows: 5,
      cols: 7,
      count: 20,
      price: 50,
      color: "#94a3b8",
    },
  ],
}

export const RECTANGULAR_CONFIG: StadiumConfig = {
  type: "rectangular",
  pitch: { w: 240, h: 140 },
  tiers: [
    { id: "100", wCols: 20, hRows: 12, thick: 5, price: 150, color: "#38bdf8" },
    { id: "200", wCols: 36, hRows: 28, thick: 7, price: 80, color: "#fbbf24" },
    { id: "300", wCols: 56, hRows: 48, thick: 8, price: 50, color: "#94a3b8" },
  ],
}

// Change this to rapidly switch between the 3 stadium layouts!
export const ACTIVE_CONFIG = CAPSULE_CONFIG

export const ACTIVE_THEME: StadiumTheme = {
  ...DEFAULT_THEME,
  ...(ACTIVE_CONFIG.theme || {}),
}

export function buildSections(
  config: StadiumConfig = ACTIVE_CONFIG
): Section[] {
  BLOCK_BACKGROUNDS.length = 0
  SECTION_LABELS.length = 0
  HIT_ZONES.length = 0

  const s: Section[] = []

  const PADDING = 14
  const SEAT_GAP = 12

  const STADIUM_CX = W / 2
  const STADIUM_CY = H / 2

  // Pitch matching reference image
  // BLOCK_BACKGROUNDS.push({
  //   type: "pitch",
  //   x: STADIUM_CX - config.pitch.w / 2,
  //   y: STADIUM_CY - config.pitch.h / 2,
  //   w: config.pitch.w,
  //   h: config.pitch.h,
  //   rx: 8,
  //   fill: "#4ade80",
  // })

  function pushRotatedBlock(
    id: string,
    cx: number,
    cy: number,
    radius: number,
    angle: number,
    rows: number,
    cols: number,
    price: number,
    color: string
  ) {
    SECTION_GROUPS[id] = [id]
    const width = (cols - 1) * SEAT_GAP + 28
    const height = (rows - 1) * SEAT_GAP + 28
    const x = cx - width / 2
    const y = cy + radius

    BLOCK_BACKGROUNDS.push({
      type: id,
      x,
      y,
      w: width,
      h: height,
      rx: 6,
      fill: "#ffffff",
      rotate: angle,
      cx,
      cy,
    })

    s.push(
      makeRotatedGrid(
        id,
        "",
        cx,
        cy,
        rows,
        cols,
        angle,
        radius + PADDING,
        sparseSold(4),
        price,
        color
      )
    )
    HIT_ZONES.push({
      group: id,
      x,
      y,
      w: width,
      h: height,
      rotate: angle,
      cx,
      cy,
    })
  }

  function pushStraightBlock(
    id: string,
    cx: number,
    cy: number,
    cols: number,
    rows: number,
    price: number,
    color: string
  ) {
    const w = (cols - 1) * SEAT_GAP + 28
    const h = (rows - 1) * SEAT_GAP + 28
    const x = cx - w / 2
    const y = cy - h / 2

    BLOCK_BACKGROUNDS.push({ type: id, x, y, w, h, rx: 6, fill: "#ffffff" })
    SECTION_GROUPS[id] = [id]
    s.push(
      makeGrid(
        id,
        "",
        x + PADDING,
        y + PADDING,
        rows,
        cols,
        sparseSold(5),
        price,
        color
      )
    )
    HIT_ZONES.push({ group: id, x, y, w, h })
  }

  /**
   * Layout Factory: Based on user's config
   */
  if (config.type === "capsule") {
    const straightCols = config.straightCols || 22
    const seatWidth = (straightCols - 1) * SEAT_GAP
    const CX_L = STADIUM_CX - seatWidth / 2
    const CX_R = STADIUM_CX + seatWidth / 2

    for (const tier of config.tiers) {
      pushRotatedBlock(
        `T${tier.id}_N`,
        STADIUM_CX,
        STADIUM_CY,
        tier.r!,
        180,
        tier.rows!,
        straightCols,
        tier.price,
        tier.color
      )
      pushRotatedBlock(
        `T${tier.id}_S`,
        STADIUM_CX,
        STADIUM_CY,
        tier.r!,
        0,
        tier.rows!,
        straightCols,
        tier.price,
        tier.color
      )

      const arcStep = 180 / tier.curveBlocks!
      for (let i = 0; i < tier.curveBlocks!; i++) {
        const angleW = 180 - arcStep * (i + 0.5)
        pushRotatedBlock(
          `T${tier.id}_W_${i}`,
          CX_L,
          STADIUM_CY,
          tier.r!,
          angleW,
          tier.rows!,
          tier.blockCols!,
          tier.price,
          tier.color
        )

        const angleE = -arcStep * (i + 0.5)
        pushRotatedBlock(
          `T${tier.id}_E_${i}`,
          CX_R,
          STADIUM_CY,
          tier.r!,
          angleE,
          tier.rows!,
          tier.blockCols!,
          tier.price,
          tier.color
        )
      }
    }
  } else if (config.type === "colosseum") {
    for (const tier of config.tiers) {
      const angleStep = 360 / tier.count!
      for (let i = 0; i < tier.count!; i++) {
        pushRotatedBlock(
          `T${tier.id}_S${i + 1}`,
          STADIUM_CX,
          STADIUM_CY,
          tier.r!,
          i * angleStep,
          tier.rows!,
          tier.cols!,
          tier.price,
          tier.color
        )
      }
    }
  } else if (config.type === "rectangular") {
    const A = 8
    for (const tier of config.tiers) {
      const innerW = (tier.wCols! - 1) * SEAT_GAP + 28
      const innerH = (tier.hRows! - 1) * SEAT_GAP + 28
      const thickSize = (tier.thick! - 1) * SEAT_GAP + 28

      const distX = innerW / 2 + A + thickSize / 2
      const distY = innerH / 2 + A + thickSize / 2

      pushStraightBlock(
        `T${tier.id}_N`,
        STADIUM_CX,
        STADIUM_CY - distY,
        tier.wCols!,
        tier.thick!,
        tier.price,
        tier.color
      )
      pushStraightBlock(
        `T${tier.id}_S`,
        STADIUM_CX,
        STADIUM_CY + distY,
        tier.wCols!,
        tier.thick!,
        tier.price,
        tier.color
      )
      pushStraightBlock(
        `T${tier.id}_W`,
        STADIUM_CX - distX,
        STADIUM_CY,
        tier.thick!,
        tier.hRows!,
        tier.price,
        tier.color
      )
      pushStraightBlock(
        `T${tier.id}_E`,
        STADIUM_CX + distX,
        STADIUM_CY,
        tier.thick!,
        tier.hRows!,
        tier.price,
        tier.color
      )

      pushStraightBlock(
        `T${tier.id}_NW`,
        STADIUM_CX - distX,
        STADIUM_CY - distY,
        tier.thick!,
        tier.thick!,
        tier.price,
        tier.color
      )
      pushStraightBlock(
        `T${tier.id}_NE`,
        STADIUM_CX + distX,
        STADIUM_CY - distY,
        tier.thick!,
        tier.thick!,
        tier.price,
        tier.color
      )
      pushStraightBlock(
        `T${tier.id}_SW`,
        STADIUM_CX - distX,
        STADIUM_CY + distY,
        tier.thick!,
        tier.thick!,
        tier.price,
        tier.color
      )
      pushStraightBlock(
        `T${tier.id}_SE`,
        STADIUM_CX + distX,
        STADIUM_CY + distY,
        tier.thick!,
        tier.thick!,
        tier.price,
        tier.color
      )
    }
  }

  return s
}
