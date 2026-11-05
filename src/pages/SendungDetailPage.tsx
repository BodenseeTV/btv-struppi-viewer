import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
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

export function SendungDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, currentSender } = useStruPPI()

  const sendung = useMemo(() => {
    if (!data || !currentSender) return null

    for (const ablauf of currentSender.ablauf ?? []) {
      const match = ablauf.sendung.find((item) => item.sendung_id === id)
      if (match) return match
    }

    return null
  }, [currentSender, data, id])

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

  if (!sendung) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle />
          </EmptyMedia>
          <EmptyTitle>Sendung nicht gefunden</EmptyTitle>
          <EmptyDescription>
            Die angegebene Sendung konnte nicht geladen werden.
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

  const start = parseDateTime(sendung.termin.start)
  const end = parseDateTime(sendung.termin.ende)

  return (
    <div className="page-shell">
      <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="size-4" />
        Zurück
      </Button>

      <Card>
        <CardHeader className="compact-card-header">
          <CardTitle className="text-2xl">
            {sendung.titel?.termintitel || "Unbenannte Sendung"}
          </CardTitle>
          <CardDescription>
            {sendung.sendung_id} • {currentSender.sendername}
          </CardDescription>
        </CardHeader>
        <CardContent className="compact-card-content space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Start</p>
              <p>
                {start
                  ? `${formatDateLong(start)} ${formatTimeHM(start)}`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ende</p>
              <p>{end ? `${formatDateLong(end)} ${formatTimeHM(end)}` : "-"}</p>
            </div>
          </div>

          {sendung.infos?.folge && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Folge</p>
                <p>{sendung.infos.folge.folgennummer ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Staffel</p>
                <p>{sendung.infos.folge.staffel ?? "-"}</p>
              </div>
            </div>
          )}

          {sendung.infos?.klassifizierung && (
            <div>
              <p className="text-sm text-muted-foreground">Formatgruppe</p>
              <p>{sendung.infos.klassifizierung.formatgruppe || "-"}</p>
            </div>
          )}

          {sendung.text && sendung.text.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Text</p>
              <p>
                {sendung.text
                  .map((item) => item._text || item.textart)
                  .join(" • ")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
