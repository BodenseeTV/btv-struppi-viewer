import {Button} from "@/components/ui/button"
import {Blocks, Moon, Sun} from "lucide-react"
import {useLocation, useNavigate} from "react-router-dom"
import {useStruPPI} from "@/context/StruPPIContext"
import {ImageWithFallback} from "@/components/ImageWithFallback"
import {useTheme} from "@/components/theme-provider"
import {formatDateTimeLong, parseDateTime} from "@/lib/utils"

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const {data, currentSender, reset} = useStruPPI()

    const isLoaded = !!data && !!currentSender

    const navLinks = [
        {name: "Sender", path: "/broadcaster"},
        {name: "Sendungen", path: "/broadcasts"},
        {name: "Serien", path: "/series"},
    ]

    const handleReset = () => {
        reset()
        navigate("/", {replace: true})
    }

    const generierungsdatum = data?.programmdaten?.generierungsdatum
        ? formatDateTimeLong(parseDateTime(data.programmdaten.generierungsdatum) || null)
        : null

    const {theme, setTheme} = useTheme()

    function toggleTheme() {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return (
        <nav className="py-3 px-4 sm:px-6 flex items-center justify-between border-b flex-wrap gap-3">
            <div
                className="flex items-center gap-3 cursor-pointer shrink-0"
                onClick={() => (isLoaded ? navigate(`/broadcaster${location.search}`) : navigate(`/`))}
            >
                {isLoaded && currentSender?.senderlogo ? (
                    <ImageWithFallback
                        links={currentSender.senderlogo}
                        alt={currentSender.sendername}
                        size="md"
                        heightOnly
                    />
                ) : (
                    <Blocks size={26}/>
                )}
                <div className="leading-tight">
                    <div className="text-lg font-semibold truncate max-w-xs">{currentSender?.sendername || "StruPPI Viewer"}</div>
                    {generierungsdatum && (
                        <p className="text-xs text-muted-foreground">Generiert: {generierungsdatum}</p>
                    )}
                </div>
            </div>

            {isLoaded && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="hidden md:flex space-x-4">
                        {navLinks.map((link) => (
                            <Button
                                key={link.name}
                                variant={location.pathname === link.path ? "default" : "ghost"}
                                onClick={() => navigate(`${link.path}${location.search}`)}
                                className="text-sm"
                            >
                                {link.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center space-x-2">
                {/* Theme toggle */}
                <Button onClick={toggleTheme} variant="ghost" className="h-9 w-9">
                    {theme === 'dark' ? <Sun/> : <Moon/>}
                </Button>

                {isLoaded && (
                    <Button className="h-9" variant="outline" onClick={handleReset}>
                        Neues XML
                    </Button>
                )}
            </div>
        </nav>
    )
}

export default Navbar
