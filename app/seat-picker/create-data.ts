import { Section } from "./types"
import { Seat as GlobalSeat } from "@/types/seat"
import {
  W,
  H,
  SEAT_R,
  SEAT_GAP,
  ACTIVE_CONFIG,
  StadiumConfig,
  SectionData,
  SECTION_GROUPS,
  BLOCK_BACKGROUNDS,
  HIT_ZONES,
  SECTION_LABELS,
} from "./config"

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
  color: string,
  isCurved: boolean = false,
  angleSpan?: number
): Section {
  const seats: GlobalSeat[] = []
  const rad = (angleDeg * Math.PI) / 180

  for (let r = 0; r < rows; r++) {
    const ly = yOffset + r * SEAT_GAP
    let rCols = cols

    if (isCurved && angleSpan != null) {
      const rowArcLen = ly * ((angleSpan * Math.PI) / 180)
      const gap = 32 // prominent aisle gap
      rCols = Math.max(1, Math.floor((rowArcLen - gap) / SEAT_GAP) + 1)
    }

    const leftX = cx - ((rCols - 1) * SEAT_GAP) / 2

    for (let c = 0; c < rCols; c++) {
      const lx = leftX + c * SEAT_GAP - cx
      let finalLx = lx
      let finalLy = ly

      if (isCurved) {
        // Map local X to an arc angle along radius `ly`
        const theta = lx / ly
        finalLx = ly * Math.sin(theta)
        finalLy = ly * Math.cos(theta)
      }

      const x = cx + finalLx * Math.cos(rad) - finalLy * Math.sin(rad)
      const y = cy + finalLx * Math.sin(rad) + finalLy * Math.cos(rad)
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

export function generateLayoutData(
  config: StadiumConfig = ACTIVE_CONFIG
): SectionData[] {
  const s: SectionData[] = []

  const SEAT_GAP = 12
  const STADIUM_CX = W / 2
  const STADIUM_CY = H / 2

  if (config.type === "capsule") {
    const straightCols = config.straightCols || 22
    const seatWidth = (straightCols - 1) * SEAT_GAP
    const CX_L = STADIUM_CX - seatWidth / 2
    const CX_R = STADIUM_CX + seatWidth / 2

    const straightBlocks = 2 // split straight sections into distinct blocks
    const blockSpan = seatWidth / straightBlocks

    for (const tier of config.tiers) {
      for (let j = 0; j < straightBlocks; j++) {
        const blockCX = CX_L + blockSpan * (j + 0.5)
        const cols = Math.max(1, Math.floor((blockSpan - 28) / SEAT_GAP) + 1)

        s.push({
          id: `T${tier.id}_N_${j}`,
          cx: blockCX,
          cy: STADIUM_CY,
          radius: tier.r!,
          angle: 180,
          rows: tier.rows!,
          cols,
          price: tier.price,
          color: tier.color,
        })
        s.push({
          id: `T${tier.id}_S_${j}`,
          cx: blockCX,
          cy: STADIUM_CY,
          radius: tier.r!,
          angle: 0,
          rows: tier.rows!,
          cols,
          price: tier.price,
          color: tier.color,
        })
      }

      const arcStep = 180 / tier.curveBlocks!
      for (let i = 0; i < tier.curveBlocks!; i++) {
        const angleW = 180 - arcStep * (i + 0.5)
        s.push({
          id: `T${tier.id}_W_${i}`,
          cx: CX_L,
          cy: STADIUM_CY,
          radius: tier.r!,
          angle: angleW,
          rows: tier.rows!,
          cols: tier.blockCols!,
          price: tier.price,
          color: tier.color,
          isCurved: true,
          angleSpan: arcStep,
        })

        const angleE = -arcStep * (i + 0.5)
        s.push({
          id: `T${tier.id}_E_${i}`,
          cx: CX_R,
          cy: STADIUM_CY,
          radius: tier.r!,
          angle: angleE,
          rows: tier.rows!,
          cols: tier.blockCols!,
          price: tier.price,
          color: tier.color,
          isCurved: true,
          angleSpan: arcStep,
        })
      }
    }
  } else if (config.type === "colosseum") {
    for (const tier of config.tiers) {
      const angleStep = 360 / tier.count!
      for (let i = 0; i < tier.count!; i++) {
        s.push({
          id: `T${tier.id}_S${i + 1}`,
          cx: STADIUM_CX,
          cy: STADIUM_CY,
          radius: tier.r!,
          angle: i * angleStep,
          rows: tier.rows!,
          cols: tier.cols!,
          price: tier.price,
          color: tier.color,
          isCurved: true,
          angleSpan: angleStep,
        })
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

      s.push({
        id: `T${tier.id}_N`,
        isCartesian: true,
        cx: STADIUM_CX,
        cy: STADIUM_CY - distY,
        cols: tier.wCols!,
        rows: tier.thick!,
        price: tier.price,
        color: tier.color,
      })
      s.push({
        id: `T${tier.id}_S`,
        isCartesian: true,
        cx: STADIUM_CX,
        cy: STADIUM_CY + distY,
        cols: tier.wCols!,
        rows: tier.thick!,
        price: tier.price,
        color: tier.color,
      })
      s.push({
        id: `T${tier.id}_W`,
        isCartesian: true,
        cx: STADIUM_CX - distX,
        cy: STADIUM_CY,
        cols: tier.thick!,
        rows: tier.hRows!,
        price: tier.price,
        color: tier.color,
      })
      s.push({
        id: `T${tier.id}_E`,
        isCartesian: true,
        cx: STADIUM_CX + distX,
        cy: STADIUM_CY,
        cols: tier.thick!,
        rows: tier.hRows!,
        price: tier.price,
        color: tier.color,
      })

      s.push({
        id: `T${tier.id}_NW`,
        isCartesian: true,
        cx: STADIUM_CX - distX,
        cy: STADIUM_CY - distY,
        cols: tier.thick!,
        rows: tier.thick!,
        price: tier.price,
        color: tier.color,
      })
      s.push({
        id: `T${tier.id}_NE`,
        isCartesian: true,
        cx: STADIUM_CX + distX,
        cy: STADIUM_CY - distY,
        cols: tier.thick!,
        rows: tier.thick!,
        price: tier.price,
        color: tier.color,
      })
      s.push({
        id: `T${tier.id}_SW`,
        isCartesian: true,
        cx: STADIUM_CX - distX,
        cy: STADIUM_CY + distY,
        cols: tier.thick!,
        rows: tier.thick!,
        price: tier.price,
        color: tier.color,
      })
      s.push({
        id: `T${tier.id}_SE`,
        isCartesian: true,
        cx: STADIUM_CX + distX,
        cy: STADIUM_CY + distY,
        cols: tier.thick!,
        rows: tier.thick!,
        price: tier.price,
        color: tier.color,
      })
    }
  }

  return s
}

export function buildSections(
  config: StadiumConfig = ACTIVE_CONFIG
): Section[] {
  BLOCK_BACKGROUNDS.length = 0
  SECTION_LABELS.length = 0
  HIT_ZONES.length = 0

  const sectionsList: Section[] = []

  const PADDING = 14
  const SEAT_GAP = 12

  let rawData = generateLayoutData(config)

  if (config.hiddenBlocks) {
    rawData = rawData.filter((d) => !config.hiddenBlocks!.includes(d.id))
  }

  if (config.overrides) {
    rawData = rawData.map((d) => ({ ...d, ...(config.overrides![d.id] || {}) }))
  }

  rawData.forEach((d) => {
    SECTION_GROUPS[d.id] = [d.id]

    if (d.isCartesian) {
      const w = (d.cols! - 1) * SEAT_GAP + 28
      const h = (d.rows - 1) * SEAT_GAP + 28
      const x = d.cx! - w / 2
      const y = d.cy! - h / 2

      BLOCK_BACKGROUNDS.push({ type: d.id, x, y, w, h, rx: 6, fill: "#ffffff" })
      sectionsList.push(
        makeGrid(
          d.id,
          "",
          x + PADDING,
          y + PADDING,
          d.rows,
          d.cols!,
          sparseSold(5),
          d.price,
          d.color
        )
      )
      HIT_ZONES.push({ group: d.id, x, y, w, h })
    } else {
      const height = (d.rows - 1) * SEAT_GAP + 28
      const radius = d.radius!
      const cx = d.cx!
      const cy = d.cy!
      const angle = d.angle!
      const isCurved = d.isCurved || false
      const angleSpan = d.angleSpan

      let path: string | undefined
      if (isCurved && angleSpan != null) {
        const rIn = radius
        const rOut = radius + height
        const gapRad = 12 / radius
        const a = Math.max(0.02, (angleSpan * Math.PI) / 180 - gapRad)
        const halfA = a / 2

        const x1 = cx + rIn * Math.sin(-halfA),
          y1 = cy + rIn * Math.cos(-halfA)
        const x2 = cx + rOut * Math.sin(-halfA),
          y2 = cy + rOut * Math.cos(-halfA)
        const x3 = cx + rOut * Math.sin(halfA),
          y3 = cy + rOut * Math.cos(halfA)
        const x4 = cx + rIn * Math.sin(halfA),
          y4 = cy + rIn * Math.cos(halfA)

        path = `M ${x1} ${y1} L ${x2} ${y2} A ${rOut} ${rOut} 0 0 0 ${x3} ${y3} L ${x4} ${y4} A ${rIn} ${rIn} 0 0 1 ${x1} ${y1} Z`
      }

      const cols = d.cols || 1
      const width = (cols - 1) * SEAT_GAP + 28
      const x = cx - width / 2
      const y = cy + radius

      BLOCK_BACKGROUNDS.push({
        type: d.id,
        x,
        y,
        w: width,
        h: height,
        rx: 6,
        fill: "#ffffff",
        rotate: angle,
        cx,
        cy,
        path,
      })

      sectionsList.push(
        makeRotatedGrid(
          d.id,
          "",
          cx,
          cy,
          d.rows,
          cols,
          angle,
          radius + PADDING,
          sparseSold(4),
          d.price,
          d.color,
          isCurved,
          angleSpan
        )
      )
      HIT_ZONES.push({
        group: d.id,
        x,
        y,
        w: width,
        h: height,
        rotate: angle,
        cx,
        cy,
        path,
      })
    }
  })

  return sectionsList
}
