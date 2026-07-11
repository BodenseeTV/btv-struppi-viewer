import { Outlet } from "react-router-dom"
import Navbar from "@/components/Navbar"

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-6xl px-4">
        <Outlet />
      </main>
    </div>
  )
}

