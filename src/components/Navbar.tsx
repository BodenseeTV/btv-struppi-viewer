import {Button} from "@/components/ui/button";
import {Blocks} from "lucide-react";
import * as React from "react";

interface NavbarProps {
    sendername?: string;
    logo?: React.ReactNode;
}

function Navbar({
                    sendername = "BodenseeTV",
                    logo = <Blocks size={30}/>
                }: NavbarProps) {

    const navLinks = [
        {name: "Senderinfos", href: "#"},
        {name: "Sendungen", href: "#"},
        {name: "Serien", href: "#"}
    ]

    return (
        <nav className={`py-4 px-6 flex items-center justify-between`}>
            <div className="flex justify-center items-center gap-2">
                {logo}
                <h1 className="text-2xl font-bold">{sendername}</h1>
            </div>

            <div className="flex opacity-85 items-center text-sm text-muted-foreground space-x-8">
                <div className="hidden md:flex space-x-6">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-gray-200 hover:text-gray-500 font-medium transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <Button className="h-10" variant="outline">
                    StruPPI XML wechseln
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;
