import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  isOpen: boolean
  message?: string
}

export function LoadingOverlay({ isOpen, message = "Lädt..." }: LoadingOverlayProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}

