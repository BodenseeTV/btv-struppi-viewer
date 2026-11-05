import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
  value: string
  onValueChange?: (value: string) => void
} | null>(null)

export function Tabs({
  value,
  onValueChange,
  className,
  children,
}: {
  value: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex items-stretch gap-2 border bg-card p-1",
        className
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = React.useContext(TabsContext)
  const isActive = context?.value === value

  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center gap-2 border px-3 py-2 text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors",
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-transparent text-foreground hover:bg-muted",
        className
      )}
      onClick={() => context?.onValueChange?.(value)}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  const context = React.useContext(TabsContext)

  if (context?.value !== value) {
    return null
  }

  return <div className={cn(className)}>{children}</div>
}
