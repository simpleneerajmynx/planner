import { Seat as GlobalSeat } from "@/types/seat"
import { ACTIVE_THEME } from "./create-data"
import { Camera, Check } from "lucide-react"
import { motion } from "motion/react"

type TooltipProps = {
  seat: GlobalSeat
  x: number
  y: number
  selectedSeatIds: Set<string>
  onPointerEnter?: () => void
  onPointerLeave?: () => void
}

const SeatTooltip: React.FC<TooltipProps> = ({
  x,
  y,
  seat,
  selectedSeatIds,
  onPointerEnter,
  onPointerLeave,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute z-50 -translate-x-1/2 -translate-y-[calc(100%+16px)] transform drop-shadow-2xl transition-all duration-150 ease-out"
      style={{ left: x, top: y }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="flex w-[290px] flex-col overflow-hidden rounded-[18px] bg-white shadow-lg ring-1 ring-black/5">
        {/* Stadium Virtual View Graphic */}
        <div className="group relative h-[110px] w-full cursor-pointer overflow-hidden border-b border-gray-200 bg-gray-900 leading-none">
          <img
            src="https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80&w=1876&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-overlay transition-transform duration-500 group-hover:scale-105"
            alt="Virtual Seat View"
          />
          <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-transparent to-transparent opacity-60" />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 ring-1 ring-white/10 backdrop-blur-md transition-colors hover:bg-black/80">
            <Camera className="h-[12px] w-[12px] text-white" />
            <span className="text-[9px] font-bold tracking-widest text-white">
              VIEW FROM SEAT
            </span>
          </div>
        </div>

        {/* Top section: Sec, Row, Seat */}
        <div className="flex h-[72px] bg-white">
          <div className="flex flex-1 flex-col items-center justify-center border-r border-[#f0f0f4]">
            <span className="mb-0.5 text-[10px] font-bold tracking-wider text-gray-400">
              SECTION
            </span>
            <span
              className="text-[22px] leading-none font-black"
              style={{ color: ACTIVE_THEME.tooltip.textPrimary }}
            >
              {seat.section.replace(/T|-/g, "") || "C134"}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center border-r border-[#f0f0f4]">
            <span className="mb-0.5 text-[10px] font-bold tracking-wider text-gray-400">
              ROW
            </span>
            <span
              className="text-[22px] leading-none font-black"
              style={{ color: ACTIVE_THEME.tooltip.textPrimary }}
            >
              {parseInt(seat.row) + 1}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center">
            <span className="mb-0.5 text-[10px] font-bold tracking-wider text-gray-400">
              SEAT
            </span>
            <span
              className="text-[22px] leading-none font-black"
              style={{ color: ACTIVE_THEME.tooltip.textPrimary }}
            >
              {seat.number + 1}
            </span>
          </div>
        </div>

        {/* Bottom section: Action/Status */}
        {selectedSeatIds.has(seat.id) ? (
          <div
            className="flex items-center justify-between px-5 py-4 transition-colors duration-200"
            style={{
              backgroundColor: seat.color || ACTIVE_THEME.tooltip.selectedBg,
            }}
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-4 ring-white/20">
                <Check
                  className="h-5 w-5"
                  style={{
                    color: seat.color || ACTIVE_THEME.tooltip.selectedBg,
                  }}
                  strokeWidth={3.5}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] leading-tight font-bold tracking-tight text-white shadow-sm">
                  Selected
                </span>
                <span className="text-[11px] leading-tight font-medium text-white/90">
                  Club Hall of Fame
                </span>
              </div>
            </div>
            <span className="text-[22px] font-bold tracking-tight text-white">
              {seat.price} €
            </span>
          </div>
        ) : (
          <div
            className="flex items-center justify-between px-5 py-4 transition-colors duration-200"
            style={{
              backgroundColor: seat.color || ACTIVE_THEME.tooltip.availableBg,
            }}
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25">
                <div className="h-2.5 w-2.5 rounded-full bg-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] leading-tight font-bold tracking-tight text-white">
                  Available
                </span>
                <span className="text-[11px] leading-tight font-medium text-white/80">
                  General Admission
                </span>
              </div>
            </div>
            <span className="text-[22px] font-bold tracking-tight text-white">
              {seat.price} €
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default SeatTooltip
