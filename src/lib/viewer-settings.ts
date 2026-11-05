export interface ViewerSettings {
  hideHeader: boolean
  hideRefresh: boolean
  hideSource: boolean
  hideSenderSelection: boolean
  isEmbedded: boolean
  senderParam: string | null
  ablaufParam: string | null
  viewParam: string | null
}

export function getViewerSettings(
  searchParams: URLSearchParams
): ViewerSettings {
  const toBool = (value: string | null) => {
    if (!value) return false
    return ["1", "true", "yes", "on"].includes(value.toLowerCase())
  }

  return {
    hideHeader:
      toBool(searchParams.get("hideHeader")) ||
      toBool(searchParams.get("hideTopbar")) ||
      toBool(searchParams.get("embed")),
    hideRefresh:
      toBool(searchParams.get("hideRefresh")) ||
      toBool(searchParams.get("refreshDisabled")),
    hideSource:
      toBool(searchParams.get("hideSource")) ||
      toBool(searchParams.get("hideSourceInfo")),
    hideSenderSelection:
      toBool(searchParams.get("hideSenderSelection")) ||
      toBool(searchParams.get("hideSender")),
    isEmbedded:
      toBool(searchParams.get("iframe")) || toBool(searchParams.get("embed")),
    senderParam: searchParams.get("sender"),
    ablaufParam:
      searchParams.get("ablauf") ??
      searchParams.get("schedule") ??
      searchParams.get("lauf"),
    viewParam: searchParams.get("view") ?? searchParams.get("page"),
  }
}
