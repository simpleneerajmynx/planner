"use client"

import React from "react"
import { BookingStep, useBookingStore } from "@/store/bookingStore"
import { Seat } from "@/types/seat"
import { GamepadDirectional } from "lucide-react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"

const CATEGORY_LABEL: Record<Seat["category"], string> = {
  floor: "Floor",
  lower: "Lower Bowl",
  upper: "Upper Bowl",
  balcony: "Balcony",
}

const ReviewStep: React.FC = () => {
  const { selectedSeats, setStep } = useBookingStore()

  const subtotal = selectedSeats.reduce((s, seat) => s + seat.price, 0)
  const fee = Math.round(subtotal * 0.12)
  const total = subtotal + fee

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
      <Card className="animate-slide-up flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl drop-shadow-md">
        {/* Header */}
        <div
          className="shrink-0 px-8 py-6"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <button
            onClick={() => setStep(BookingStep.MAP)}
            className="mb-4 flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to map
          </button>
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

        {/* Event Info */}
        <div
          className="flex shrink-0 items-center gap-4 px-8 py-5"
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(59,130,246,0.04)",
          }}
        >
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
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
              CHAMPIONSHIP FINALS 2026
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                marginTop: 2,
              }}
            >
              Sat, May 10 · 7:30 PM · StadiumX Arena
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
        <div className="flex shrink-0 items-center justify-center px-8 pt-5 pb-8">
          <Button
            size={"lg"}
            onClick={() => setStep(BookingStep.CONFIRM)}
            className="w-full"
          >
            CONFIRM &amp; PAY ${total}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ReviewStep
