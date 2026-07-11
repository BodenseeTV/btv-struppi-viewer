import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { StruPPIParsed, Sender } from '@/types/struppi'

interface StruPPIContextType {
  data: StruPPIParsed | null
  currentSender: Sender | null
  setData: (data: StruPPIParsed | null) => void
  setSender: (sender: Sender | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  reset: () => void
}

const StruPPIContext = createContext<StruPPIContextType | undefined>(undefined)

export function StruPPIProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StruPPIParsed | null>(null)
  const [currentSender, setCurrentSender] = useState<Sender | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setSender = (sender: Sender | null) => {
    setCurrentSender(sender)
  }

  const reset = () => {
    setData(null)
    setCurrentSender(null)
    setError(null)
  }

  return (
    <StruPPIContext.Provider
      value={{
        data,
        currentSender,
        setData,
        setSender,
        isLoading,
        setIsLoading,
        error,
        setError,
        reset,
      }}
    >
      {children}
    </StruPPIContext.Provider>
  )
}

export function useStruPPI() {
  const context = useContext(StruPPIContext)
  if (context === undefined) {
    throw new Error('useStruPPI must be used within a StruPPIProvider')
  }
  return context
}

