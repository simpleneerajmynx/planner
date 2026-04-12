"use client"

import React from "react"
import { Button } from "../ui/button"
import { GamepadDirectional } from "lucide-react"
import { BookingStep, useBookingStore } from "@/store/bookingStore"
import { Badge } from "../ui/badge"

const Header: React.FC = () => {
  const { selectedSeats, step, setStep } = useBookingStore()

  const renderButton = React.useMemo(() => {
    switch (step) {
      case BookingStep.MAP:
        return (
          <Button onClick={() => setStep(BookingStep.REVIEW)}>
            Proceed to Checkout
            {selectedSeats.length > 0 && (
              <Badge variant="secondary">{selectedSeats.length}</Badge>
            )}
          </Button>
        )
      case BookingStep.REVIEW:
        return <Button onClick={() => setStep(BookingStep.MAP)}>Back</Button>
      case BookingStep.CONFIRM:
        return <Button onClick={() => setStep(BookingStep.REVIEW)}>Back</Button>
    }
  }, [step, selectedSeats, setStep])

  return (
    <header className="border-border-subtle flex h-16 shrink-0 items-center justify-between border-b px-6 py-3">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-secondary">
          <GamepadDirectional className="h-4 w-4" />
        </div>
        <span className="font-display text-lg font-light text-foreground">
          PLANNER
        </span>
      </div>
      <div className="hidden items-center gap-3 rounded-full px-4 py-1 font-mono text-accent-foreground md:flex">
        <span className="font-display text-xs">Championship Finals 2026</span>
        <span>·</span>
        <span className="font-mono text-xs">Sat, May 10 | 7:30 PM</span>
      </div>
      {renderButton}
    </header>
  )
}

export default Header
