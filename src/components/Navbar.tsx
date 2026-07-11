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
        <nav className="py-4 px-6 flex items-center justify-between border-b">
            <div
                className="flex justify-center items-center gap-2 cursor-pointer"
                onClick={() => (isLoaded ? navigate("/broadcaster") : navigate("/"))}
            >
                {isLoaded && currentSender?.senderlogo ? (
                    <ImageWithFallback
                        links={currentSender.senderlogo}
                        alt={currentSender.sendername}
                        size="md"
                        heightOnly
                    />
                ) : (
                    <Blocks size={30}/>
                )}
                <div>
                    <h1 className="text-2xl font-bold">{currentSender?.sendername || "StruPPI Viewer"}</h1>
                    {generierungsdatum && (
                        <p className="text-xs text-muted-foreground">Generiert: {generierungsdatum}</p>
                    )}
                </div>
            </div>

            {isLoaded && (
                <div className="flex opacity-85 items-center text-sm text-muted-foreground space-x-8">
                    <div className="hidden md:flex space-x-4">
                        {navLinks.map((link) => (
                            <Button
                                key={link.name}
                                variant={location.pathname === link.path ? "default" : "ghost"}
                                onClick={() => navigate(link.path)}
                                className="text-sm"
                            >
                                {link.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center space-x-4">
                {/* Theme toggle */}
                <Button onClick={toggleTheme} variant="ghost" className="h-10">
                    {theme === 'dark' ? <Sun/> : <Moon/>}
                </Button>

                {isLoaded && (
                    <Button className="h-10" variant="outline" onClick={handleReset}>
                        Neues XML
                    </Button>
                )}
            </div>
        </nav>
    )
}

export default Navbar
