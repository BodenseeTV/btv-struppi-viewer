import { ListViewBroadcasts } from "@/components/broadcasts/ListViewBroadcasts"
import EventCalendar01, {
  type CalendarEvent,
} from "@/components/calendar-view/event-calendar-01"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStruPPI } from "@/context/StruPPIContext"
import { parseDateTime } from "@/lib/utils"
import { AlertCircle, Calendar, List } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

type ViewMode = "list" | "calendar"
type TimeRangePreset = "all" | "today" | "7d" | "30d" | "custom"

function matchesTimeRange(
  date: Date | null,
  preset: TimeRangePreset,
  fromDate?: string,
  toDate?: string
): boolean {
  if (!date) return false

  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )

  if (preset === "all") return true
  if (preset === "today")
    return (
      date >= startOfToday &&
      date < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
    )
  if (preset === "7d") {
    const start = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000)
    return date >= start
  }
  if (preset === "30d") {
    const start = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000)
    return date >= start
  }
  if (preset === "custom") {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null
    if (from && date < from) return false
    if (to && date > to) return false
    return true
  }

  return true
}

export function BroadcastsPage() {
  const { data, currentSender } = useStruPPI()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialViewMode = searchParams.get("view") === "calendar" ? "calendar" : "list"
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [timeRange, setTimeRange] = useState<TimeRangePreset>("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const nowButtonRef = useRef<HTMLButtonElement | null>(null)
  const shouldAutoScrollToNow = useRef(false)

  const senderAblaufe = currentSender?.ablauf ?? []
  const requestedAblauf = searchParams.get("ablauf")
  const selectedAblauf =
    senderAblaufe.find((ablauf) => ablauf.ablaufstart === requestedAblauf) ??
    senderAblaufe[0] ??
    null

  const filteredSendungen = useMemo(() => {
    const sendungen = selectedAblauf
      ? selectedAblauf.sendung.map((s, idx) => ({
          ...s,
          sendung_key: `${selectedAblauf.ablaufstart}-${idx}`,
        }))
      : []

    sendungen.sort((a, b) => {
      const da = parseDateTime(a.termin.start) || new Date(0)
      const db = parseDateTime(b.termin.start) || new Date(0)
      return da.getTime() - db.getTime()
    })

    return sendungen
  }, [selectedAblauf])

  const visibleSendungen = useMemo(
    () =>
      filteredSendungen.filter((sendung) =>
        matchesTimeRange(
          parseDateTime(sendung.termin.start),
          timeRange,
          fromDate,
          toDate
        )
      ),
    [filteredSendungen, fromDate, timeRange, toDate]
  )

  const calendarEvents = useMemo<CalendarEvent[]>(
    () =>
      visibleSendungen.map((sendung, index) => {
        const start = parseDateTime(sendung.termin.start) ?? new Date()
        const end =
          parseDateTime(sendung.termin.ende) ?? new Date(start.getTime())

        const durationMinutes = Math.max(
          0,
          Math.round((end.getTime() - start.getTime()) / 60000)
        )

        return {
          id: sendung.sendung_id,
          title: sendung.titel?.termintitel || "Unbenannte Sendung",
          description:
            sendung.text?.find((text) => text.textart === "Beschreibung")
              ?._text ?? "",
          start,
          end,
          allDay: durationMinutes >= 23 * 60,
          color: ["family", "business", "personal", "holiday", "etc"][
            index % 5
          ] as CalendarEvent["color"],
        }
      }),
    [visibleSendungen]
  )

  useEffect(() => {
    const viewParam = searchParams.get("view")
    const next = new URLSearchParams(searchParams)

    if (viewMode === "calendar" && viewParam !== "calendar") {
      next.set("view", "calendar")
      setSearchParams(next, { replace: true })
      return
    }

    if (viewMode === "list" && viewParam !== null) {
      next.delete("view")
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams, viewMode])

  useEffect(() => {
    if (selectedAblauf && !requestedAblauf) {
      const next = new URLSearchParams(searchParams)
      next.set("ablauf", String(selectedAblauf.ablaufstart))
      setSearchParams(next, { replace: true })
    }
  }, [requestedAblauf, searchParams, selectedAblauf, setSearchParams])

  useEffect(() => {
    if (
      viewMode !== "list" ||
      !shouldAutoScrollToNow.current ||
      !listRef.current
    )
      return

    const currentEl = Array.from(
      listRef.current.querySelectorAll("[data-current='true']")
    )[0]
    const target =
      currentEl ??
      Array.from(listRef.current.querySelectorAll("[data-time]")).find((el) => {
        const attr = (el as HTMLElement).getAttribute("data-time") || ""
        const time = parseDateTime(attr) || new Date(0)
        return time > new Date()
      })

    if (target) {
      setTimeout(() => {
        ;(target as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }, 120)
    }

    shouldAutoScrollToNow.current = false
  }, [viewMode, selectedAblauf, visibleSendungen])

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

  return (
    <div className="page-shell">
      <div className="sticky top-0 z-20 -mx-4 border-b bg-background/95 px-4 pt-3 pb-3 backdrop-blur-sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Programm</h1>
              <p className="text-muted-foreground">
                Total: {visibleSendungen.length} Sendungen
              </p>
              {senderAblaufe.length > 1 && selectedAblauf && (
                <div className="mt-2 flex items-center gap-2">
                  <label
                    htmlFor="ablauf-select"
                    className="text-sm text-muted-foreground"
                  >
                    Ablauf
                  </label>
                  <select
                    id="ablauf-select"
                    value={String(selectedAblauf.ablaufstart)}
                    onChange={(event) => {
                      const next = new URLSearchParams(searchParams)
                      next.set("ablauf", event.target.value)
                      setSearchParams(next, { replace: true })
                    }}
                    className="rounded-md border bg-background px-2 py-1.5 text-sm"
                  >
                    {senderAblaufe.map((ablauf) => (
                      <option
                        key={String(ablauf.ablaufstart ?? "")}
                        value={String(ablauf.ablaufstart)}
                      >
                        {ablauf.ablaufstart} - {ablauf.ablaufende}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <Tabs
              value={viewMode}
              onValueChange={(next) => setViewMode(next as ViewMode)}
            >
              <TabsList>
                <TabsTrigger value="list" className="gap-2">
                  <List size={14} />
                  <span>Liste</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <Calendar size={14} />
                  <span>Kalender</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Button
            ref={nowButtonRef}
            variant="ghost"
            onClick={() => {
              shouldAutoScrollToNow.current = true
              setViewMode("list")
            }}
            title="Zur aktuell laufenden Sendung"
            className="self-start"
          >
            Aktuell
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Alle", value: "all" },
            { label: "Heute", value: "today" },
            { label: "7 Tage", value: "7d" },
            { label: "30 Tage", value: "30d" },
            { label: "Zeitfenster", value: "custom" },
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={timeRange === option.value ? "default" : "outline"}
              onClick={() => setTimeRange(option.value as TimeRangePreset)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {timeRange === "custom" && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-muted-foreground">Von</label>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="rounded-md border bg-background px-2 py-1.5 text-sm"
            />
            <label className="text-sm text-muted-foreground">Bis</label>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="rounded-md border bg-background px-2 py-1.5 text-sm"
            />
          </div>
        )}
      </div>

      {visibleSendungen.length === 0 ? (
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
          sendungen={visibleSendungen}
          onSelectSendung={(sendung) => {
            if (sendung.sendung_id) navigate(`/sendungen/${sendung.sendung_id}`)
          }}
          listRef={listRef}
        />
      ) : (
        <EventCalendar01
          events={calendarEvents}
          initialView="week"
          onEventSelect={(event) => {
            const match = visibleSendungen.find(
              (sendung) => sendung.sendung_id === event.id
            )
            if (match && match.sendung_id) {
              navigate(`/sendungen/${match.sendung_id}`)
            }
          }}
        />
      )}
    </div>
  )
}
