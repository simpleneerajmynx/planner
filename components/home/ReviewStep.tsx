"use client"

import React from "react"
import { BookingStep, useBookingStore } from "@/store/bookingStore"
import { Seat } from "@/types/seat"
import { GamepadDirectional, Loader2 } from "lucide-react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { siteConfig } from "@/config/site"

const CATEGORY_LABEL: Record<Seat["category"], string> = {
  floor: "Floor",
  lower: "Lower Bowl",
  upper: "Upper Bowl",
  balcony: "Balcony",
}

const ReviewStep: React.FC = () => {
  const { selectedSeats, setStep } = useBookingStore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const subtotal = selectedSeats.reduce((s, seat) => s + seat.price, 0)
  const fee = Math.round(subtotal * 0.12)
  const total = subtotal + fee

  const handleConfirm = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setStep(BookingStep.CONFIRM)
    }, 1500)
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
      <Card className="animate-slide-up flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-2xl drop-shadow-md">
        {/* Header */}
        <div
          className="shrink-0 px-8 py-6"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              letterSpacing: 3,
              color: "var(--text-primary)",
            }}
          >
            REVIEW ORDER
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Confirm your seat selection before checkout
          </p>
        </div>
        {/* Payment Details */}
        <div
          className="px-8 py-5"
          style={{
            background: "var(--bg-elevated)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <h3 className="mb-4 text-xs font-bold tracking-widest text-zinc-500 dark:text-zinc-400">
            PAYER INFORMATION
          </h3>
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="First Name"
                className="flex-1 rounded-xl bg-transparent"
              />
              <Input
                placeholder="Last Name"
                className="flex-1 rounded-xl bg-transparent"
              />
            </div>
            <Input
              placeholder="Email Address"
              type="email"
              className="rounded-xl bg-transparent"
            />

            {/* <h3 className="mt-6 mb-4 text-xs font-bold tracking-widest text-zinc-500 dark:text-zinc-400">
              PAYMENT METHOD
            </h3>
            <Input
              placeholder="Card Number (0000 0000 0000 0000)"
              className="rounded-xl bg-transparent font-mono text-sm"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="MM/YY"
                className="flex-1 rounded-xl bg-transparent font-mono text-sm"
              />
              <Input
                placeholder="CVC"
                className="w-full rounded-xl bg-transparent px-3 py-2 font-mono text-sm sm:w-24"
              />
            </div> */}
          </div>
        </div>
        {/* Event Info */}
        <div
          className="flex shrink-0 items-center gap-4 px-8 py-5"
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(59,130,246,0.04)",
          }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <GamepadDirectional />
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                letterSpacing: 2,
              }}
            >
              {siteConfig.event.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                marginTop: 2,
              }}
            >
              {siteConfig.event.date} · {siteConfig.event.time} ·{" "}
              {siteConfig.event.venue}
            </div>
          </div>
        </div>

        {/* Seats List */}
        <div className="flex min-h-0 flex-1 flex-col space-y-2 overflow-y-auto px-8 py-5">
          {selectedSeats.map((seat, i) => (
            <div
              key={seat.id}
              className="animate-fade-in flex items-center justify-between py-3"
              style={{
                borderBottom:
                  i < selectedSeats.length - 1
                    ? "1px solid var(--border-subtle)"
                    : "none",
                animationDelay: `${i * 50}ms`,
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    color: "#22c55e",
                    fontFamily: "var(--font-mono)",
                    border: "1px solid rgba(34,197,94,0.15)",
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    Section {seat.section} · Row {seat.row} · Seat {seat.number}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 1,
                    }}
                  >
                    {CATEGORY_LABEL[seat.category]}
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  color: "var(--text-primary)",
                }}
              >
                ${seat.price}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div
          className="shrink-0 px-8 py-5"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-elevated)",
          }}
        >
          <div className="space-y-2">
            <div
              className="flex justify-between text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>
                {selectedSeats.length} seat
                {selectedSeats.length !== 1 ? "s" : ""}
              </span>
              <span style={{ fontFamily: "var(--font-mono)" }}>
                ${subtotal}
              </span>
            </div>
            <div
              className="flex justify-between text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <span>Service &amp; booking fee (12%)</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>${fee}</span>
            </div>
            <div
              className="mt-1 flex justify-between pt-3"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  letterSpacing: 2,
                }}
              >
                TOTAL DUE
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 22,
                  color: "#22c55e",
                  fontWeight: 700,
                }}
              >
                ${total}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className="flex shrink-0 items-center justify-center px-8 pt-2 pb-8"
          style={{ background: "var(--bg-elevated)" }}
        >
          <Button
            size={"lg"}
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold tracking-wide"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Processing...
              </>
            ) : (
              `CONFIRM & PAY $${total}`
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ReviewStep
