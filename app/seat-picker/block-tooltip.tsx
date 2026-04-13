import React, { forwardRef } from "react"
import { motion } from "motion/react"

type BlockTooltipProps = {
  x: number
  y: number
  group: string
  total: number
  available: number
  price: number
  color: string
  selectedCount: number
  onPointerEnter?: () => void
  onPointerLeave?: () => void
}

const BlockTooltip = forwardRef<HTMLDivElement, BlockTooltipProps>(
  (
    {
      x,
      y,
      group,
      total,
      available,
      price,
      color,
      selectedCount,
      onPointerEnter,
      onPointerLeave,
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        key="block-tooltip"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="absolute z-50 -translate-x-1/2 -translate-y-[calc(100%+16px)] transform drop-shadow-2xl transition-all duration-75 ease-out"
        style={{ left: x, top: y - 15 }}
      >
        <div className="flex min-w-72 flex-col overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
          {/* Top section */}
          <div className="flex h-[72px] bg-white dark:bg-zinc-900">
            <div className="flex flex-1 flex-col items-center justify-center border-r border-[#f0f0f4] dark:border-zinc-800">
              <span className="mb-0.5 text-[10px] font-bold tracking-wider text-gray-400">
                SECTION
              </span>
              <span className="text-xl leading-none font-black text-accent-foreground">
                {group?.replace(/T|-|_/g, " ").trim() || "100"}
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center border-r border-[#f0f0f4] dark:border-zinc-800">
              <span className="mb-0.5 text-[10px] font-bold tracking-wider text-gray-400">
                AVAILABLE
              </span>
              <span className="text-xl leading-none font-black text-accent-foreground">
                {available}
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center">
              <span className="mb-0.5 text-[10px] font-bold tracking-wider text-gray-400">
                TOTAL
              </span>
              <span className="text-xl leading-none font-black text-accent-foreground">
                {total}
              </span>
            </div>
          </div>

          {/* Bottom section */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ backgroundColor: color }}
          >
            <div className="flex items-center gap-3">
              {selectedCount > 0 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <span className="text-[12px] font-black text-white">
                    {selectedCount}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="mb-0.5 text-[15px] leading-tight font-bold tracking-tight text-white">
                  {available > 0 ? "Tickets from" : "Sold Out"}
                </span>
                <span className="text-[11px] leading-tight font-medium text-white/80">
                  Click to explore area
                </span>
              </div>
            </div>
            {available > 0 && (
              <span className="text-xl font-bold tracking-tight text-white">
                ${price}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    )
  }
)

export default BlockTooltip
