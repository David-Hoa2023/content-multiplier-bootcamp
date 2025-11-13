"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type ThemeProviderProps = {
  children: React.ReactNode
  storageKey?: string
} & React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ 
  children, 
  storageKey = "contenthub-theme",
  ...props 
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      storageKey={storageKey}
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  )
}