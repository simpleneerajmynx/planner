"use client"

import React from "react"
import { BookingStep, useBookingStore } from "@/store/bookingStore"
import { Seat } from "@/types/seat"

const CATEGORY_LABEL: Record<Seat["category"], string> = {
  floor: "Floor",
  lower: "Lower Bowl",
  upper: "Upper Bowl",
  balcony: "Balcony",
}

const CATEGORY_COLOR: Record<Seat["category"], string> = {
  floor: "#3b82f6",
  lower: "#8b5cf6",
  upper: "#f59e0b",
  balcony: "#6b7280",
}

const BookingSidebar: React.FC = () => {
  const { selectedSeats, clearSelection, toggleSeat, setStep, resetZoom } =
    useBookingStore()

  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0)
  const fee = Math.round(total * 0.12)

  const handleProceed = () => {
    if (selectedSeats.length === 0) return
    setStep(BookingStep.REVIEW)
  }

  return (
    <aside
      className="flex h-full flex-col"
      style={{
        background: "var(--bg-card)",
        borderLeft: "1px solid var(--border-subtle)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              letterSpacing: 2,
              color: "var(--text-primary)",
            }}
          >
            YOUR SEATS
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-xs"
            style={{
              background:
                selectedSeats.length > 0
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(255,255,255,0.05)",
              color: selectedSeats.length > 0 ? "#22c55e" : "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              border: `1px solid ${selectedSeats.length > 0 ? "rgba(34,197,94,0.2)" : "transparent"}`,
            }}
          >
            {selectedSeats.length} selected
          </span>
        </div>
      </div>

      {/* Seat List */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {selectedSeats.length === 0 ? (
          <div
            className="flex h-full flex-col items-center justify-center py-10 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="mb-3 opacity-30"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
            <p style={{ fontSize: 13, fontFamily: "var(--font-mono)" }}>
              No seats selected
            </p>
            <p style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>
              Click a seat on the map
            </p>
          </div>
        ) : (
          selectedSeats.map((seat) => (
            <div
              key={seat.id}
              className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-all"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ background: CATEGORY_COLOR[seat.category] }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-primary)",
                    }}
                  >
                    Sec {seat.section} · Row {seat.row} · #{seat.number}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      marginTop: 1,
                    }}
                  >
                    {CATEGORY_LABEL[seat.category]}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                    color: "#22c55e",
                    fontWeight: 600,
                  }}
                >
                  ${seat.price}
                </span>
                <button
                  onClick={() => toggleSeat(seat.id)}
                  className="flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    color: "var(--text-muted)",
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Price Summary */}
      {selectedSeats.length > 0 && (
        <div
          className="space-y-2 px-5 py-4"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <div
            className="flex justify-between text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <span>Subtotal</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>${total}</span>
          </div>
          <div
            className="flex justify-between text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <span>Service fee</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>${fee}</span>
          </div>
          <div
            className="flex justify-between pt-2"
            style={{
              borderTop: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: 1,
                fontSize: 16,
              }}
            >
              TOTAL
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 18,
                color: "#22c55e",
                fontWeight: 700,
              }}
            >
              ${total + fee}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 px-5 pb-5">
        <button
          onClick={handleProceed}
          disabled={selectedSeats.length === 0}
          className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30"
          style={{
            background:
              selectedSeats.length > 0
                ? "linear-gradient(135deg, #16a34a, #22c55e)"
                : "var(--bg-elevated)",
            color: selectedSeats.length > 0 ? "#fff" : "var(--text-muted)",
            fontFamily: "var(--font-display)",
            letterSpacing: 2,
            fontSize: 15,
            border: "none",
            cursor: selectedSeats.length > 0 ? "pointer" : "not-allowed",
            boxShadow:
              selectedSeats.length > 0
                ? "0 4px 24px rgba(34,197,94,0.25)"
                : "none",
          }}
        >
          PROCEED TO CHECKOUT
        </button>
        {selectedSeats.length > 0 && (
          <button
            onClick={clearSelection}
            className="w-full rounded-lg py-2 text-xs transition-all"
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
            }}
          >
            Clear selection
          </button>
        )}
      </div>
    </aside>
  )
}

export default BookingSidebar
