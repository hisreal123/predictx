"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // Sonner only applies the per-type colours below under
      // [data-rich-colors='true']; without this every toast renders neutral.
      richColors
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",

          // Per-type colours mixed from the app's own tokens rather than
          // sonner's `richColors` palette, so toasts match the cream/gold
          // theme and re-derive automatically in dark mode.
          "--success-bg": "color-mix(in oklab, var(--tier-high) 14%, var(--popover))",
          "--success-text": "var(--tier-high)",
          "--success-border":
            "color-mix(in oklab, var(--tier-high) 30%, var(--popover))",

          "--error-bg": "color-mix(in oklab, var(--destructive) 14%, var(--popover))",
          "--error-text": "var(--destructive)",
          "--error-border":
            "color-mix(in oklab, var(--destructive) 30%, var(--popover))",

          "--warning-bg": "color-mix(in oklab, var(--tier-medium) 14%, var(--popover))",
          "--warning-text": "var(--tier-medium)",
          "--warning-border":
            "color-mix(in oklab, var(--tier-medium) 30%, var(--popover))",

          "--info-bg": "color-mix(in oklab, var(--primary) 14%, var(--popover))",
          "--info-text": "var(--primary)",
          "--info-border":
            "color-mix(in oklab, var(--primary) 30%, var(--popover))",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
