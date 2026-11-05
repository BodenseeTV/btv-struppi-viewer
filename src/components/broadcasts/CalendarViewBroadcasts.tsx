import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Sendung } from "@/types/struppi"
import {
  parseDateTime,
  formatDateLong,
  formatTimeHM,
  isCurrentBroadcast,
  getWeekday,
} from "@/lib/utils"
import { TimeMarkerCalendar } from "./TimeMarkerCalendar"

interface Props {
  sendungen: (Sendung & { sendung_key: string })[]
  onSelectSendung: (s: Sendung) => void
  page: number
  onPageChange: (n: number) => void
}

export function CalendarViewBroadcasts({
  sendungen,
  onSelectSendung,
  page,
  onPageChange,
}: Props) {
  const DAYS_PER_PAGE = 5

  const sendungsByDay = new Map<string, (Sendung & { sendung_key: string })[]>()
  const dayDates = new Map<string, Date>()

  sendungen.forEach((s) => {
    const date = parseDateTime(s.termin.start) || new Date(0)
    const dateKey = formatDateLong(date)
    if (!sendungsByDay.has(dateKey)) {
      sendungsByDay.set(dateKey, [])
      dayDates.set(
        dateKey,
        new Date(date.getFullYear(), date.getMonth(), date.getDate())
      )
    }
    sendungsByDay.get(dateKey)!.push(s)
  })

  const sortedDays = Array.from(sendungsByDay.keys()).sort()
  const currentDateKey = formatDateLong(new Date())
  const currentPage = Math.floor(
    sortedDays.indexOf(currentDateKey) / DAYS_PER_PAGE
  )
  const displayPage =
    page >= 0 && page < Math.ceil(sortedDays.length / DAYS_PER_PAGE)
      ? page
      : Math.max(0, currentPage)
  const displayDays = sortedDays.slice(
    displayPage * DAYS_PER_PAGE,
    (displayPage + 1) * DAYS_PER_PAGE
  )
  const totalPages = Math.ceil(sortedDays.length / DAYS_PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="-mx-8 overflow-x-auto px-8">
        <div className="flex min-w-min gap-4">
          {displayDays.map((dayKey) => {
            const dayDate = dayDates.get(dayKey)!
            const isToday = dayKey === currentDateKey
            return (
              <div
                key={dayKey}
                className="flex w-72 flex-shrink-0 flex-col overflow-hidden rounded-lg border bg-card sm:w-96"
              >
                <div
                  className={`border-b p-3 sm:p-4 ${isToday ? "bg-primary/10" : "bg-muted"}`}
                >
                  <div className="text-sm font-semibold">{dayKey}</div>
                  <div className="text-xs text-muted-foreground">
                    {getWeekday(dayDate)}
                  </div>
                </div>

                <div
                  className="relative flex-1 overflow-y-auto"
                  style={{ minHeight: "600px" }}
                >
                  <div className="pointer-events-none absolute inset-0">
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <div
                        key={hour}
                        className="sticky left-0 border-t border-muted pl-1 text-xs text-muted-foreground"
                        style={{
                          height: "60px",
                          top: `${hour * 60}px`,
                        }}
                      >
                        {String(hour).padStart(2, "0")}:00
                      </div>
                    ))}
                  </div>

                  {isToday && <TimeMarkerCalendar />}

                  <div className="relative" style={{ height: "1440px" }}>
                    {sendungsByDay.get(dayKey)?.map((sendung) => {
                      const start = parseDateTime(sendung.termin.start)
                      const end = parseDateTime(sendung.termin.ende)
                      if (!start || !end) return null

                      const startOfDay = new Date(
                        start.getFullYear(),
                        start.getMonth(),
                        start.getDate()
                      )
                      const startMinutes =
                        (start.getTime() - startOfDay.getTime()) / (1000 * 60)
                      const durationMinutes =
                        (end.getTime() - start.getTime()) / (1000 * 60)
                      const isCurrent = isCurrentBroadcast(start, end)

                      return (
                        <div
                          key={sendung.sendung_key}
                          className={`absolute right-1 left-1 cursor-pointer overflow-hidden border transition-shadow hover:shadow-md ${
                            isCurrent
                              ? "border-destructive bg-destructive/10 ring-2 ring-destructive"
                              : "border-muted bg-card"
                          }`}
                          style={{
                            top: `${startMinutes}px`,
                            height: `${Math.max(56, durationMinutes)}px`,
                          }}
                          onClick={() => onSelectSendung(sendung)}
                        >
                          <div className="flex h-full flex-col justify-between p-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm leading-tight font-semibold">
                                {sendung.titel.termintitel}
                              </p>
                              <p className="truncate text-sm text-muted-foreground">
                                {formatTimeHM(start)} - {formatTimeHM(end)}
                              </p>
                            </div>
                            {isCurrent && (
                              <Badge
                                variant="destructive"
                                className="w-fit text-xs"
                              >
                                LIVE
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <Button
            onClick={() => onPageChange(Math.max(0, displayPage - 1))}
            disabled={displayPage === 0}
            variant="outline"
            size="sm"
          >
            ← Vorherige
          </Button>
          <span className="text-sm text-muted-foreground">
            Seite {displayPage + 1} / {totalPages}
          </span>
          <Button
            onClick={() =>
              onPageChange(Math.min(totalPages - 1, displayPage + 1))
            }
            disabled={displayPage === totalPages - 1}
            variant="outline"
            size="sm"
          >
            Nächste →
          </Button>
        </div>
      )}
    </div>
  )
}
