import { useStruPPI } from "@/context/StruPPIContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageWithFallback } from "@/components/ImageWithFallback"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { AlertCircle, List, Calendar } from "lucide-react"
import type { Sendung } from "@/types/struppi"
import { useState, useEffect, useRef } from "react"
import { parseDateTime, formatDateShort, formatTimeHM, formatDateLong, isCurrentBroadcast, getWeekday } from "@/lib/utils"
type ViewMode = "list" | "calendar"
export function BroadcastsPage() {
  const { data, currentSender } = useStruPPI()
  const navigate = useNavigate()
  const [selectedSendung, setSelectedSendung] = useState<Sendung | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [calendarPage, setCalendarPage] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  if (!data || !currentSender) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle />
          </EmptyMedia>
          <EmptyTitle>Keine Senderdaten</EmptyTitle>
          <EmptyDescription>
            Bitte lade zuerst ein StruPPI XML.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => navigate("/")} variant="outline">
            Zurück zur Dateiauswahl
          </Button>
        </EmptyContent>
      </Empty>
    )
  }
  // Collect all broadcasts from all Ablauf entries
  const allSendungen: (Sendung & { sendung_key: string })[] = []
  currentSender.ablauf?.forEach((ablauf) => {
    ablauf.sendung.forEach((s, idx) => {
      allSendungen.push({
        ...s,
        sendung_key: `${ablauf.ablaufstart}-${idx}`,
      })
    })
  })
  // Sort by start time (robust parsing)
  allSendungen.sort((a, b) => {
    const da = parseDateTime(a.termin.start) || new Date(0)
    const db = parseDateTime(b.termin.start) || new Date(0)
    return da.getTime() - db.getTime()
  })
  // Scroll to current time on list load
  useEffect(() => {
    if (viewMode === "list" && listRef.current) {
      const now = new Date()
      const scrollElement = Array.from(listRef.current.querySelectorAll("[data-time]")).find((el) => {
        const attr = (el as HTMLElement).getAttribute("data-time") || ""
        const time = parseDateTime(attr) || new Date(0)
        return time > now
      })
      if (scrollElement) {
        setTimeout(() => {
          scrollElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 100)
      }
    }
  }, [viewMode])
  return (
    <div className="space-y-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sendungen</h1>
          <p className="text-muted-foreground">Total: {allSendungen.length} Sendungen</p>
        </div>
        {/* View Mode Tabs */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className="gap-2"
          >
            <List size={18} />
            <span className="hidden sm:inline">Liste</span>
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => setViewMode("calendar")}
            className="gap-2"
          >
            <Calendar size={18} />
            <span className="hidden sm:inline">Kalender</span>
          </Button>
        </div>
      </div>
      {allSendungen.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle />
            </EmptyMedia>
            <EmptyTitle>Keine Sendungen gefunden</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : viewMode === "list" ? (
        <ListViewBroadcasts
          sendungen={allSendungen}
          onSelectSendung={setSelectedSendung}
          listRef={listRef}
        />
      ) : (
        <CalendarViewBroadcasts
          sendungen={allSendungen}
          onSelectSendung={setSelectedSendung}
          page={calendarPage}
          onPageChange={setCalendarPage}
        />
      )}
      {selectedSendung && (
        <BroadcastDetailModal
          sendung={selectedSendung}
          onClose={() => setSelectedSendung(null)}
        />
      )}
    </div>
  )
}
interface ListViewBroadcastsProps {
  sendungen: (Sendung & { sendung_key: string })[]
  onSelectSendung: (s: Sendung) => void
  listRef: React.RefObject<HTMLDivElement | null>
}
function ListViewBroadcasts({ sendungen, onSelectSendung, listRef }: ListViewBroadcastsProps) {
  // render list with date headers and category chip to the right
  let lastDate = ""
  return (
    <div ref={listRef} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {sendungen.map((sendung) => {
        const dateKey = formatDateLong(parseDateTime(sendung.termin.start) || null)
        const showHeader = dateKey !== lastDate
        if (showHeader) lastDate = dateKey

        return (
          <div key={sendung.sendung_key}>
            {showHeader && (
              <div className="py-2">
                <div className="text-sm font-semibold">{dateKey}</div>
              </div>
            )}

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelectSendung(sendung)}
              data-time={sendung.termin.start}
            >
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="hidden sm:block shrink-0">
                    <ImageWithFallback
                      links={sendung.medium?.find(m => 'bildmaterial' in m.mediumtyp)?.url}
                      alt={sendung.titel.termintitel}
                      size="md"
                      heightOnly
                      className="w-20"
                    />
                  </div>

                   {/* Info */}
                   <div className="flex-1 min-w-0">
                     <div className="flex items-start gap-2">
                       <h3 className="font-semibold text-base truncate">{sendung.titel.termintitel}</h3>
                       <div className="ml-auto flex gap-2 shrink-0">
                         {isCurrentBroadcast(parseDateTime(sendung.termin.start), parseDateTime(sendung.termin.ende)) && (
                           <Badge variant="destructive">LIVE</Badge>
                         )}
                         <Badge variant="muted">{sendung.infos?.klassifizierung?.formatgruppe || '—'}</Badge>
                       </div>
                     </div>

                     <p className="text-sm text-muted-foreground mt-1">
                       {formatDateShort(parseDateTime(sendung.termin.start))} {formatTimeHM(parseDateTime(sendung.termin.start))} — {formatTimeHM(parseDateTime(sendung.termin.ende))}
                     </p>

                     {sendung.text?.[0]?._text && (
                       <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                         {sendung.text[0]._text}
                       </p>
                     )}
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
interface CalendarViewBroadcastsProps {
  sendungen: (Sendung & { sendung_key: string })[]
  onSelectSendung: (s: Sendung) => void
  page: number
  onPageChange: (page: number) => void
}
function CalendarViewBroadcasts({
  sendungen,
  onSelectSendung,
  page,
  onPageChange,
}: CalendarViewBroadcastsProps) {
  const DAYS_PER_PAGE = 5
  // Group by day
  const sendungsByDay = new Map<string, (Sendung & { sendung_key: string })[]>()
  sendungen.forEach((s) => {
    const date = parseDateTime(s.termin.start) || new Date(0)
    const dateKey = formatDateLong(date)
    if (!sendungsByDay.has(dateKey)) {
      sendungsByDay.set(dateKey, [])
    }
    sendungsByDay.get(dateKey)!.push(s)
  })
  const sortedDays = Array.from(sendungsByDay.keys()).sort()
  const currentDateKey = formatDateLong(new Date())
  // Find page with current date
  const currentPage = Math.floor(sortedDays.indexOf(currentDateKey) / DAYS_PER_PAGE)
  const displayPage = page >= 0 && page < Math.ceil(sortedDays.length / DAYS_PER_PAGE) ? page : Math.max(0, currentPage)
  const displayDays = sortedDays.slice(displayPage * DAYS_PER_PAGE, (displayPage + 1) * DAYS_PER_PAGE)
  const totalPages = Math.ceil(sortedDays.length / DAYS_PER_PAGE)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {displayDays.map((dayKey) => (
           <div key={dayKey} className="space-y-2">
             <h3 className="font-semibold text-center p-2 bg-muted rounded text-sm">
               <div>{dayKey}</div>
               <div className="text-xs font-normal text-muted-foreground">{getWeekday(parseDateTime(dayKey))}</div>
             </h3>
             <div className="space-y-2 max-h-96 overflow-y-auto relative">
               {/* Display current time marker line if today */}
               {dayKey === formatDateLong(new Date()) && (
                 <TimeMarker />
               )}

               {sendungsByDay.get(dayKey)?.map((sendung) => {
                 const isCurrent = isCurrentBroadcast(parseDateTime(sendung.termin.start), parseDateTime(sendung.termin.ende))
                 return (
                   <Card
                     key={sendung.sendung_key}
                     className={`cursor-pointer hover:shadow-lg transition-shadow ${
                       isCurrent ? 'ring-2 ring-primary bg-accent/50' : ''
                     }`}
                     onClick={() => onSelectSendung(sendung)}
                   >
                     <CardContent className="p-3">
                       <div className="flex gap-2">
                         <div className="shrink-0">
                           <ImageWithFallback
                             links={sendung.medium?.find(m => 'bildmaterial' in m.mediumtyp)?.url}
                             alt={sendung.titel.termintitel}
                             size="sm"
                             heightOnly
                             className="w-12"
                           />
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-start gap-2">
                             <p className="text-xs font-semibold truncate">
                               {sendung.titel.termintitel}
                             </p>
                             {isCurrent && <Badge variant="destructive" className="text-xs">LIVE</Badge>}
                           </div>
                           <p className="text-xs text-muted-foreground">
                             {formatTimeHM(parseDateTime(sendung.termin.start))} — {formatTimeHM(parseDateTime(sendung.termin.ende))}
                           </p>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 )
               })}
             </div>
           </div>
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
          <Button
            onClick={() => onPageChange(Math.max(0, displayPage - 1))}
            disabled={displayPage === 0}
            variant="outline"
          >
            ← Vorherige
          </Button>
          <span className="text-sm text-muted-foreground">
            Seite {displayPage + 1} / {totalPages}
          </span>
          <Button
            onClick={() => onPageChange(Math.min(totalPages - 1, displayPage + 1))}
            disabled={displayPage === totalPages - 1}
            variant="outline"
          >
            Nächste →
          </Button>
        </div>
      )}
    </div>
  )
}
function TimeMarker() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    function updateOffset() {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const msInDay = 24 * 60 * 60 * 1000
      const percentOfDay = ((now.getTime() - startOfDay.getTime()) / msInDay) * 100
      setOffset(percentOfDay)
    }

    updateOffset()
    const interval = setInterval(updateOffset, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="absolute left-0 right-0 h-0.5 bg-destructive z-10 pointer-events-none"
      style={{
        top: `${offset}%`,
        transform: 'translateY(-50%)',
      }}
    >
      <div className="absolute left-0 -top-2 w-3 h-3 rounded-full bg-destructive" />
    </div>
  )
}

function BroadcastDetailModal({ sendung, onClose }: { sendung: Sendung; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>{sendung.titel.termintitel}</CardTitle>
          <CardDescription>
            {formatDateLong(parseDateTime(sendung.termin.start))} {formatTimeHM(parseDateTime(sendung.termin.start))} — {formatTimeHM(parseDateTime(sendung.termin.ende))}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sendung.titel.titelzusatz && (
            <div>
              <strong>Zusatz:</strong> {sendung.titel.titelzusatz}
            </div>
          )}
          {sendung.text && sendung.text.length > 0 && (
            <div>
              <strong>Beschreibung:</strong>
              <p className="text-sm mt-1">{sendung.text[0]._text}</p>
            </div>
          )}
          {sendung.infos && (
            <div>
              <strong>Klassifizierung:</strong>
              <ul className="list-disc pl-5 mt-1 text-sm">
                <li>{sendung.infos.klassifizierung?.formatgruppe || "Unbekannt"}</li>
                {sendung.infos.klassifizierung?.hauptgenre && (
                  <li>{sendung.infos.klassifizierung.hauptgenre}</li>
                )}
                {sendung.infos.klassifizierung?.genre?.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}
          {sendung.mitwirkende?.mitwirkender && sendung.mitwirkende.mitwirkender.length > 0 && (
            <div>
              <strong>Mitwirkende:</strong>
              <ul className="list-disc pl-5 mt-1 text-sm">
                {sendung.mitwirkende.mitwirkender.slice(0, 5).map((m, i) => (
                  <li key={i}>
                    {m.mitwirkendentyp?.person?.name?.name || m.mitwirkendentyp?.gruppe?.name || "Unbekannt"} ({m.funktion})
                  </li>
                ))}
                {sendung.mitwirkende.mitwirkender.length > 5 && (
                  <li>... und {sendung.mitwirkende.mitwirkender.length - 5} weitere</li>
                )}
              </ul>
            </div>
          )}
          {sendung.medium && sendung.medium.filter(m => 'bildmaterial' in m.mediumtyp).length > 0 && (
            <div>
              <strong>Medien:</strong>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {sendung.medium
                  .filter(m => 'bildmaterial' in m.mediumtyp)
                  .map((m, i) => (
                    <div key={i}>
                      <img
                        src={m.url?.[0]?.link}
                        alt={m.titel}
                        className="w-full rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
          <Button onClick={onClose} className="w-full mt-4" variant="outline">
            Schließen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
