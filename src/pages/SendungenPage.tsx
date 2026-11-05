import EventCalendar01, {
  type CalendarEvent,
} from "@/components/calendar-view/event-calendar-01"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
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
import { formatDateLong, formatTimeHM, parseDateTime } from "@/lib/utils"
import type { Sendung } from "@/types/struppi"
import { AlertCircle, Calendar, List } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

interface FolgeGroup {
  key: string
  title: string
  folge: any
  occurrences: Sendung[]
}

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

export function SendungenPage() {
  const { data, currentSender } = useStruPPI()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialViewMode = searchParams.get("view") === "calendar" ? "calendar" : "list"
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [timeRange, setTimeRange] = useState<TimeRangePreset>("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const allSendungen: Sendung[] = useMemo(() => {
    const result: Sendung[] = []
    currentSender?.ablauf?.forEach((ablauf) =>
      ablauf.sendung.forEach((s) => result.push(s))
    )
    return result
  }, [currentSender])

  const groups = useMemo(() => {
    const groupMap = new Map<string, FolgeGroup>()

    allSendungen.forEach((s) => {
      const folge = s.infos?.folge
      if (!folge) return
      const keyObj = {
        serien_ID: folge.serien_ID || null,
        staffel: folge.staffel || null,
        staffel_ID: folge.staffel_ID || null,
        folgennummer: folge.folgennummer || null,
      }
      const key = JSON.stringify(keyObj)
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          title: s.titel.termintitel || "Unbenannte Folge",
          folge,
          occurrences: [],
        })
      }
      groupMap.get(key)!.occurrences.push(s)
    })

    return groupMap
  }, [allSendungen])

  const list = useMemo(
    () =>
      Array.from(groups.values()).filter((group) =>
        group.occurrences.some((occurrence) =>
          matchesTimeRange(
            parseDateTime(occurrence.termin.start),
            timeRange,
            fromDate,
            toDate
          )
        )
      ),
    [fromDate, groups, timeRange, toDate]
  )

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = []

    list.forEach((group, index) => {
      const starts = group.occurrences
        .map((occurrence) => parseDateTime(occurrence.termin.start))
        .filter((date): date is Date => Boolean(date))
      const ends = group.occurrences
        .map((occurrence) => parseDateTime(occurrence.termin.ende))
        .filter((date): date is Date => Boolean(date))

      if (starts.length === 0 || ends.length === 0) return

      const start = new Date(Math.min(...starts.map((date) => date.getTime())))
      const end = new Date(Math.max(...ends.map((date) => date.getTime())))
      const durationMinutes = Math.max(
        0,
        Math.round((end.getTime() - start.getTime()) / 60000)
      )

      const primaryOccurrence = group.occurrences[0]

      events.push({
        id: `${group.key}-${index}`,
        title: group.title,
        description:
          primaryOccurrence?.text?.find((text) => text.textart === "Beschreibung")
            ?._text ?? "",
        start,
        end,
        allDay: durationMinutes >= 23 * 60,
        color: ["family", "business", "personal", "holiday", "etc"][
          index % 5
        ] as CalendarEvent["color"],
      })
    })

    return events
  }, [list])

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
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Sendungen</h1>
            <p className="text-muted-foreground">
              Anzahl einzigartige Sendungen: {list.length}
            </p>
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

        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 lg:flex-row lg:items-end lg:justify-between">
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
      </div>

      {list.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle />
            </EmptyMedia>
            <EmptyTitle>Keine Folgen gefunden</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {list.map((group) => {
            const starts = group.occurrences
              .map((o) => parseDateTime(o.termin.start))
              .filter(Boolean) as Date[]
            const ends = group.occurrences
              .map((o) => parseDateTime(o.termin.ende))
              .filter(Boolean) as Date[]
            const first = starts.length
              ? new Date(Math.min(...starts.map((d) => d.getTime())))
              : null
            const last = ends.length
              ? new Date(Math.max(...ends.map((d) => d.getTime())))
              : null
            const primaryId = group.occurrences[0]?.sendung_id

            return (
              <Card
                key={group.key}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => primaryId && navigate(`/sendungen/${primaryId}`)}
              >
                <CardHeader>
                  <CardTitle>{group.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription>
                    {first && last
                      ? formatDateLong(first) === formatDateLong(last)
                        ? `${formatDateLong(first)} ${formatTimeHM(first)} - ${formatTimeHM(last)}`
                        : `${formatDateLong(first)} ${formatTimeHM(first)} - ${formatDateLong(last)} ${formatTimeHM(last)}`
                      : "-"}
                  </CardDescription>
                  <CardDescription>
                    {`${group.occurrences.length} ${group.occurrences.length === 1 ? "Ausstrahlung" : "Ausstrahlungen"}`}
                  </CardDescription>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm text-muted-foreground">
                      {group.folge?.ausstrahlungsinfo || ""}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation()
                        if (primaryId) navigate(`/sendungen/${primaryId}`)
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EventCalendar01
          events={calendarEvents}
          initialView="week"
          onEventSelect={(event) => {
            const sendungId = event.id
            if (sendungId) {
              navigate(`/sendungen/${sendungId}`)
            }
          }}
        />
      )}
    </div>
  )
}

export default SendungenPage
