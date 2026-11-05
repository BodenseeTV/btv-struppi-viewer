import { useStruPPI } from "@/context/StruPPIContext"
import { useNavigate } from "react-router-dom"
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
import { AlertCircle } from "lucide-react"
import type { Sendung } from "@/types/struppi"
import { useState } from "react"
import { parseDateTime, formatDateLong } from "@/lib/utils"

interface SeriesInfo {
  seriesId: string | null
  seriesTitle: string
  sendungen: Sendung[]
  folgenanzahl?: number
  staffelanzahl?: number
  staffelNummer?: number
}

function inferSeriesId(sendung: Sendung): string {
  const directId = sendung.infos?.folge?.serien_ID?.trim()
  if (directId) return directId

  const title = sendung.titel?.termintitel?.trim() ?? ""
  if (!title) return "unbekannt"

  const withoutEpisode = title.replace(/\s*,\s*Folge\s+\d+.*$/i, "").trim()
  return withoutEpisode || title
}

export function SeriesPage() {
  const { data, currentSender } = useStruPPI()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

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

  const seriesMap = new Map<string, SeriesInfo>()

  currentSender.ablauf?.forEach((ablauf) => {
    ablauf.sendung.forEach((sendung) => {
      const seriesId = inferSeriesId(sendung)
      const staffel = sendung.infos?.folge?.staffel || 0

      if (!seriesMap.has(seriesId)) {
        seriesMap.set(seriesId, {
          seriesId,
          seriesTitle: seriesId,
          sendungen: [],
          folgenanzahl: sendung.infos?.folge?.folgenanzahl,
          staffelanzahl: sendung.infos?.folge?.staffelanzahl,
          staffelNummer: staffel,
        })
      }

      seriesMap.get(seriesId)!.sendungen.push(sendung)
    })
  })

  const seriesList = Array.from(seriesMap.values()).sort((a, b) =>
    a.seriesTitle.localeCompare(b.seriesTitle)
  )

  const filteredSeriesList = seriesList.filter((series) =>
    series.seriesTitle.toLowerCase().includes(searchTerm.trim().toLowerCase())
  )

  return (
    <div className="page-shell">
      <div className="mb-4 space-y-2">
        <h1 className="mb-2 text-3xl font-bold">Serien</h1>
        <p className="text-muted-foreground">
          Total: {filteredSeriesList.length} Serien
        </p>
        <div className="max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Serie suchen..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {filteredSeriesList.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle />
            </EmptyMedia>
            <EmptyTitle>Keine Serien gefunden</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {filteredSeriesList.map((series) => (
            <Card
              key={series.seriesTitle}
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() =>
                navigate(
                  `/series/${encodeURIComponent(series.seriesId || series.seriesTitle)}`
                )
              }
            >
              <CardHeader>
                <CardTitle>{series.seriesTitle}</CardTitle>
                <CardDescription>
                  {series.sendungen.length} Episode(n)
                  {series.staffelanzahl &&
                    ` • ${series.staffelanzahl} Staffel(n)`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Erste Ausstrahlung:{" "}
                  {formatDateLong(
                    parseDateTime(series.sendungen[0]?.termin.start) || null
                  )}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation()
                    navigate(
                      `/series/${encodeURIComponent(series.seriesId || series.seriesTitle)}`
                    )
                  }}
                >
                  Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
