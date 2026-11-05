import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ChevronDownIcon, Upload, AlertCircle, Sun, Moon } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button.tsx"
import { Field, FieldGroup } from "@/components/ui/field.tsx"
import { parseStruPPIXml } from "@/parsers/struppiParser.ts"
import { useStruPPI } from "@/context/StruPPIContext"
import { useNavigate, useSearchParams } from "react-router-dom"
import { LoadingOverlay } from "@/components/LoadingOverlay"
import { useTheme } from "@/components/theme-provider"
import { loadXmlFromUrl as loadXmlByUrl } from "@/lib/xml-loader"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      variant="ghost"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  )
}

export function LoaderPage() {
  const btvUrl = "https://struppi.bodenseetv.ch/btv.xml"

  const [sourceType, setSourceType] = useState<"file" | "url">("url")
  const [sourceUrl, setSourceUrl] = useState<string>("")
  const [fileInput, setFileInput] = useState<File | null>(null)
  const {
    setData,
    setSender,
    setIsLoading,
    setError,
    isLoading,
    error,
    setXmlSource,
  } = useStruPPI()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const resolveSender = useCallback(
    (parsed: ReturnType<typeof parseStruPPIXml>, requestedSender: string | null) => {
      return (
        parsed.programmdaten.sender?.find(
          (item) =>
            item.sender_ID === requestedSender ||
            item.senderkuerzel === requestedSender ||
            item.sendername === requestedSender
        ) ?? parsed.programmdaten.sender?.[0]
      )
    },
    []
  )

  const loadXmlFromUrl = useCallback(
    async (url: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const parsed = await loadXmlByUrl(url)
        setData(parsed)
        setXmlSource({ url, type: "url", label: url })

        const requestedSender = searchParams.get("sender")
        const selectedSender = resolveSender(parsed, requestedSender)
        if (selectedSender) {
          setSender(selectedSender)
        }

        const nextParams = new URLSearchParams(searchParams)
        nextParams.set("url", url)
        if (selectedSender) {
          nextParams.set(
            "sender",
            selectedSender.sender_ID ?? selectedSender.sendername
          )
        }

        navigate(`/programm?${nextParams.toString()}`, { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load XML")
      } finally {
        setIsLoading(false)
      }
    },
    [navigate, resolveSender, searchParams, setData, setError, setIsLoading, setSender, setXmlSource]
  )

  useEffect(() => {
    const xmlUrl = searchParams.get("url")
    const xmlFile = searchParams.get("file")

    if (xmlUrl) {
      setSourceUrl(xmlUrl)
      setSourceType("url")
      void loadXmlFromUrl(xmlUrl)
    } else if (xmlFile) {
      setSourceUrl(xmlFile)
      setSourceType("url")
      void loadXmlFromUrl(xmlFile)
    }
  }, [loadXmlFromUrl, searchParams])

  async function loadXmlFromFile(file: File) {
    setIsLoading(true)
    setError(null)
    try {
      const text = await file.text()
      const parsed = parseStruPPIXml(text)
      setData(parsed)
      setXmlSource({ url: file.name, type: "file", label: file.name })

      const firstSender = parsed.programmdaten.sender?.[0]
      if (firstSender) {
        setSender(firstSender)
      }

      navigate(`/broadcaster`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load XML file")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLoad() {
    if (sourceType === "url" && sourceUrl) {
      await loadXmlFromUrl(sourceUrl)
    } else if (sourceType === "file" && fileInput) {
      await loadXmlFromFile(fileInput)
    }
  }

  return (
    <>
      <LoadingOverlay
        isOpen={isLoading}
        message="XML wird geladen und geparst..."
      />
      <Empty>
        <EmptyHeader>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
              <EmptyMedia variant="icon">
                {error ? <AlertCircle className="text-red-500" /> : <Upload />}
              </EmptyMedia>
              <div>
                <EmptyTitle>
                  {error ? "Fehler beim Laden" : "StruPPI XML laden"}
                </EmptyTitle>
                <EmptyDescription>
                  {error ||
                    "Bitte wähle ein StruPPI XML aus oder gebe eine URL ein"}
                </EmptyDescription>
              </div>
            </div>
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <FieldGroup>
            <Field>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <InputGroupButton
                          variant="ghost"
                          className="pr-1.5! text-xs"
                          disabled={isLoading}
                        >
                          {sourceType}
                          <ChevronDownIcon className="size-3" />
                        </InputGroupButton>
                      }
                    />
                    <DropdownMenuContent
                      align="start"
                      sideOffset={8}
                      alignOffset={-4}
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setSourceType("file")}>
                          Datei
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSourceType("url")}>
                          URL
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </InputGroupAddon>
                {sourceType === "url" ? (
                  <InputGroupInput
                    placeholder={btvUrl}
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    disabled={isLoading}
                  />
                ) : (
                  <InputGroupInput
                    type={"file"}
                    accept=".xml"
                    onChange={(e) => setFileInput(e.target.files?.[0] || null)}
                    disabled={isLoading}
                  />
                )}
              </InputGroup>
            </Field>
            <Field orientation="vertical">
              <Button
                variant={"secondary"}
                disabled={sourceUrl === btvUrl || isLoading}
                onClick={() => setSourceUrl(btvUrl)}
                type="submit"
              >
                BodenseeTV StruPPI
              </Button>
            </Field>
            <Field orientation="vertical">
              <Button
                onClick={handleLoad}
                type="submit"
                disabled={
                  isLoading ||
                  (!sourceUrl && sourceType === "url") ||
                  (!fileInput && sourceType === "file")
                }
              >
                {isLoading ? "Lädt..." : "StruPPI laden"}
              </Button>
            </Field>
          </FieldGroup>
        </EmptyContent>
      </Empty>
    </>
  )
}
