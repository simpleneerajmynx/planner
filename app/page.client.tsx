"use client"

import Header from "@/components/home/Header"
import React, { useEffect, useRef } from "react"
import StadiumSeatSelector from "./seat-picker"
import MapLegend from "@/components/home/MapLegend"
import ReviewStep from "@/components/home/ReviewStep"
import ConfirmStep from "@/components/home/ConfirmStep"
import { buildSections } from "./seat-picker/create-data"
import { BookingStep, useBookingStore } from "@/store/bookingStore"
import { AnimatePresence, motion } from "motion/react"

const sections = buildSections()

const BookingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const { setSeats, step, selectedSeats, toggleSeat } = useBookingStore()

  // Init seat data into global store
  useEffect(() => {
    const allSeats = sections.flatMap((s) => s.seats)

    setSeats(allSeats)
  }, [setSeats])

  const content = React.useMemo(() => {
    switch (step) {
      case BookingStep.MAP:
        return (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex min-h-0 flex-1 overflow-hidden"
          >
            <div
              ref={containerRef}
              className="flex min-w-0 flex-1 flex-col overflow-hidden"
            >
              <StadiumSeatSelector
                sections={sections}
                toggleSeat={toggleSeat}
                selectedSeats={selectedSeats}
              />
              <MapLegend />
            </div>
          </motion.div>
        )
      case BookingStep.REVIEW:
        return (
          <motion.div
            key="review"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ReviewStep />
          </motion.div>
        )
      case BookingStep.CONFIRM:
        return (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ConfirmStep />
          </motion.div>
        )
    }
  }, [step, selectedSeats, toggleSeat])

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#faf9f6] dark:bg-zinc-950">
      {/* Warm Ambient Mesh Background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-orange-400/5 blur-[120px] dark:bg-orange-900/5" />
        <div className="absolute top-[10%] right-[0%] h-[40%] w-[40%] rounded-full bg-rose-400/5 blur-[100px] dark:bg-rose-900/5" />
        <div className="absolute -bottom-[10%] left-[5%] h-[50%] w-[60%] rounded-full bg-amber-400/5 blur-[120px] dark:bg-amber-900/5" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <Header />
        <AnimatePresence mode="wait">
          {content}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default BookingPage
