import { HitZone } from "./types"

export const SEAT_R = 4
export const SEAT_GAP = 12
export const W = 960
export const H = 1040
export const MINIMAP_W = 160
export const MINIMAP_H = 160
export const ZOOM_IN_SCALE = 3.5

export const HIT_ZONES: HitZone[] = []
export const BLOCK_BACKGROUNDS: any[] = []
export const SECTION_GROUPS: Record<string, string[]> = {}
export const SECTION_LABELS: any[] = []

export const ZOOM_BREAKPOINTS = {
  /** First click on a block zooms to this static scale */
  MACRO_ZOOM: 1.5,
  /** Map scale above which the block's colorful fill fades away, section text fades out, and individual seats reach full opacity */
  TRANSITION_ZOOM: 1.5,
  /** Second click on a block zooms to this static scale, unlocking individual tactile seat selection */
  MICRO_ZOOM: 3,
}

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
    selectedBg: "#24A846",
    availableBg: "#3b82f6",
    textPrimary: "#18181b",
  },
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

export interface SectionData {
  id: string
  rows: number
  price: number
  color: string

  cx?: number
  cy?: number
  radius?: number
  angle?: number

  cols?: number
  isCurved?: boolean
  angleSpan?: number

  isCartesian?: boolean
}

export interface StadiumConfig {
  type: StadiumLayoutType
  pitch: { w: number; h: number }
  straightCols?: number // for capsule
  tiers: TierConfig[]
  theme?: Partial<StadiumTheme>
  hiddenBlocks?: string[]
  overrides?: Record<string, Partial<SectionData>> // Dynamically modify rows, angles, radii, etc!
}

export const CAPSULE_CONFIG: StadiumConfig = {
  type: "capsule",
  pitch: { w: 240 * 2, h: 240 },
  straightCols: 48,
  tiers: [
    {
      id: "100",
      r: 160,
      rows: 6,
      curveBlocks: 4,
      blockCols: 10,
      price: 150,
      color: "#7A1E1E",
    },
    {
      id: "200",
      r: 250,
      rows: 8,
      curveBlocks: 10,
      blockCols: 10,
      price: 80,
      color: "#1F6F5E",
    },
    {
      id: "300",
      r: 360,
      rows: 10,
      curveBlocks: 12,
      blockCols: 10,
      price: 50,
      color: "#4A2C5A",
    },
  ],
  hiddenBlocks: [
    // T2
    "T200_W_1",
    "T200_W_10",
    "T200_E_10",
    "T200_E_1",

    // T3
    "T300_W_5",
    "T300_W_6",
    "T300_E_5",
    "T300_E_6",
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
    {
      id: "400",
      r: 404,
      rows: 6,
      cols: 8,
      count: 24,
      price: 30,
      color: "#c084fc",
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
