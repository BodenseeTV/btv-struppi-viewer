import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { StruPPIProvider } from "@/context/StruPPIContext"
import { MainLayout } from "@/layouts/MainLayout"
import { LoaderPage } from "@/pages/LoaderPage"
import { BroadcasterPage } from "@/pages/BroadcasterPage"
import { BroadcastsPage } from "@/pages/BroadcastsPage"
import { SendungenPage } from "@/pages/SendungenPage"
import { SeriesPage } from "@/pages/SeriesPage"
import QueryLoader from "@/components/QueryLoader"

export function App() {
  return (
    <StruPPIProvider>
      <Router basename={import.meta.env.BASE_URL}>
        {/* QueryLoader listens for ?url=... on any page and loads the XML into context */}
        <QueryLoader />
        <Routes>
          {/* Loader/Initial page - no layout */}
          <Route path="/" element={<LoaderPage />} />

          {/* Main layout pages */}
          <Route element={<MainLayout />}>
            <Route path="/broadcaster" element={<BroadcasterPage />} />
            <Route path="/programm" element={<BroadcastsPage />} />
            <Route path="/sendungen" element={<SendungenPage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </StruPPIProvider>
  )
}

export default App
