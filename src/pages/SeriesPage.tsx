import { useStruPPI } from "@/context/StruPPIContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
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

  const seriesMap = new Map<string, SeriesInfo>()

  currentSender.ablauf?.forEach((ablauf) => {
    ablauf.sendung.forEach((sendung) => {
      const seriesId = sendung.infos?.folge?.serien_ID
      const seriesTitle = sendung.titel.termintitel
      const staffel = sendung.infos?.folge?.staffel || 0
      
      let key: string
      let displayTitle: string
      let displaySeriesId: string | null = null

      if (seriesId) {
        key = seriesId
        displaySeriesId = seriesId
        displayTitle = seriesId
      } else {

        key = `${seriesTitle}_S${staffel}`
        displayTitle = `${seriesTitle}`
        if (staffel > 0) {
          displayTitle += ` (Staffel ${staffel})`
        }
      }

      if (!seriesMap.has(key)) {
        seriesMap.set(key, {
          seriesId: displaySeriesId,
          seriesTitle: displayTitle,
          sendungen: [],
          folgenanzahl: sendung.infos?.folge?.folgenanzahl,
          staffelanzahl: sendung.infos?.folge?.staffelanzahl,
          staffelNummer: staffel,
        })
      }
      seriesMap.get(key)!.sendungen.push(sendung)
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
               key={series.seriesTitle}
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
                   Erste Ausstrahlung: {formatDateLong(parseDateTime(series.sendungen[0]?.termin.start) || null)}
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
  const seasons = new Map<number, typeof series.sendungen>()
  series.sendungen.forEach((s) => {
    const num = s.infos?.folge?.staffel || 0
    if (!seasons.has(num)) seasons.set(num, [])
    seasons.get(num)!.push(s)
  })

  const seasonNumbers = Array.from(seasons.keys()).sort((a, b) => a - b)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{series.seriesTitle}</CardTitle>
            <CardDescription className="truncate">{series.sendungen.length} {series.sendungen.length === 1 ? 'Episode' : 'Episoden'}{series.staffelanzahl ? ` • ${series.staffelanzahl} Staffeln` : ''}</CardDescription>
          </div>
          <div>
            <Button onClick={onClose} variant="ghost">Schließen</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 96px)' }}>
          <div>
            <strong>Episoden:</strong>
            <div className="mt-3 space-y-3">
              {seasonNumbers.map((seasonNum) => (
                <div key={seasonNum}>
                  <div className="font-semibold mb-2">{seasonNum > 0 ? `Staffel ${seasonNum}` : 'Keine Staffelzuordnung'}</div>
                  <div className="space-y-2">
                    {seasons.get(seasonNum)!.sort((a, b) => {
                      const aNum = a.infos?.folge?.folgennummer || 0
                      const bNum = b.infos?.folge?.folgennummer || 0
                      return aNum - bNum
                    }).map((sendung, idx) => (
                      <div key={idx} className="p-3 bg-muted rounded text-sm">
                        <div className="font-semibold">
                          {sendung.infos?.folge?.folgennummer ? `Folge ${sendung.infos.folge.folgennummer}` : `Episode ${idx + 1}`}
                        </div>
                        <div className="text-muted-foreground mt-1">{sendung.titel.termintitel}</div>
                        <div className="text-xs text-muted-foreground mt-1">{formatDateLong(parseDateTime(sendung.termin.start) || null)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

