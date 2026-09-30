import { BroadcastDetailModal } from "@/components/broadcasts/BroadcastDetailModal"
import { CalendarViewBroadcasts } from "@/components/broadcasts/CalendarViewBroadcasts"
import { ListViewBroadcasts } from "@/components/broadcasts/ListViewBroadcasts"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useStruPPI } from "@/context/StruPPIContext"
import { parseDateTime } from "@/lib/utils"
import type { Sendung } from "@/types/struppi"
import { AlertCircle, Calendar, List } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
type ViewMode = "list" | "calendar"
export function BroadcastsPage() {
  const { data, currentSender } = useStruPPI()
  const navigate = useNavigate()
  const [selectedSendung, setSelectedSendung] = useState<Sendung | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [calendarPage, setCalendarPage] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const nowButtonRef = useRef<HTMLButtonElement | null>(null)
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
  const allSendungen: (Sendung & { sendung_key: string })[] = []
  currentSender.ablauf?.forEach((ablauf) => {
    ablauf.sendung.forEach((s, idx) => {
      allSendungen.push({
        ...s,
        sendung_key: `${ablauf.ablaufstart}-${idx}`,
      })
    })
  })
  allSendungen.sort((a, b) => {
    const da = parseDateTime(a.termin.start) || new Date(0)
    const db = parseDateTime(b.termin.start) || new Date(0)
    return da.getTime() - db.getTime()
  })
  useEffect(() => {
    if (viewMode === "list" && listRef.current) {
      const currentEl = Array.from(listRef.current.querySelectorAll("[data-current='true']"))[0]
      if (currentEl) {
        setTimeout(() => (currentEl as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" }), 100)
        return
      }

      const now = new Date()
      const scrollElement = Array.from(listRef.current.querySelectorAll("[data-time]")).find((el) => {
        const attr = (el as HTMLElement).getAttribute("data-time") || ""
        const time = parseDateTime(attr) || new Date(0)
        return time > now
      })
      if (scrollElement) {
        setTimeout(() => {
          (scrollElement as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" })
        }, 100)
      }
    }
  }, [viewMode])
  return (
    <div className="space-y-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Programm</h1>
          <p className="text-muted-foreground">Total: {allSendungen.length} Sendungen</p>
        </div>
        <div className="flex gap-2 items-center">
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
          <Button
            ref={nowButtonRef}
            variant="ghost"
            onClick={() => {
              setViewMode("list")
              setTimeout(() => {
                const el = listRef.current?.querySelector("[data-current='true']") as HTMLElement | null
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
              }, 150)
            }}
            title="Zur aktuell laufenden Sendung"
            className="ml-1"
          >
            Aktuell
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

interface CalendarViewBroadcastsProps {
  sendungen: (Sendung & { sendung_key: string })[]
  onSelectSendung: (s: Sendung) => void
  page: number
  onPageChange: (n: number) => void
}


