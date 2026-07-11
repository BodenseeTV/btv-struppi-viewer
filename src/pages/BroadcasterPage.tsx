import { useStruPPI } from "@/context/StruPPIContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageWithFallback } from "@/components/ImageWithFallback"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { AlertCircle } from "lucide-react"

export function BroadcasterPage() {
  const { data, currentSender } = useStruPPI()
  const navigate = useNavigate()

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
    <div className="space-y-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <ImageWithFallback
              links={currentSender.senderlogo}
              alt={currentSender.sendername}
              size="md"
            />
            {currentSender.sendername}
          </CardTitle>
          <CardDescription>
            {currentSender.senderkategorie || "Sender"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentSender.senderkuerzel && (
            <div>
              <strong>Kürzel:</strong> {currentSender.senderkuerzel}
            </div>
          )}
          {currentSender.sprache && (
            <div>
              <strong>Sprache:</strong> {currentSender.sprache}
            </div>
          )}
          {currentSender.empfang && (
            <div>
              <strong>Empfang:</strong> {currentSender.empfang}
            </div>
          )}
          {currentSender.kontaktdaten && (
            <div>
              <strong>Kontakt:</strong> {currentSender.kontaktdaten}
            </div>
          )}
          {currentSender.sonstige_senderinfos && (
            <div>
              <strong>Info:</strong> {currentSender.sonstige_senderinfos}
            </div>
          )}
          {currentSender.url && currentSender.url.length > 0 && (
            <div>
              <strong>URLs:</strong>
              <ul className="list-disc pl-5 mt-2">
                {currentSender.url.map((link, idx) => (
                  <li key={idx}>
                    <a href={link.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {link.titel || link.link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => navigate("/broadcasts")} variant="outline">
          Zu den Sendungen
        </Button>
        <Button onClick={() => navigate("/series")} variant="outline">
          Zu den Serien
        </Button>
      </div>
    </div>
  )
}

