import { Badge } from "@/components/ui/badge"
import type { ExterneId } from "@/types/struppi"

export function ExternalId({ ids }: { ids?: ExterneId[] }) {
  if (!ids || ids.length === 0) return null
  return (
    <div className="flex gap-2 flex-wrap">
      {ids.map((e, i) => (
        <Badge key={i} variant="secondary" className="shrink-0">
          {e.quelle ? `${e.quelle}: ${e.externe_id}` : e.externe_id}
        </Badge>
      ))}
    </div>
  )
}

