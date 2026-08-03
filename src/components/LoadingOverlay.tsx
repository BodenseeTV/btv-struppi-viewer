import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  isOpen: boolean
  message?: string
}

export function LoadingOverlay({ isOpen, message = "Lädt..." }: LoadingOverlayProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg p-6 flex flex-col items-center gap-3 shadow-lg">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}

