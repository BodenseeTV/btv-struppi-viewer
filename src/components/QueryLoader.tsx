import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useStruPPI } from "@/context/StruPPIContext"
import { parseStruPPIXml } from "@/parsers/struppiParser"

export default function QueryLoader() {
  const [searchParams] = useSearchParams()
  const { data, setData, setSender, setIsLoading, setError } = useStruPPI()

  useEffect(() => {
    const xmlUrl = searchParams.get("url")
    if (!xmlUrl) return
    const url = xmlUrl
    // If data already loaded, do nothing
    if (data) return

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)
        const text = await res.text()
        const parsed = parseStruPPIXml(text)
        setData(parsed)
        const firstSender = parsed.programmdaten.sender?.[0]
        if (firstSender) setSender(firstSender)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load XML from url")
      } finally {
        setIsLoading(false)
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return null
}

