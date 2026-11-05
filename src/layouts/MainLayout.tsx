import { Outlet, useSearchParams } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { getViewerSettings } from "@/lib/viewer-settings"

export function MainLayout() {
  const [searchParams] = useSearchParams()
  const settings = getViewerSettings(searchParams)
  const isEmbeddedMode = settings.isEmbedded || settings.hideHeader

  const openFullViewer = () => {
    const nextUrl = new URL(window.location.href)
    ;[
      "hideHeader",
      "hideTopbar",
      "iframe",
      "embed",
      "hideRefresh",
      "hideSource",
      "hideSenderSelection",
      "hideSender",
      "hideSourceInfo",
      "refreshDisabled",
    ].forEach((key) => nextUrl.searchParams.delete(key))

    window.open(nextUrl.toString(), "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!settings.hideHeader && <Navbar />}
      <main className="container mx-auto max-w-6xl flex-1 px-4">
        <Outlet />
      </main>

      {isEmbeddedMode && (
        <div className="fixed right-4 bottom-4 z-50">
          <Button
            size="sm"
            onClick={openFullViewer}
            className="gap-2 shadow-lg"
          >
            <ArrowUpRight className="size-4" />
            Vollansicht
          </Button>
        </div>
      )}
    </div>
  )
}
