import { useStruPPI } from "@/context/StruPPIContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { AlertCircle } from "lucide-react"
import type { Sendung } from "@/types/struppi"
import { parseDateTime, formatDateLong, formatTimeHM } from "@/lib/utils"
import { useState } from "react"

interface FolgeGroup {
  key: string
  title: string
  folge: any
  occurrences: Sendung[]
}

export function SendungenPage() {
  const { data, currentSender } = useStruPPI()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<FolgeGroup | null>(null)

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

  const allSendungen: Sendung[] = []
  currentSender.ablauf?.forEach((ablauf) => ablauf.sendung.forEach((s) => allSendungen.push(s)))

  const groups = new Map<string, FolgeGroup>()

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
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title: s.titel.termintitel || "Unbenannte Folge",
        folge,
        occurrences: [],
      })
    }
    groups.get(key)!.occurrences.push(s)
  })

  const list = Array.from(groups.values())

  return (
    <div className="space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Sendungen</h1>
        <p className="text-muted-foreground">Anzahl einzigartige Sendungen: {list.length}</p>
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
      ) : (
        <div className="space-y-3">
          {list.map((group) => {
            const starts = group.occurrences.map(o => parseDateTime(o.termin.start)).filter(Boolean) as Date[]
            const ends = group.occurrences.map(o => parseDateTime(o.termin.ende)).filter(Boolean) as Date[]
            const first = starts.length ? new Date(Math.min(...starts.map(d => d.getTime()))) : null
            const last = ends.length ? new Date(Math.max(...ends.map(d => d.getTime()))) : null

            return (
              <Card key={group.key} className="cursor-pointer" onClick={() => setSelected(group)}>
                <CardHeader>
                  <CardTitle>{group.title}</CardTitle>
                  
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {first && last ? 
                    (formatDateLong(first) === formatDateLong(last) 
                    ? `${formatDateLong(first)} ${formatTimeHM(first)} - ${formatTimeHM(last)}` 
                    : `${formatDateLong(first)} ${formatTimeHM(first)} - ${formatDateLong(last)} ${formatTimeHM(last)}`) : '-'}
                  </CardDescription>
                  <CardDescription>
                    {`${group.occurrences.length} ${group.occurrences.length === 1 ? 'Ausstrahlung' : 'Ausstrahlungen'}`}
                  </CardDescription>
                  <p className="text-sm text-muted-foreground truncate">{group.folge?.ausstrahlungsinfo || ''}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
          <Card className="w-full max-w-2xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
              <CardHeader className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle>{selected.title}</CardTitle>
                  <CardDescription>{selected.occurrences.length} {selected.occurrences.length === 1 ? 'Ausstrahlung' : 'Ausstrahlungen'}</CardDescription>
                </div>
                <div>
                  <Button onClick={() => setSelected(null)} variant="ghost">Schliessen</Button>
                </div>
              </CardHeader>
            <CardContent className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 96px)' }}>
              <div className="space-y-2">
                {selected.occurrences.sort((a,b)=> (parseDateTime(a.termin.start)?.getTime()||0) - (parseDateTime(b.termin.start)?.getTime()||0)).map((o, i) => (
                  <div key={i} className="p-2 bg-muted rounded">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{formatDateLong(parseDateTime(o.termin.start) || null)}</div>
                      <div className="text-xs text-muted-foreground">{formatTimeHM(parseDateTime(o.termin.start) || null)} — {formatTimeHM(parseDateTime(o.termin.ende) || null)}</div>
                    </div>
                    {o.termin.wiederholung && o.termin.wiederholung.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">Wiederholungen in Termin: {o.termin.wiederholung.length}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default SendungenPage

