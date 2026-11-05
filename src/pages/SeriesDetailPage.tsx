import { useMemo } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { useStruPPI } from "@/context/StruPPIContext"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { formatDateLong, formatTimeHM, parseDateTime } from "@/lib/utils"
import type { Sendung } from "@/types/struppi"

function inferSeriesId(sendung: Sendung): string {
  const directId = sendung.infos?.folge?.serien_ID?.trim()
  if (directId) return directId

  const title = sendung.titel?.termintitel?.trim() ?? ""
  if (!title) return "unbekannt"

  const withoutEpisode = title.replace(/\s*,\s*Folge\s+\d+.*$/i, "").trim()
  return withoutEpisode || title
}

export function SeriesDetailPage() {
  const { serieId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data, currentSender } = useStruPPI()

  const season = searchParams.get("staffel")

  const seriesEntries = useMemo(() => {
    if (!data || !currentSender || !serieId) return []

    const normalizedTarget = decodeURIComponent(serieId)

    return (currentSender.ablauf ?? []).flatMap((ablauf) =>
      ablauf.sendung.filter((sendung) => {
        const id = sendung.infos?.folge?.serien_ID?.trim()
        const inferred = inferSeriesId(sendung)
        return (
          id === normalizedTarget ||
          inferred === normalizedTarget ||
          inferred.includes(normalizedTarget)
        )
      })
    )
  }, [currentSender, data, serieId])

  const filteredEntries = useMemo(() => {
    if (!season) return seriesEntries
    return seriesEntries.filter(
      (item) => String(item.infos?.folge?.staffel ?? "") === season
    )
  }, [season, seriesEntries])

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
            Zurück
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (seriesEntries.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle />
          </EmptyMedia>
          <EmptyTitle>Serie nicht gefunden</EmptyTitle>
          <EmptyDescription>
            Es wurde keine passende Serie im XML gefunden.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => navigate(-1)} variant="outline">
            Zurück
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const seriesTitle = filteredEntries[0]
    ? (filteredEntries[0].titel?.termintitel ?? "")
        .replace(/\s*,\s*Folge\s+\d+.*$/i, "")
        .trim() ||
      serieId ||
      "Serie"
    : serieId || "Serie"

  const seasonSet = Array.from(
    new Set(
      filteredEntries
        .map((item) => item.infos?.folge?.staffel)
        .filter((value): value is number => Boolean(value))
    )
  )

  return (
    <div className="page-shell">
      <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="size-4" />
        Zurück
      </Button>

      <Card>
        <CardHeader className="compact-card-header">
          <CardTitle className="text-2xl">{seriesTitle}</CardTitle>
          <CardDescription>
            {filteredEntries.length} Ausstrahlungen
          </CardDescription>
        </CardHeader>
        <CardContent className="compact-card-content space-y-3">
          {seasonSet.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {seasonSet.map((staffel) => (
                <Button
                  key={staffel}
                  variant={String(staffel) === season ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    navigate(`${location.pathname}?staffel=${staffel}`)
                  }
                >
                  Staffel {staffel}
                </Button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {filteredEntries
              .slice()
              .sort(
                (a, b) =>
                  (parseDateTime(a.termin.start)?.getTime() ?? 0) -
                  (parseDateTime(b.termin.start)?.getTime() ?? 0)
              )
              .map((entry) => {
                const start = parseDateTime(entry.termin.start)
                return (
                  <div key={entry.sendung_id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {entry.titel.termintitel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Folge {entry.infos?.folge?.folgennummer ?? "-"} •
                          Staffel {entry.infos?.folge?.staffel ?? "-"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/sendungen/${entry.sendung_id}`)
                        }
                      >
                        Details
                      </Button>
                    </div>
                    {start && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatDateLong(start)} • {formatTimeHM(start)}
                      </p>
                    )}
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
