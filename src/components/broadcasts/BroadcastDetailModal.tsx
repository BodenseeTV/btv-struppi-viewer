import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { Sendung } from "@/types/struppi"
import { parseDateTime, formatDateLong, formatTimeHM } from "@/lib/utils"
import { ExternalId } from "@/components/ExternalId"

export function BroadcastDetailModal({ sendung, onClose }: { sendung: Sendung; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{sendung.titel.termintitel}</CardTitle>
            <CardDescription className="truncate">{formatDateLong(parseDateTime(sendung.termin.start))} {formatTimeHM(parseDateTime(sendung.termin.start))} - {formatTimeHM(parseDateTime(sendung.termin.ende))}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {sendung.externe_id && sendung.externe_id.length > 0 && (
              <ExternalId ids={sendung.externe_id} />
            )}
            <button aria-label="Schließen" onClick={onClose} className="p-2 rounded hover:bg-muted">
              <X />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 96px)' }}>
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
                {sendung.infos.klassifizierung?.hauptgenre && (<li>{sendung.infos.klassifizierung.hauptgenre}</li>)}
                {sendung.infos.klassifizierung?.genre?.map((g, i) => (<li key={i}>{g}</li>))}
              </ul>
            </div>
          )}
          {sendung.mitwirkende?.mitwirkender && sendung.mitwirkende.mitwirkender.length > 0 && (
            <div>
              <strong>Mitwirkende:</strong>
              <ul className="list-disc pl-5 mt-1 text-sm">
                {sendung.mitwirkende.mitwirkender.slice(0, 5).map((m, i) => (
                  <li key={i}>{m.mitwirkendentyp?.person?.name?.name || m.mitwirkendentyp?.gruppe?.name || "Unbekannt"} ({m.funktion})</li>
                ))}
                {sendung.mitwirkende.mitwirkender.length > 5 && (<li>... und {sendung.mitwirkende.mitwirkender.length - 5} weitere</li>)}
              </ul>
            </div>
          )}
          {sendung.medium && sendung.medium.filter(m => 'bildmaterial' in m.mediumtyp).length > 0 && (
            <div>
              <strong>Medien:</strong>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {sendung.medium.filter(m => 'bildmaterial' in m.mediumtyp).map((m, i) => (
                  <div key={i}>
                    <img
                      src={m.url?.[0]?.link}
                      alt={m.titel}
                      className="w-full rounded"
                      onError={(e) => { e.currentTarget.style.display = "none" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="pt-2">
            <Button onClick={onClose} className="w-full mt-2" variant="outline">Schließen</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

