import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { communicator } from '@waterloorocketry/omnibus-ts'

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error'
type OmnibusCommunicator = ReturnType<typeof communicator>

interface OmnibusContextValue {
  connectionStatus: ConnectionStatus
  errorMessage: string
  omnibus: OmnibusCommunicator | null
  connect: (url: string) => void
  disconnect: () => void
}

const OmnibusContext = createContext<OmnibusContextValue | null>(null)

export function OmnibusProvider({ children }: { children: ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [omnibus, setOmnibus] = useState<OmnibusCommunicator | null>(null)
  const [serverURL, setServerURL] = useState<string | null>(null)

  useEffect(() => {
    if (!serverURL) return

    setConnectionStatus('connecting')
    setErrorMessage('')

    const newOmnibus = communicator({ serverURL, allowExposeSocket: true })

    if (!newOmnibus.socket) {
      setErrorMessage('Failed to initialize socket connection.')
      setConnectionStatus('error')
      newOmnibus.disconnect()
      return
    }

    setOmnibus(newOmnibus)

    newOmnibus.socket.on('connect', () => {
      setConnectionStatus('connected')
    })

    newOmnibus.socket.on('connect_error', (err) => {
      setErrorMessage('Failed to connect: ' + err.message)
      setConnectionStatus('error')
      newOmnibus.disconnect()
      setOmnibus(null)
    })

    return () => {
      newOmnibus.disconnect()
      setOmnibus(null)
    }
  }, [serverURL])

  const connect = useCallback((url: string) => {
    setServerURL(url)
  }, [])

  const disconnect = useCallback(() => {
    omnibus?.disconnect()
    setOmnibus(null)
    setServerURL(null)
    setConnectionStatus('disconnected')
  }, [omnibus])

  return (
    <OmnibusContext.Provider value={{ connectionStatus, errorMessage, omnibus, connect, disconnect }}>
      {children}
    </OmnibusContext.Provider>
  )
}

export function useOmnibus(): OmnibusContextValue {
  const ctx = useContext(OmnibusContext)
  if (!ctx) throw new Error('useOmnibus must be used within OmnibusProvider')
  return ctx
}