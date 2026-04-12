import { create } from "zustand"
import { Seat } from "@/types/seat"

export enum BookingStep {
  MAP = "map",
  REVIEW = "review",
  CONFIRM = "confirm",
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  seat: Seat | null
}

interface BookingStore {
  // Seats state
  seats: Seat[]
  setSeats: (seats: Seat[]) => void
  toggleSeat: (seatId: string) => void

  // Selection
  selectedSeats: Seat[]

  // Hover/Tooltip
  tooltip: TooltipState
  setTooltip: (tooltip: TooltipState) => void

  // Zoom/Pan
  stageScale: number
  stagePos: { x: number; y: number }
  isZoomedIn: boolean
  setStageTransform: (scale: number, pos: { x: number; y: number }) => void
  zoomToSeat: (seat: Seat, canvasWidth: number, canvasHeight: number) => void
  resetZoom: () => void

  // Zoom target seat for animation tracking
  zoomTargetSeat: Seat | null

  // Booking step
  step: BookingStep
  setStep: (step: BookingStep) => void

  // Clear all
  clearSelection: () => void
}

const DEFAULT_SCALE = 1
const ZOOM_SCALE = 3.5

export const useBookingStore = create<BookingStore>((set, get) => ({
  seats: [],
  setSeats: (seats) => set({ seats }),

  toggleSeat: (seatId) => {
    const { seats } = get()
    const updated = seats.map((seat) => {
      if (seat.id !== seatId) return seat
      if (seat.status === "taken") return seat
      if (seat.status === "selected")
        return { ...seat, status: "available" as const }
      if (seat.status === "available" || seat.status === "vip") {
        return { ...seat, status: "selected" as const }
      }
      return seat
    })
    set({
      seats: updated,
      selectedSeats: updated.filter((s) => s.status === "selected"),
    })
  },

  selectedSeats: [],

  tooltip: { visible: false, x: 0, y: 0, seat: null },
  setTooltip: (tooltip) => set({ tooltip }),

  stageScale: DEFAULT_SCALE,
  stagePos: { x: 0, y: 0 },
  isZoomedIn: false,
  zoomTargetSeat: null,

  setStageTransform: (scale, pos) => set({ stageScale: scale, stagePos: pos }),

  zoomToSeat: (seat, canvasWidth, canvasHeight) => {
    const scale = ZOOM_SCALE
    const x = -seat.x * scale + canvasWidth / 2
    const y = -seat.y * scale + canvasHeight / 2
    set({
      stageScale: scale,
      stagePos: { x, y },
      isZoomedIn: true,
      zoomTargetSeat: seat,
    })
  },

  resetZoom: () =>
    set({
      stageScale: 0, // StadiumMap useEffect will recalculate fit on next render
      stagePos: { x: 0, y: 0 },
      isZoomedIn: false,
      zoomTargetSeat: null,
    }),

  step: BookingStep.MAP,
  setStep: (step) => set({ step }),

  clearSelection: () => {
    const { seats } = get()
    set({
      seats: seats.map((s) =>
        s.status === "selected" ? { ...s, status: "available" as const } : s
      ),
      selectedSeats: [],
    })
  },
}))
