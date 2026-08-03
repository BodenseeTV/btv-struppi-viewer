import { useState, useEffect } from "react"

export function TimeMarkerCalendar() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    function updateOffset() {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const minutesSinceStartOfDay = (now.getTime() - startOfDay.getTime()) / (1000 * 60)
      setOffset(minutesSinceStartOfDay)
    }

    updateOffset()
    const interval = setInterval(updateOffset, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="absolute left-0 right-0 h-0.5 bg-destructive z-20 pointer-events-none"
      style={{
        top: `${offset}px`,
      }}
    >
      <div className="absolute left-0 -top-2 w-4 h-4 rounded-full bg-destructive border-2 border-background" />
    </div>
  )
}

