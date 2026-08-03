import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Sendung } from "@/types/struppi"
import { parseDateTime, formatDateLong, formatTimeHM, isCurrentBroadcast, getWeekday } from "@/lib/utils"
import { TimeMarkerCalendar } from "./TimeMarkerCalendar"

interface Props {
  sendungen: (Sendung & { sendung_key: string })[]
  onSelectSendung: (s: Sendung) => void
  page: number
  onPageChange: (n: number) => void
}

export function CalendarViewBroadcasts({ sendungen, onSelectSendung, page, onPageChange }: Props) {
  const DAYS_PER_PAGE = 5

  const sendungsByDay = new Map<string, (Sendung & { sendung_key: string })[]>()
  const dayDates = new Map<string, Date>()

  sendungen.forEach((s) => {
    const date = parseDateTime(s.termin.start) || new Date(0)
    const dateKey = formatDateLong(date)
    if (!sendungsByDay.has(dateKey)) {
      sendungsByDay.set(dateKey, [])
      dayDates.set(dateKey, new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    }
    sendungsByDay.get(dateKey)!.push(s)
  })

  const sortedDays = Array.from(sendungsByDay.keys()).sort()
  const currentDateKey = formatDateLong(new Date())
  const currentPage = Math.floor(sortedDays.indexOf(currentDateKey) / DAYS_PER_PAGE)
  const displayPage = page >= 0 && page < Math.ceil(sortedDays.length / DAYS_PER_PAGE) ? page : Math.max(0, currentPage)
  const displayDays = sortedDays.slice(displayPage * DAYS_PER_PAGE, (displayPage + 1) * DAYS_PER_PAGE)
  const totalPages = Math.ceil(sortedDays.length / DAYS_PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto -mx-8 px-8">
        <div className="flex gap-4 min-w-min">
          {displayDays.map((dayKey) => {
            const dayDate = dayDates.get(dayKey)!
            const isToday = dayKey === currentDateKey
            return (
              <div
                key={dayKey}
                className="flex-shrink-0 w-72 sm:w-96 border rounded-lg overflow-hidden bg-card flex flex-col"
              >
                <div className={`p-3 sm:p-4 border-b ${isToday ? 'bg-primary/10' : 'bg-muted'}`}>
                  <div className="font-semibold text-sm">{dayKey}</div>
                  <div className="text-xs text-muted-foreground">{getWeekday(dayDate)}</div>
                </div>

                <div className="flex-1 overflow-y-auto relative" style={{ minHeight: '600px' }}>
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <div
                        key={hour}
                        className="border-t border-muted text-xs text-muted-foreground pl-1 sticky left-0"
                        style={{
                          height: '60px',
                          top: `${hour * 60}px`,
                        }}
                      >
                        {String(hour).padStart(2, '0')}:00
                      </div>
                    ))}
                  </div>

                  {isToday && <TimeMarkerCalendar />}

                  <div className="relative" style={{ height: '1440px' }}>
                    {sendungsByDay.get(dayKey)?.map((sendung) => {
                      const start = parseDateTime(sendung.termin.start)
                      const end = parseDateTime(sendung.termin.ende)
                      if (!start || !end) return null

                      const startOfDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
                      const startMinutes = (start.getTime() - startOfDay.getTime()) / (1000 * 60)
                      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
                      const isCurrent = isCurrentBroadcast(start, end)

                      return (
                        <div
                          key={sendung.sendung_key}
                          className={`absolute left-1 right-1 border cursor-pointer hover:shadow-md transition-shadow overflow-hidden ${
                            isCurrent ? 'ring-2 ring-destructive bg-destructive/10 border-destructive' : 'bg-card border-muted'
                          }`}
                          style={{
                            top: `${startMinutes}px`,
                            height: `${Math.max(56, durationMinutes)}px`,
                          }}
                          onClick={() => onSelectSendung(sendung)}
                        >
                          <div className="p-2 h-full flex flex-col justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate leading-tight">{sendung.titel.termintitel}</p>
                              <p className="text-sm text-muted-foreground truncate">{formatTimeHM(start)} - {formatTimeHM(end)}</p>
                            </div>
                            {isCurrent && (
                              <Badge variant="destructive" className="text-xs w-fit">LIVE</Badge>
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
        <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
          <Button
            onClick={() => onPageChange(Math.max(0, displayPage - 1))}
            disabled={displayPage === 0}
            variant="outline"
            size="sm"
          >
            ← Vorherige
          </Button>
          <span className="text-sm text-muted-foreground">Seite {displayPage + 1} / {totalPages}</span>
          <Button
            onClick={() => onPageChange(Math.min(totalPages - 1, displayPage + 1))}
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

