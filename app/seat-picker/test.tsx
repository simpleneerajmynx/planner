import React, { useState, useMemo } from "react"
import * as d3 from "d3"

// --- Configuration ---
const CENTER_X = 500
const CENTER_Y = 500

interface SectionConfig {
  id: string
  startAngle: number // in degrees
  endAngle: number
  innerRadius: number
  outerRadius: number
  rows: number
  color: string
  label: string
}

// Defining the "Rings" seen in your image
const STADIUM_CONFIG: SectionConfig[] = [
  // Inner Red Ring
  {
    id: "121",
    startAngle: 180,
    endAngle: 220,
    innerRadius: 200,
    outerRadius: 250,
    rows: 6,
    color: "#e57373",
    label: "121",
  },
  {
    id: "122",
    startAngle: 220,
    endAngle: 260,
    innerRadius: 200,
    outerRadius: 250,
    rows: 6,
    color: "#e57373",
    label: "122",
  },
  // Middle Green Ring
  {
    id: "220",
    startAngle: 180,
    endAngle: 220,
    innerRadius: 260,
    outerRadius: 320,
    rows: 8,
    color: "#81c784",
    label: "220",
  },
  {
    id: "221",
    startAngle: 220,
    endAngle: 260,
    innerRadius: 260,
    outerRadius: 320,
    rows: 8,
    color: "#81c784",
    label: "221",
  },
  // Outer Blue Ring
  {
    id: "432",
    startAngle: 190,
    endAngle: 210,
    innerRadius: 330,
    outerRadius: 420,
    rows: 12,
    color: "#64b5f6",
    label: "432",
  },
]

const CurvedStadium = () => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])

  // Function to calculate X,Y from Polar (Radius, Angle)
  const polarToCartesian = (r: number, angleDeg: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180)
    return {
      x: CENTER_X + r * Math.cos(angleRad),
      y: CENTER_Y + r * Math.sin(angleRad),
    }
  }

  const generateSeatsForSection = (config: SectionConfig) => {
    const seats = []
    const angleStep = (config.endAngle - config.startAngle) / 10 // 10 columns per section
    const radiusStep = (config.outerRadius - config.innerRadius) / config.rows

    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c <= 10; c++) {
        const radius = config.innerRadius + r * radiusStep
        const angle = config.startAngle + c * angleStep
        const pos = polarToCartesian(radius, angle)

        seats.push({
          id: `${config.id}-${r}-${c}`,
          ...pos,
          status: Math.random() > 0.2 ? "available" : "sold",
        })
      }
    }
    return seats
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
      <svg viewBox="0 0 1000 1000" className="h-[800px] w-[800px]">
        {/* Central Pitch / Stage */}
        <rect
          x={400}
          y={425}
          width={200}
          height={150}
          fill="#fff"
          stroke="#ccc"
          strokeWidth="2"
          rx="40"
        />

        {STADIUM_CONFIG.map((section) => (
          <g key={section.id}>
            {/* Section Background Path */}
            <path
              d={
                d3.arc()({
                  innerRadius: section.innerRadius - 5,
                  outerRadius: section.outerRadius + 5,
                  startAngle: section.startAngle * (Math.PI / 180),
                  endAngle: section.endAngle * (Math.PI / 180),
                }) as string
              }
              transform={`translate(${CENTER_X}, ${CENTER_Y})`}
              fill={section.color}
              fillOpacity="0.2"
              stroke={section.color}
              strokeWidth="1"
            />

            {/* Seats in Curved Formation */}
            {generateSeatsForSection(section).map((seat) => (
              <circle
                key={seat.id}
                cx={seat.x}
                cy={seat.y}
                r="3"
                fill={seat.status === "sold" ? "#cbd5e1" : section.color}
                className="cursor-pointer transition-transform hover:scale-150"
                onClick={() => console.log(`Selected ${seat.id}`)}
              />
            ))}

            {/* Curved Section Label */}
            <text
              className="pointer-events-none fill-slate-600 text-xs font-bold"
              transform={`translate(${polarToCartesian((section.innerRadius + section.outerRadius) / 2, (section.startAngle + section.endAngle) / 2).x}, ${polarToCartesian((section.innerRadius + section.outerRadius) / 2, (section.startAngle + section.endAngle) / 2).y})`}
              textAnchor="middle"
            >
              {section.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export default CurvedStadium
