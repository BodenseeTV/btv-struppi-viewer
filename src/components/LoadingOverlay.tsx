import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  isOpen: boolean
  message?: string
}

export function LoadingOverlay({
  isOpen,
  message = "Lädt...",
}: LoadingOverlayProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-white/10">
      <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 text-slate-900 shadow-lg dark:bg-slate-800 dark:text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}
