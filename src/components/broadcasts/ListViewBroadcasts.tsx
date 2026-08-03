import { Card, CardContent } from "@/components/ui/card"
import { ImageWithFallback } from "@/components/ImageWithFallback"
import type { Sendung } from "@/types/struppi"
import { parseDateTime, formatDateLong, formatDateShort, formatTimeHM, isCurrentBroadcast } from "@/lib/utils"
import React from "react"

interface Props {
  sendungen: (Sendung & { sendung_key: string })[]
  onSelectSendung: (s: Sendung) => void
  listRef: React.RefObject<HTMLDivElement | null>
}

export function ListViewBroadcasts({ sendungen, onSelectSendung, listRef }: Props) {
  let lastDate = ""
  return (
    <div ref={listRef} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {sendungen.map((sendung) => {
        const dateKey = formatDateLong(parseDateTime(sendung.termin.start) || null)
        const showHeader = dateKey !== lastDate
        if (showHeader) lastDate = dateKey

        const start = parseDateTime(sendung.termin.start)
        const end = parseDateTime(sendung.termin.ende)
        const isCurrent = isCurrentBroadcast(start, end)

        return (
          <div key={sendung.sendung_key}>
            {showHeader && (
              <div className="py-2">
                <div className="text-sm font-semibold">{dateKey}</div>
              </div>
            )}

            <Card
              className={`cursor-pointer hover:shadow-lg transition-shadow ${isCurrent ? 'ring-2 ring-primary bg-accent/50' : ''}`}
              onClick={() => onSelectSendung(sendung)}
              data-time={sendung.termin.start}
              data-current={isCurrent ? 'true' : 'false'}
            >
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  <div className="hidden sm:block shrink-0">
                    <ImageWithFallback
                      links={sendung.medium?.find(m => 'bildmaterial' in m.mediumtyp)?.url}
                      alt={sendung.titel.termintitel}
                      size="md"
                      heightOnly
                      className="w-20"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <h3 className="font-semibold text-base truncate flex-1">{sendung.titel.termintitel}</h3>
                        <div className="ml-auto flex gap-2 shrink-0 flex-wrap justify-end">
                            {isCurrent && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive text-white">LIVE</span>
                            )}
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">{sendung.infos?.klassifizierung?.formatgruppe || '—'}</span>
                          </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateShort(start)} {formatTimeHM(start)} — {formatTimeHM(end)}
                    </p>

                    {sendung.text?.[0]?._text && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                        {sendung.text[0]._text}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}

