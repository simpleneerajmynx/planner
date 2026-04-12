import { Seat as GlobalSeat } from "@/types/seat"

export interface Section {
  id: string
  label: string
  seats: GlobalSeat[]
  minX?: number
  maxX?: number
  minY?: number
  maxY?: number
}

export interface SelectedSeat {
  id: string
  section: string
  row: number
  col: number
  price: number
}

// Viewport rect tracked for minimap
export interface ViewRect {
  x: number
  y: number
  w: number
  h: number
}

export interface HitZone {
  group: string
  x: number
  y: number
  w: number
  h: number
  rotate?: number
  cx?: number
  cy?: number
}
