"use client"

import React from "react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { GamepadDirectional } from "lucide-react"
import { BookingStep, useBookingStore } from "@/store/bookingStore"
import { siteConfig } from "@/config/site"

const Header: React.FC = () => {
  const { selectedSeats, step, setStep } = useBookingStore()

  const renderButton = React.useMemo(() => {
    switch (step) {
      case BookingStep.MAP:
        return (
          <Button
            onClick={() => setStep(BookingStep.REVIEW)}
            disabled={selectedSeats.length === 0}
            className="flex items-center gap-2"
          >
            Review Selection
            {selectedSeats.length > 0 && (
              <Badge className="ml-1 h-5 rounded-full px-1.5 text-[10px]">
                {selectedSeats.length}
              </Badge>
            )}
          </Button>
        )

      case BookingStep.REVIEW:
        return (
          <Button variant="outline" onClick={() => setStep(BookingStep.MAP)}>
            Edit Seats
          </Button>
        )

      case BookingStep.CONFIRM:
        return <span className="w-20" />
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
          {siteConfig.name}
        </span>
      </div>
      <div className="hidden items-center gap-3 rounded-full px-4 py-1 font-mono text-accent-foreground md:flex">
        <span className="font-display text-xs">{siteConfig.event.nameTitleCase}</span>
        <span>·</span>
        <span className="font-mono text-xs">{siteConfig.event.date} | {siteConfig.event.time}</span>
      </div>
      {renderButton}
    </header>
  )
}

export default Header
