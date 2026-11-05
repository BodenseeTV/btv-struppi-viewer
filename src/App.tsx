import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useSearchParams,
} from "react-router-dom"
import { useEffect } from "react"
import { StruPPIProvider, useStruPPI } from "@/context/StruPPIContext"
import { MainLayout } from "@/layouts/MainLayout"
import { LoaderPage } from "@/pages/LoaderPage"
import { BroadcasterPage } from "@/pages/BroadcasterPage"
import { BroadcastsPage } from "@/pages/BroadcastsPage"
import { SendungenPage } from "@/pages/SendungenPage"
import { SendungDetailPage } from "@/pages/SendungDetailPage"
import { SeriesPage } from "@/pages/SeriesPage"
import { SeriesDetailPage } from "@/pages/SeriesDetailPage"
import QueryLoader from "@/components/QueryLoader"

function ViewerMetaUpdater() {
  const { currentSender } = useStruPPI()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const senderName = currentSender?.sendername || "StruPPI Viewer"
    const pageName = location.pathname.replace("/", "") || "Startseite"
    const isEmbedded = Boolean(
      searchParams.get("hideHeader") ||
      searchParams.get("embed") ||
      searchParams.get("iframe")
    )

    document.title = isEmbedded
      ? `${senderName} | Embedded View`
      : `${senderName}${pageName && pageName !== "" && pageName !== "/" ? ` | ${pageName}` : ""}`

    const candidateIcon = currentSender?.senderlogo?.find((link) => !!link.link)?.link
    const resolvedIcon = (() => {
      if (!candidateIcon) return "/favicon.svg"

      try {
        const parsed = new URL(candidateIcon, window.location.origin)
        return parsed.toString()
      } catch {
        return candidateIcon.startsWith("/")
          ? `${window.location.origin}${candidateIcon}`
          : candidateIcon
      }
    })()

    const favicon = document.querySelector(
      "link[rel='icon']"
    ) as HTMLLinkElement | null
    const faviconType = resolvedIcon.toLowerCase().endsWith(".svg")
      ? "image/svg+xml"
      : resolvedIcon.toLowerCase().endsWith(".png")
        ? "image/png"
        : resolvedIcon.toLowerCase().endsWith(".ico")
          ? "image/x-icon"
          : "image/png"

    if (favicon) {
      favicon.setAttribute("type", faviconType)
      favicon.setAttribute("sizes", "32x32")
      favicon.setAttribute("href", resolvedIcon)
    } else {
      const newFavicon = document.createElement("link")
      newFavicon.setAttribute("rel", "icon")
      newFavicon.setAttribute("type", faviconType)
      newFavicon.setAttribute("sizes", "32x32")
      newFavicon.setAttribute("href", resolvedIcon)
      document.head.appendChild(newFavicon)
    }
  }, [currentSender, location.pathname, searchParams])

  return null
}

function AppShell() {
  return (
    <>
      <QueryLoader />
      <ViewerMetaUpdater />
      <Routes>
        <Route path="/" element={<LoaderPage />} />
        <Route element={<MainLayout />}>
          <Route path="/broadcaster" element={<BroadcasterPage />} />
          <Route path="/programm" element={<BroadcastsPage />} />
          <Route path="/sendungen" element={<SendungenPage />} />
          <Route path="/sendungen/:id" element={<SendungDetailPage />} />
          <Route path="/series" element={<SeriesPage />} />
          <Route path="/series/:serieId" element={<SeriesDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export function App() {
  return (
    <StruPPIProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <AppShell />
      </Router>
    </StruPPIProvider>
  )
}

export default App
