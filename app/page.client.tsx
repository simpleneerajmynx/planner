"use client"

import Header from "@/components/home/Header"
import React, { useEffect, useRef } from "react"
import StadiumSeatSelector from "./seat-picker"
import MapLegend from "@/components/home/MapLegend"
import ReviewStep from "@/components/home/ReviewStep"
import ConfirmStep from "@/components/home/ConfirmStep"
import { buildSections } from "./seat-picker/create-data"
import { BookingStep, useBookingStore } from "@/store/bookingStore"

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
          <div className="flex min-h-0 flex-1 overflow-hidden">
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
          </div>
        )
      case BookingStep.REVIEW:
        return <ReviewStep />
      case BookingStep.CONFIRM:
        return <ConfirmStep />
    }
  }, [step, selectedSeats, toggleSeat])

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      {content}
    </div>
  )
}

export default BookingPage
