import { Card, CardContent } from "@/components/ui/card"
import { ImageWithFallback } from "@/components/ImageWithFallback"
import type { Sendung } from "@/types/struppi"
import {
  parseDateTime,
  formatDateLong,
  formatDateShort,
  formatTimeHM,
  isCurrentBroadcast,
} from "@/lib/utils"
import React from "react"

interface Props {
  sendungen: (Sendung & { sendung_key: string })[]
  onSelectSendung: (s: Sendung) => void
  listRef: React.RefObject<HTMLDivElement | null>
}

export function ListViewBroadcasts({
  sendungen,
  onSelectSendung,
  listRef,
}: Props) {
  return (
    <div
      ref={listRef}
      className="max-h-[calc(100vh-260px)] space-y-3 overflow-y-auto pr-2"
    >
      {sendungen.map((sendung, index) => {
        const dateKey = formatDateLong(
          parseDateTime(sendung.termin.start) || null
        )
        const previousSendung = sendungen[index - 1]
        const previousDateKey = previousSendung
          ? formatDateLong(parseDateTime(previousSendung.termin.start) || null)
          : ""
        const showHeader = dateKey !== previousDateKey

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
              className={`cursor-pointer transition-shadow hover:shadow-lg ${isCurrent ? "bg-accent/50 ring-2 ring-primary" : ""}`}
              onClick={() => onSelectSendung(sendung)}
              data-time={sendung.termin.start}
              data-current={isCurrent ? "true" : "false"}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="hidden shrink-0 sm:block">
                    <ImageWithFallback
                      links={
                        sendung.medium?.find(
                          (m) => "bildmaterial" in m.mediumtyp
                        )?.url
                      }
                      alt={sendung.titel.termintitel}
                      size="md"
                      heightOnly
                      className="w-20"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="flex-1 truncate text-base font-semibold">
                        {sendung.titel.termintitel}
                      </h3>
                      <div className="ml-auto flex shrink-0 flex-wrap justify-end gap-2">
                        {isCurrent && (
                          <span className="inline-flex items-center rounded bg-destructive px-2 py-0.5 text-xs font-medium text-white">
                            LIVE
                          </span>
                        )}
                        <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {sendung.infos?.klassifizierung?.formatgruppe || "-"}
                        </span>
                      </div>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDateShort(start)} {formatTimeHM(start)} -{" "}
                      {formatTimeHM(end)}
                    </p>

                    {sendung.text?.[0]?._text && (
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
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
