import { Seat, CATEGORY_PRICES } from "@/types/seat"

export const VIRTUAL_W = 1200
export const VIRTUAL_H = 820

export const SEAT_R = 4
export const SEAT_GAP = 3
export const SEAT_STEP = SEAT_R * 2 + SEAT_GAP // 11px

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}
function isTaken(id: string) {
  return hash(id) % 100 < 38
}
const RL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

function mkSeat(
  section: string,
  cat: Seat["category"],
  row: string,
  num: number,
  x: number,
  y: number,
  price?: number
): Seat {
  const id = `${section}-${row}-${num}`
  return {
    id,
    section,
    row,
    number: num,
    x: Math.round(x),
    y: Math.round(y),
    status: isTaken(id) ? "taken" : "available",
    price: price ?? CATEGORY_PRICES[cat],
    category: cat,
  }
}

/** Rectangular grid block */
function block(
  section: string,
  cat: Seat["category"],
  x0: number,
  y0: number,
  rows: number,
  cols: number,
  sx = SEAT_STEP,
  sy = SEAT_STEP
): Seat[] {
  const out: Seat[] = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      out.push(mkSeat(section, cat, RL[r], c + 1, x0 + c * sx, y0 + r * sy))
  return out
}

/**
 * Arc section — concentric rows of seats along circular arcs.
 * Minimum seat spacing is enforced: seats are placed only if they are
 * at least SEAT_STEP apart, preventing visual overlap even at small radii.
 */
function arcBlock(
  section: string,
  cat: Seat["category"],
  cx: number,
  cy: number,
  rFirst: number,
  rStep: number,
  aDeg0: number,
  aDeg1: number,
  numRows: number
): Seat[] {
  const out: Seat[] = []
  for (let r = 0; r < numRows; r++) {
    const radius = rFirst + r * rStep
    // Compute cols from arc length ensuring minimum SEAT_STEP spacing
    const arcLen = Math.abs(aDeg1 - aDeg0) * (Math.PI / 180) * radius
    const cols = Math.max(2, Math.floor(arcLen / SEAT_STEP))
    for (let c = 0; c < cols; c++) {
      const a = (aDeg0 + ((aDeg1 - aDeg0) * c) / (cols - 1)) * (Math.PI / 180)
      out.push(
        mkSeat(
          section,
          cat,
          RL[r],
          c + 1,
          cx + radius * Math.cos(a),
          cy + radius * Math.sin(a)
        )
      )
    }
  }
  return out
}

