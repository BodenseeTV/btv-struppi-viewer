import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { StruPPIProvider } from "@/context/StruPPIContext"
import { MainLayout } from "@/layouts/MainLayout"
import { LoaderPage } from "@/pages/LoaderPage"
import { BroadcasterPage } from "@/pages/BroadcasterPage"
import { BroadcastsPage } from "@/pages/BroadcastsPage"
import { SeriesPage } from "@/pages/SeriesPage"

export function App() {
  return (
    <StruPPIProvider>
      <Router>
        <Routes>
          {/* Loader/Initial page - no layout */}
          <Route path="/" element={<LoaderPage />} />

          {/* Main layout pages */}
          <Route element={<MainLayout />}>
            <Route path="/broadcaster" element={<BroadcasterPage />} />
            <Route path="/broadcasts" element={<BroadcastsPage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </StruPPIProvider>
  )
}

export default App
