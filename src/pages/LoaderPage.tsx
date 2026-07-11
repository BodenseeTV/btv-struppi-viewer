import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ChevronDownIcon, X, AlertCircle } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button.tsx"
import { Field, FieldGroup } from "@/components/ui/field.tsx"
import { parseStruPPIXml } from "@/parsers/struppiParser.ts"
import { useStruPPI } from "@/context/StruPPIContext"
import { useNavigate, useSearchParams } from "react-router-dom"

export function LoaderPage() {
  const [sourceType, setSourceType] = useState<"file" | "url">("url")
  const [sourceUrl, setSourceUrl] = useState<string>("")
  const [fileInput, setFileInput] = useState<File | null>(null)
  const { setData, setSender, setIsLoading, setError, isLoading, error } = useStruPPI()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Check for URL parameter on mount
  useEffect(() => {
    const xmlUrl = searchParams.get("url")
    const xmlFile = searchParams.get("file")

    if (xmlUrl) {
      setSourceUrl(xmlUrl)
      setSourceType("url")
      loadXmlFromUrl(xmlUrl)
    } else if (xmlFile) {
      setSourceUrl(xmlFile)
      setSourceType("url")
      loadXmlFromUrl(xmlFile)
    }
  }, [searchParams])

  async function loadXmlFromUrl(url: string) {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`)
      const text = await res.text()
      const parsed = parseStruPPIXml(text)
      setData(parsed)
      
      // Select first sender
      const firstSender = parsed.programmdaten.sender?.[0]
      if (firstSender) {
        setSender(firstSender)
      }
      
      navigate("/broadcaster", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load XML")
    } finally {
      setIsLoading(false)
    }
  }

  async function loadXmlFromFile(file: File) {
    setIsLoading(true)
    setError(null)
    try {
      const text = await file.text()
      const parsed = parseStruPPIXml(text)
      setData(parsed)
      
      // Select first sender
      const firstSender = parsed.programmdaten.sender?.[0]
      if (firstSender) {
        setSender(firstSender)
      }
      
      navigate("/broadcaster", { replace: true })
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
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {error ? <AlertCircle className="text-red-500" /> : <X />}
        </EmptyMedia>
        <EmptyTitle>{error ? "Fehler beim Laden" : "StruPPI XML laden"}</EmptyTitle>
        <EmptyDescription>
          {error || "Bitte wähle ein StruPPI XML aus oder gebe eine URL ein"}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <FieldGroup>
          <Field>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <InputGroupButton variant="ghost" className="pr-1.5! text-xs" disabled={isLoading}>
                        {sourceType}
                        <ChevronDownIcon className="size-3" />
                      </InputGroupButton>
                    }
                  />
                  <DropdownMenuContent align="start" sideOffset={8} alignOffset={-4}>
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
                  placeholder={"https://example.com/struppi.xml"}
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
              onClick={handleLoad}
              type="submit"
              disabled={isLoading || (!sourceUrl && sourceType === "url") || (!fileInput && sourceType === "file")}
            >
              {isLoading ? "Lädt..." : "StruPPI laden"}
            </Button>
          </Field>
        </FieldGroup>
      </EmptyContent>
    </Empty>
  )
}

