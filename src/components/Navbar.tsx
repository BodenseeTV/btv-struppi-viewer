import React from "react"
import { Button } from "@/components/ui/button"
import { Blocks, Moon, Sun, Menu, X, RefreshCw } from "lucide-react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useStruPPI } from "@/context/StruPPIContext"
import { ImageWithFallback } from "@/components/ImageWithFallback"
import { useTheme } from "@/components/theme-provider"
import { formatDateTimeLong, parseDateTime } from "@/lib/utils"
import { getViewerSettings } from "@/lib/viewer-settings"
import { normalizeXmlUrl } from "@/lib/xml-cache"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data, currentSender, reset, xmlSource } = useStruPPI()
  const settings = getViewerSettings(searchParams)

  const isLoaded = !!data && !!currentSender

  const navLinks = [
    { name: "Sender", path: "/broadcaster" },
    { name: "Programm", path: "/programm" },
    { name: "Sendungen", path: "/sendungen" },
    { name: "Serien", path: "/series" },
  ]
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const senderOptions = data?.programmdaten?.sender ?? []
  const selectedSenderId =
    currentSender?.sender_ID ?? currentSender?.sendername ?? ""

  const handleReset = () => {
    reset()
    navigate("/", { replace: true })
  }

  const handleRefresh = () => {
    const next = new URLSearchParams(searchParams)
    next.set("refresh", "1")
    setSearchParams(next, { replace: true })
  }

  const handleSenderChange = (senderName: string) => {
    const next = new URLSearchParams(searchParams)
    next.set("sender", senderName)
    setSearchParams(next, { replace: true })

    const sender = senderOptions.find(
      (item) =>
        item.sender_ID === senderName ||
        item.sendername === senderName ||
        item.senderkuerzel === senderName
    )
    if (sender) {
      navigate(`${location.pathname}?${next.toString()}`, { replace: true })
    }
  }

  const generierungsdatum = data?.programmdaten?.generierungsdatum
    ? formatDateTimeLong(
        parseDateTime(data.programmdaten.generierungsdatum) || null
      )
    : null

  const { theme, setTheme } = useTheme()
  const xmlSourceUrl = xmlSource?.url ? normalizeXmlUrl(xmlSource.url) : ""
  const xmlSourceHost = (() => {
    try {
      const candidate = xmlSourceUrl
        ? new URL(xmlSourceUrl).hostname
        : xmlSource?.url || ""
      const normalized = candidate.toLowerCase()
      if (
        ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(normalized) ||
        !candidate
      ) {
        return ""
      }
      return candidate
    } catch {
      const fallback = xmlSource?.url || ""
      if (
        !fallback ||
        fallback.startsWith("/") ||
        fallback.includes("localhost") ||
        fallback.includes("127.0.0.1")
      ) {
        return ""
      }
      return fallback
    }
  })()

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (settings.hideHeader) {
    return null
  }

  return (
    <nav className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 sm:px-6">
      <div
        className="flex min-w-0 shrink-0 cursor-pointer items-center gap-2 sm:gap-3"
        onClick={() =>
          isLoaded ? navigate(`/broadcaster${location.search}`) : navigate(`/`)
        }
      >
        {isLoaded && currentSender?.senderlogo ? (
          <ImageWithFallback
            links={currentSender.senderlogo}
            alt={currentSender.sendername}
            size="sm"
            heightOnly
            className="h-8 sm:h-10"
          />
        ) : (
          <Blocks size={20} className="sm:h-[26px] sm:w-[26px]" />
        )}
        <div className="min-w-0 leading-tight">
          <div className="truncate text-base font-semibold sm:text-lg">
            {currentSender?.sendername || "StruPPI Viewer"}
          </div>
          {generierungsdatum && (
            <p className="hidden text-xs text-muted-foreground sm:block">
              Generiert: {generierungsdatum}
            </p>
          )}
        </div>
      </div>

      {isLoaded && (
        <>
          {!settings.hideSenderSelection && senderOptions.length > 1 && (
            <div className="hidden min-w-[180px] md:block">
              <select
                value={selectedSenderId}
                onChange={(event) => handleSenderChange(event.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none"
              >
                {senderOptions.map((sender) => (
                  <option
                    key={sender.sender_ID ?? sender.sendername}
                    value={sender.sender_ID ?? sender.sendername}
                  >
                    {sender.sendername}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="hidden items-center space-x-2 md:flex">
            {navLinks.map((link) => (
              <Button
                key={link.name}
                variant={location.pathname === link.path ? "default" : "ghost"}
                onClick={() => navigate(`${link.path}${location.search}`)}
                className="text-xs sm:text-sm"
                size="sm"
              >
                {link.name}
              </Button>
            ))}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="h-8 w-8"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </Button>
            {mobileOpen && (
              <div className="absolute top-14 right-3 z-50 rounded border bg-popover p-2 shadow-md">
                <div className="flex flex-col gap-2">
                  {!settings.hideSenderSelection &&
                    senderOptions.length > 1 && (
                      <div className="px-1 pb-1">
                        <select
                          value={selectedSenderId}
                          onChange={(event) =>
                            handleSenderChange(event.target.value)
                          }
                          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                        >
                          {senderOptions.map((sender) => (
                            <option
                              key={sender.sender_ID ?? sender.sendername}
                              value={sender.sender_ID ?? sender.sendername}
                            >
                              {sender.sendername}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  {navLinks.map((link) => (
                    <Button
                      key={link.name}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMobileOpen(false)
                        navigate(`${link.path}${location.search}`)
                      }}
                      className="justify-start"
                    >
                      {link.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {!settings.hideSource && xmlSource?.url && xmlSourceHost && (
          <div
            className="hidden max-w-[220px] truncate text-[10px] text-muted-foreground lg:block"
            title={xmlSource.url}
          >
            {xmlSourceHost}
          </div>
        )}

        {!settings.hideRefresh && xmlSource?.url && (
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="h-8 w-8"
          >
            <RefreshCw size={16} />
          </Button>
        )}

        <Button
          onClick={toggleTheme}
          variant="ghost"
          size="sm"
          className="h-8 w-8"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </Button>

        {isLoaded && (
          <Button
            className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
            variant="outline"
            onClick={handleReset}
          >
            <span className="hidden sm:inline">Neues XML</span>
            <span className="sm:hidden">XML</span>
          </Button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
