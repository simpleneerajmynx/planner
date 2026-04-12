export type SeatStatus = 'available' | 'taken' | 'selected' | 'vip'

export interface Seat {
  id: string
  section: string
  row: string
  number: number
  x: number
  y: number
  status: SeatStatus
  price: number
  color?: string
  category: 'floor' | 'lower' | 'upper' | 'balcony'
}

export interface Section {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  category: 'floor' | 'lower' | 'upper' | 'balcony'
}

export interface BookingState {
  selectedSeats: Seat[]
  hoveredSeat: Seat | null
  zoomedSeat: Seat | null
  stageScale: number
  stagePos: { x: number; y: number }
  isZoomedIn: boolean
}

export const SEAT_COLORS = {
  available: '#1d4ed8',
  selected: '#16a34a',
  taken: '#2d2d3a',
  vip: '#b45309',
  hover: '#60a5fa',
  takenStroke: '#3d3d4d',
} as const

export const CATEGORY_PRICES: Record<Seat['category'], number> = {
  floor: 185,
  lower: 125,
  upper: 85,
  balcony: 55,
}
