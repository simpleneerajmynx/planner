import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StadiumX — Book Your Seat',
  description: 'Interactive stadium seat booking with real-time selection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
