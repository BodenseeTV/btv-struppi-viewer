import { useEffect, useState } from "react"

// Third-party Imports
import { endOfWeek, isSameDay, isWithinInterval, startOfWeek } from "date-fns"

export function useCurrentTimeIndicator(
  currentDate: Date,
  view: "day" | "week",
  startHour = 0,
  endHour = 24
) {
  const [currentTimePosition, setCurrentTimePosition] = useState(0)
  const [currentTimeVisible, setCurrentTimeVisible] = useState(false)

  useEffect(() => {
    const calculateTimePosition = () => {
      const now = new Date()
      const nowMinutes = now.getHours() * 60 + now.getMinutes()
      const startMinutes = startHour * 60
      const totalMinutes = (endHour - startHour) * 60

      const position = totalMinutes > 0 ? ((nowMinutes - startMinutes) / totalMinutes) * 100 : 0

      const isCurrentTimeVisible =
        view === "day"
          ? isSameDay(now, currentDate)
          : isWithinInterval(now, {
              start: startOfWeek(currentDate, { weekStartsOn: 0 }),
              end: endOfWeek(currentDate, { weekStartsOn: 0 }),
            })

      setCurrentTimePosition(Math.min(100, Math.max(0, position)))
      setCurrentTimeVisible(isCurrentTimeVisible)
    }

    calculateTimePosition()

    const interval = setInterval(calculateTimePosition, 60000)

    return () => clearInterval(interval)
  }, [currentDate, view, startHour, endHour])

  return { currentTimePosition, currentTimeVisible }
}
