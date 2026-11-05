import { useState, useEffect } from "react"

export function TimeMarkerCalendar() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    function updateOffset() {
      const now = new Date()
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      )
      const minutesSinceStartOfDay =
        (now.getTime() - startOfDay.getTime()) / (1000 * 60)
      setOffset(minutesSinceStartOfDay)
    }

    updateOffset()
    const interval = setInterval(updateOffset, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-20 h-0.5 bg-destructive"
      style={{
        top: `${offset}px`,
      }}
    >
      <div className="absolute -top-2 left-0 h-4 w-4 rounded-full border-2 border-background bg-destructive" />
    </div>
  )
}
