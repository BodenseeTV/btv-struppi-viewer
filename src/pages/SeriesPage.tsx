import { useStruPPI } from "@/context/StruPPIContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { AlertCircle } from "lucide-react"
import type { Sendung } from "@/types/struppi"
import { useState } from "react"

interface SeriesInfo {
  seriesId: string
  seriesTitle: string
  sendungen: Sendung[]
  folgenanzahl?: number
  staffelanzahl?: number
}

export function SeriesPage() {
  const { data, currentSender } = useStruPPI()
  const navigate = useNavigate()
  const [selectedSeries, setSelectedSeries] = useState<SeriesInfo | null>(null)

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

  // Group broadcasts by series_ID
  const seriesMap = new Map<string, SeriesInfo>()

  currentSender.ablauf?.forEach((ablauf) => {
    ablauf.sendung.forEach((sendung) => {
      const seriesId = sendung.infos?.folge?.serien_ID
      if (seriesId) {
        if (!seriesMap.has(seriesId)) {
          seriesMap.set(seriesId, {
            seriesId,
            seriesTitle: sendung.titel.termintitel,
            sendungen: [],
            folgenanzahl: sendung.infos?.folge?.folgenanzahl,
            staffelanzahl: sendung.infos?.folge?.staffelanzahl,
          })
        }
        seriesMap.get(seriesId)!.sendungen.push(sendung)
      }
    })
  })

  const seriesList = Array.from(seriesMap.values()).sort((a, b) =>
    a.seriesTitle.localeCompare(b.seriesTitle)
  )

  return (
    <div className="space-y-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Serien</h1>
        <p className="text-muted-foreground">Total: {seriesList.length} Serien</p>
      </div>

      {seriesList.length === 0 ? (
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
          {seriesList.map((series) => (
            <Card
              key={series.seriesId}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedSeries(series)}
            >
              <CardHeader>
                <CardTitle>{series.seriesTitle}</CardTitle>
                <CardDescription>
                  {series.sendungen.length} Episode(n)
                  {series.staffelanzahl && ` • ${series.staffelanzahl} Staffel(n)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Erste Ausstrahlung: {new Date(series.sendungen[0]?.termin.start).toLocaleDateString('de-CH')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedSeries && (
        <SeriesDetailModal
          series={selectedSeries}
          onClose={() => setSelectedSeries(null)}
        />
      )}
    </div>
  )
}

function SeriesDetailModal({ series, onClose }: { series: SeriesInfo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>{series.seriesTitle}</CardTitle>
          <CardDescription>
            {series.sendungen.length} Episode(n)
            {series.staffelanzahl && ` • ${series.staffelanzahl} Staffel(n)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Episoden:</strong>
            <div className="mt-3 space-y-2">
              {series.sendungen.sort((a, b) => {
                const aNum = a.infos?.folge?.folgennummer || 0
                const bNum = b.infos?.folge?.folgennummer || 0
                return aNum - bNum
              }).map((sendung, idx) => (
                <div key={idx} className="p-3 bg-muted rounded text-sm">
                  <div className="font-semibold">
                    {sendung.infos?.folge?.folgennummer ? `Folge ${sendung.infos.folge.folgennummer}` : `Episode ${idx + 1}`}
                    {sendung.infos?.folge?.staffel && ` (Staffel ${sendung.infos.folge.staffel})`}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {sendung.titel.termintitel}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(sendung.termin.start).toLocaleString('de-CH')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={onClose} className="w-full mt-4" variant="outline">
            Schließen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