export function generateStadiumSeats(): Seat[] {
  const S: Seat[] = []
  const T = SEAT_STEP

  const CX = 600
  const TOP_Y = 130

  // ── FLOOR PIT ──────────────────────────────────────────────────────────────
  const PIT_COLS = 7
  const PIT_ROWS = 24
  const PIT_GAP = 8
  const PIT_L_X0 = CX - PIT_COLS * T - PIT_GAP / 2
  const PIT_R_X0 = CX + PIT_GAP / 2

  S.push(...block("FL-L", "floor", PIT_L_X0, TOP_Y, PIT_ROWS, PIT_COLS))
  S.push(...block("FL-R", "floor", PIT_R_X0, TOP_Y, PIT_ROWS, PIT_COLS))

  const PIT_BOT_Y = TOP_Y + PIT_ROWS * T

  // ── LOWER BOWL ─────────────────────────────────────────────────────────────
  const LB_COLS = 8
  const LB_ROWS = PIT_ROWS
  const LB_AISLE = 10
  const LB_L_X0 = PIT_L_X0 - LB_COLS * T - LB_AISLE
  const LB_R_X0 = PIT_R_X0 + PIT_COLS * T + LB_AISLE

  S.push(...block("LB-L", "lower", LB_L_X0, TOP_Y, LB_ROWS, LB_COLS))
  S.push(...block("LB-R", "lower", LB_R_X0, TOP_Y, LB_ROWS, LB_COLS))

  // ── SECTION 216 / 201 ──────────────────────────────────────────────────────
  const S216_COLS = 6
  const S216_ROWS1 = 16
  const S216_ROWS2 = 12
  const S216_AISLE = 14
  const INNER_AISLE = 18

  const S216_X0 = LB_L_X0 - S216_COLS * T - S216_AISLE
  const S201_X0 = LB_R_X0 + LB_COLS * T + S216_AISLE

  S.push(...block("216", "lower", S216_X0, TOP_Y, S216_ROWS1, S216_COLS))
  S.push(...block("201", "lower", S201_X0, TOP_Y, S216_ROWS1, S216_COLS))

  const LOWER_HALF_Y = TOP_Y + S216_ROWS1 * T + INNER_AISLE
  S.push(...block("215", "lower", S216_X0, LOWER_HALF_Y, S216_ROWS2, S216_COLS))
  S.push(...block("202", "lower", S201_X0, LOWER_HALF_Y, S216_ROWS2, S216_COLS))

  // ── SECTION 315 / 301 ──────────────────────────────────────────────────────
  const S315_COLS = 9
  const S315_ROWS1 = 16
  const S315_ROWS2 = 12
  const S315_AISLE_H = 20
  const S315_GAP = 16
  const S315_SX = 11
  const S315_X0 = S216_X0 - S315_COLS * S315_SX - S315_GAP
  const S301_X0 = S201_X0 + S216_COLS * T + S315_GAP

  S.push(
    ...block(
      "315-T",
      "upper",
      S315_X0,
      TOP_Y,
      S315_ROWS1,
      S315_COLS,
      S315_SX,
      T
    )
  )
  S.push(
    ...block(
      "301-T",
      "upper",
      S301_X0,
      TOP_Y,
      S315_ROWS1,
      S315_COLS,
      S315_SX,
      T
    )
  )

  const S315_BOT_Y = TOP_Y + S315_ROWS1 * T + S315_AISLE_H
  S.push(
    ...block(
      "315-B",
      "upper",
      S315_X0,
      S315_BOT_Y,
      S315_ROWS2,
      S315_COLS,
      S315_SX,
      T
    )
  )
  S.push(
    ...block(
      "301-B",
      "upper",
      S301_X0,
      S315_BOT_Y,
      S315_ROWS2,
      S315_COLS,
      S315_SX,
      T
    )
  )

  // ── BALCONY — fan arcs ─────────────────────────────────────────────────────
  //
  // FIX: Each fan group now has its own distinct origin point, spread
  // horizontally so their arcs don't overlap each other.
  // rFirst is increased so inner-row seats are spaced apart from the origin.
  // Angle ranges are adjusted to keep sections visually distinct.
  //
  // Arc origins are placed BELOW PIT_BOT_Y so no arc overlaps rectangular sections.

  const ARC_BASE_Y = PIT_BOT_Y + 30

  // ── Left pit fan — origin under left half of pit ──
  // Sweeps leftward and downward
  const FAN_L_CX = PIT_L_X0 + (PIT_COLS * T) / 2 // ~545
  const FAN_L_CY = ARC_BASE_Y

  S.push(
    ...arcBlock("BAL-FL1", "balcony", FAN_L_CX, FAN_L_CY, 55, 16, 148, 215, 4)
  )
  S.push(
    ...arcBlock("BAL-FL2", "balcony", FAN_L_CX, FAN_L_CY, 115, 17, 140, 222, 3)
  )
  S.push(
    ...arcBlock("BAL-FL3", "balcony", FAN_L_CX, FAN_L_CY, 170, 18, 133, 228, 2)
  )

  // ── Right pit fan — origin under right half of pit ──
  // Sweeps rightward and downward
  const FAN_R_CX = PIT_R_X0 + (PIT_COLS * T) / 2 // ~655
  const FAN_R_CY = ARC_BASE_Y

  S.push(
    ...arcBlock("BAL-FR1", "balcony", FAN_R_CX, FAN_R_CY, 55, 16, 325, 392, 4)
  )
  S.push(
    ...arcBlock("BAL-FR2", "balcony", FAN_R_CX, FAN_R_CY, 115, 17, 318, 400, 3)
  )
  S.push(
    ...arcBlock("BAL-FR3", "balcony", FAN_R_CX, FAN_R_CY, 170, 18, 312, 407, 2)
  )

  // ── Centre bottom arcs — origin at horizontal centre, below pit ──
  // Three named sections sweeping across the bottom
  // rFirst is large enough that seats clear the fan arcs above
  const BAL_CX = CX // 600
  const BAL_CY = ARC_BASE_Y

  // Inner ring — three segments: left-centre, centre, right-centre
  S.push(
    ...arcBlock("BAL-BCL", "balcony", BAL_CX, BAL_CY, 100, 16, 196, 246, 4)
  )
  S.push(
    ...arcBlock("BAL-BCC", "balcony", BAL_CX, BAL_CY, 100, 16, 248, 292, 4)
  )
  S.push(
    ...arcBlock("BAL-BCR", "balcony", BAL_CX, BAL_CY, 100, 16, 294, 344, 4)
  )

  // Outer ring — slightly wider arcs, 3 more rows
  S.push(...arcBlock("BAL-OL", "balcony", BAL_CX, BAL_CY, 170, 17, 192, 252, 3))
  S.push(...arcBlock("BAL-OC", "balcony", BAL_CX, BAL_CY, 170, 17, 254, 286, 3))
  S.push(...arcBlock("BAL-OR", "balcony", BAL_CX, BAL_CY, 170, 17, 288, 348, 3))

  // ── VIP: front row of pit ─────────────────────────────────────────────────
  S.forEach((s) => {
    if (
      (s.section === "FL-L" || s.section === "FL-R") &&
      s.row === "A" &&
      s.status !== "taken"
    ) {
      s.status = "vip"
      s.price = 450
    }
  })

  return S
}
