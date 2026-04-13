"use client"

import { Provider } from "jotai"
import type React from "react"

export function JotaiProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>
}
