"use client"

import type React from "react"

import { DataProvider } from "@/lib/data-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return <DataProvider>{children}</DataProvider>
}

