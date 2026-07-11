import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty"
import {ChevronDownIcon, X} from "lucide-react"
import Navbar from "@/components/Navbar.tsx";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Field, FieldGroup} from "@/components/ui/field.tsx";
import {parseStruPPIXml} from "@/parsers/struppiParser.ts";

export function App() {
    const [sourceType, setSourceType] = useState<"file" | "url">("url")
    const [sourceUrl, setSourceUrl] = useState<string>("")

    function loadXml() {
        fetch(sourceUrl)
            .then(res => res.text())
            .then(text => console.log(parseStruPPIXml(text)))
    }

    return (
        <>
            <Navbar/>
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <X/>
                    </EmptyMedia>
                    <EmptyTitle>No XML selected</EmptyTitle>
                    <EmptyDescription>
                        Bitte wähle ein StruPPI XML aus
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
                                                <InputGroupButton variant="ghost" className="pr-1.5! text-xs">
                                                    {sourceType}
                                                    <ChevronDownIcon className="size-3"/>
                                                </InputGroupButton>
                                            }/>
                                        <DropdownMenuContent align="start"
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
                                {
                                    sourceType === "url"
                                        ? (<InputGroupInput placeholder={"https://example.com/struppi.xml"}
                                                            value={sourceUrl}
                                                            onChange={e => setSourceUrl(e.target.value)}/>)
                                        : (<InputGroupInput type={"file"}/>)
                                }

                            </InputGroup>
                        </Field>
                        <Field orientation="vertical">
                            <Button onClick={loadXml} type="submit">StruPPI laden</Button>
                        </Field>
                    </FieldGroup>
                </EmptyContent>
            </Empty>
        </>

    )
}

export default App
