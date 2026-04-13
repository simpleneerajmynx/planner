"use client"

import React from "react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  PencilIcon,
  PlusCircle,
  TicketCheck,
  GamepadDirectional,
} from "lucide-react"
import { BookingStep, useBookingStore } from "@/store/bookingStore"
import { siteConfig } from "@/config/site"
import StadiumOptions from "@/app/seat-picker/options"
import DarkMode from "./darkmode"

const Header: React.FC = () => {
  const { selectedSeats, step, setStep, clearSelection, resetZoom } =
    useBookingStore()

  const handleBookAgain = () => {
    clearSelection()
    resetZoom()
    setStep(BookingStep.MAP)
  }

  const renderButton = React.useMemo(() => {
    switch (step) {
      case BookingStep.MAP:
        return (
          <Button
            onClick={() => setStep(BookingStep.REVIEW)}
            disabled={selectedSeats.length === 0}
            className="flex items-center gap-2"
          >
            <TicketCheck />
            Review Selection
            {selectedSeats.length > 0 && (
              <Badge
                variant={"secondary"}
                className="ml-1 h-5 rounded-full px-1.5 text-[10px]"
              >
                {selectedSeats.length}
              </Badge>
            )}
          </Button>
        )

      case BookingStep.REVIEW:
        return (
          <Button variant="default" onClick={() => setStep(BookingStep.MAP)}>
            <PencilIcon />
            Edit Seats
          </Button>
        )

      case BookingStep.CONFIRM:
        return (
          <Button variant={"default"} onClick={handleBookAgain}>
            <PlusCircle />
            Book More Seats
          </Button>
        )
    }
  }, [step, selectedSeats, setStep])

  return (
    <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-black/5 bg-white/50 px-6 py-3 backdrop-blur-xl dark:border-white/5 dark:bg-black/50">
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
        <span className="font-display text-xs">
          {siteConfig.event.nameTitleCase}
        </span>
        <span>·</span>
        <span className="font-mono text-xs">
          {siteConfig.event.date} | {siteConfig.event.time}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {renderButton}
        {step === BookingStep.MAP && <StadiumOptions />}
        <DarkMode />
      </div>
    </header>
  )
}

export default Header
