"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

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