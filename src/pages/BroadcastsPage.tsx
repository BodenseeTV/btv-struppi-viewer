import { useStruPPI } from "@/context/StruPPIContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { AlertCircle } from "lucide-react"
import type { Sendung } from "@/types/struppi"
import { useState } from "react"

export function BroadcastsPage() {
  const { data, currentSender } = useStruPPI()
  const navigate = useNavigate()
  const [selectedSendung, setSelectedSendung] = useState<Sendung | null>(null)

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

  // Sort by start time
  allSendungen.sort((a, b) => {
    const dateA = new Date(a.termin.start)
    const dateB = new Date(b.termin.start)
    return dateA.getTime() - dateB.getTime()
  })

  return (
    <div className="space-y-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sendungen</h1>
        <p className="text-muted-foreground">Total: {allSendungen.length} Sendungen</p>
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
      ) : (
        <div className="space-y-4">
          {allSendungen.map((sendung) => (
            <Card
              key={sendung.sendung_key}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedSendung(sendung)}
            >
              <CardHeader>
                <CardTitle>{sendung.titel.termintitel}</CardTitle>
                <CardDescription>
                  {new Date(sendung.termin.start).toLocaleString('de-CH')} -{" "}
                  {new Date(sendung.termin.ende).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
                </CardDescription>
              </CardHeader>
              {(sendung.text?.[0]?._text || sendung.infos?.klassifizierung?.formatgruppe) && (
                <CardContent>
                  {sendung.text?.[0]?._text && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {sendung.text[0]._text}
                    </p>
                  )}
                  {sendung.infos?.klassifizierung?.formatgruppe && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {sendung.infos.klassifizierung.formatgruppe}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
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

function BroadcastDetailModal({ sendung, onClose }: { sendung: Sendung; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>{sendung.titel.termintitel}</CardTitle>
          <CardDescription>
            {new Date(sendung.termin.start).toLocaleString('de-CH')} -{" "}
            {new Date(sendung.termin.ende).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
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

          {sendung.medium && sendung.medium.length > 0 && (
            <div>
              <strong>Medien:</strong>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {sendung.medium.filter(m => 'bildmaterial' in m.mediumtyp).map((m, i) => (
                  <div key={i}>
                    <img
                      src={m.url?.[0]?.link}
                      alt={m.titel}
                      className="w-full rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
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

