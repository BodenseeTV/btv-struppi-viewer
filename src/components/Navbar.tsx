import React from "react"
import {Button} from "@/components/ui/button"
import {Blocks, Moon, Sun, Menu, X} from "lucide-react"
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
        {name: "Programm", path: "/programm"},
        {name: "Sendungen", path: "/sendungen"},
        {name: "Serien", path: "/series"},
    ]
    const [mobileOpen, setMobileOpen] = React.useState(false)

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
        <nav className="py-2 px-3 sm:px-6 flex items-center justify-between border-b gap-2 flex-wrap">
            <div
                className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0 min-w-0"
                onClick={() => (isLoaded ? navigate(`/broadcaster${location.search}`) : navigate(`/`))}
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
                    <Blocks size={20} className="sm:w-[26px] sm:h-[26px]"/>
                )}
                <div className="leading-tight min-w-0">
                    <div className="text-base sm:text-lg font-semibold truncate">{currentSender?.sendername || "StruPPI Viewer"}</div>
                    {generierungsdatum && (
                        <p className="text-xs text-muted-foreground hidden sm:block">Generiert: {generierungsdatum}</p>
                    )}
                </div>
            </div>

            {isLoaded && (
                <>
                    <div className="hidden md:flex items-center space-x-2">
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

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Button variant="ghost" size="sm" onClick={() => setMobileOpen(!mobileOpen)} className="h-8 w-8">
                            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
                        </Button>
                        {mobileOpen && (
                            <div className="absolute right-3 top-14 bg-popover border rounded shadow-md p-2 z-50">
                                <div className="flex flex-col">
                                    {navLinks.map((link) => (
                                        <Button key={link.name} variant="ghost" size="sm" onClick={() => { setMobileOpen(false); navigate(`${link.path}${location.search}`) }} className="justify-start">
                                            {link.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <Button onClick={toggleTheme} variant="ghost" size="sm" className="h-8 w-8">
                    {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
                </Button>

                {isLoaded && (
                    <Button className="h-8 text-xs sm:h-9 sm:text-sm px-2 sm:px-3" variant="outline" onClick={handleReset}>
                        <span className="hidden sm:inline">Neues XML</span>
                        <span className="sm:hidden">XML</span>
                    </Button>
                )}
            </div>
        </nav>
    )
}

export default Navbar
