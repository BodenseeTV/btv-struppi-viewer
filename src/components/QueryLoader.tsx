import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useStruPPI } from "@/context/StruPPIContext"
import { loadXmlFromUrl } from "@/lib/xml-loader"

export default function QueryLoader() {
  const [searchParams] = useSearchParams()
  const {
    data,
    currentSender,
    setData,
    setSender,
    setIsLoading,
    setError,
    setXmlSource,
  } = useStruPPI()

  useEffect(() => {
    const xmlUrl = searchParams.get("url")
    const requestedSender = searchParams.get("sender")
    const forceRefresh = searchParams.has("refresh")

    if (!xmlUrl) {
      return
    }

    const safeXmlUrl = xmlUrl

    if (data && !forceRefresh) {
      const sender =
        data.programmdaten.sender?.find(
          (item) =>
            item.sender_ID === requestedSender ||
            item.senderkuerzel === requestedSender ||
            item.sendername === requestedSender
        ) ?? data.programmdaten.sender?.[0]

      if (sender && currentSender?.sendername !== sender.sendername) {
        setSender(sender)
      }
      return
    }

    let active = true

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const parsed = await loadXmlFromUrl(safeXmlUrl, { forceRefresh })
        if (!active) return

        setData(parsed)
        setXmlSource({ url: safeXmlUrl, type: "url", label: safeXmlUrl })

        const sender =
          parsed.programmdaten.sender?.find(
            (item) =>
              item.sender_ID === requestedSender ||
              item.senderkuerzel === requestedSender ||
              item.sendername === requestedSender
          ) ?? parsed.programmdaten.sender?.[0]

        if (sender) {
          setSender(sender)
        }
      } catch (err) {
        if (!active) return
        setError(
          err instanceof Error ? err.message : "Failed to load XML from url"
        )
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [
    currentSender,
    data,
    searchParams,
    setData,
    setError,
    setIsLoading,
    setSender,
    setXmlSource,
  ])

  return null
}
