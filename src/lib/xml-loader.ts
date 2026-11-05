import type { StruPPIParsed } from "@/types/struppi"
import { parseStruPPIXml } from "@/parsers/struppiParser"
import { normalizeXmlUrl, readCachedXml, writeCachedXml } from "@/lib/xml-cache"

export interface LoadXmlOptions {
  forceRefresh?: boolean
}

export async function loadXmlFromUrl(
  url: string,
  options: LoadXmlOptions = {}
): Promise<StruPPIParsed> {
  const normalizedUrl = normalizeXmlUrl(url)

  if (!normalizedUrl) {
    throw new Error("Keine XML-URL angegeben")
  }

  let xmlText = options.forceRefresh ? null : readCachedXml(normalizedUrl)

  if (!xmlText) {
    const response = await fetch(normalizedUrl)
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }

    xmlText = await response.text()
    writeCachedXml(normalizedUrl, xmlText)
  }

  return parseStruPPIXml(xmlText)
}
