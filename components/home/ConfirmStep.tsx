"use client"

import { Button } from "../ui/button"
import { siteConfig } from "@/config/site"
import { PlusCircle } from "lucide-react"
import React, { useEffect, useRef } from "react"
import { BookingStep, useBookingStore } from "@/store/bookingStore"

const ConfirmStep: React.FC = () => {
  const { selectedSeats, clearSelection, setStep, resetZoom } =
    useBookingStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const subtotal = selectedSeats.reduce((s, seat) => s + seat.price, 0)
  const fee = Math.round(subtotal * 0.12)
  const total = subtotal + fee

  const confirmationCode = `SX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  // Confetti effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      size: number
      life: number
    }[] = []

    const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"]
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3,
        life: 1,
      })
    }

    let animId: number
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.life -= 0.008
        if (p.life <= 0) continue
        ctx!.globalAlpha = p.life
        ctx!.fillStyle = p.color
        ctx!.fillRect(p.x, p.y, p.size, p.size * 0.4)
      }
      ctx!.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  const handleBookAgain = () => {
    clearSelection()
    resetZoom()
    setStep(BookingStep.MAP)
  }

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ zIndex: 0 }}
      />
      <div
        className="animate-slide-up relative flex max-h-full w-full max-w-lg flex-col overflow-y-auto rounded-2xl text-center shadow-[0_0_80px_rgba(34,197,94,0.1)] drop-shadow-2xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid rgba(34,197,94,0.2)",
          boxShadow: "0 0 60px rgba(34,197,94,0.08)",
          zIndex: 1,
        }}
      >
        {/* Success glow header */}
        <div
          className="px-8 py-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(34,197,94,0.08) 0%, transparent 100%)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div
            className="glow-pulse mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "2px solid rgba(34,197,94,0.3)",
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 36,
              letterSpacing: 4,
              color: "var(--text-primary)",
            }}
          >
            BOOKING CONFIRMED
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
            Your tickets have been reserved successfully
          </p>
        </div>

        {/* Confirmation code */}
        <div
          className="px-8 py-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginBottom: 8,
              fontFamily: "var(--font-mono)",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Confirmation Code
          </p>
          <div
            className="inline-block rounded-xl px-6 py-3"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid rgba(34,197,94,0.2)",
              fontFamily: "var(--font-mono)",
              fontSize: 22,
              fontWeight: 700,
              color: "#22c55e",
              letterSpacing: 4,
            }}
          >
            {confirmationCode}
          </div>
        </div>

        {/* Seat summary */}
        <div
          className="px-8 py-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div
                style={{
                  fontSize: 24,
                  fontFamily: "var(--font-display)",
                  color: "var(--text-primary)",
                  letterSpacing: 2,
                }}
              >
                {selectedSeats.length}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                SEATS
              </div>
            </div>
            <div
              className="text-center"
              style={{
                borderLeft: "1px solid var(--border-subtle)",
                borderRight: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontFamily: "var(--font-display)",
                  color: "#22c55e",
                  letterSpacing: 1,
                }}
              >
                ${total}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                TOTAL PAID
              </div>
            </div>
            <div className="text-center">
              <div
                style={{
                  fontSize: 24,
                  fontFamily: "var(--font-display)",
                  color: "var(--text-primary)",
                  letterSpacing: 1,
                }}
              >
                {siteConfig.event.shortDate}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                EVENT DATE
              </div>
            </div>
          </div>
        </div>

        {/* Seats detail */}
        <div
          className="px-8 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex flex-wrap justify-center gap-2">
            {selectedSeats.map((seat) => (
              <span
                key={seat.id}
                className="rounded-full px-3 py-1 text-xs"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.15)",
                  color: "#4ade80",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {seat.section} · {seat.row}
                {seat.number}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 px-8 py-6">
          {/* <button
            className="w-full rounded-xl py-3 text-sm font-medium transition-all"
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
              color: "#60a5fa",
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
            }}
          >
            Download Tickets (PDF)
          </button> */}
          <Button
            size={"lg"}
            className="w-full"
            onClick={handleBookAgain}
            variant={"default"}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Book more seats
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmStep
