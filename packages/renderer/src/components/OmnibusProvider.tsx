import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
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
    const omnibusRef = useRef<OmnibusCommunicator | null>(null)
    const [serverURL, setServerURL] = useState<string | null>(null)
    const [reconnectCounter, setReconnectCounter] = useState<number>(0)

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

        omnibusRef.current = newOmnibus

        newOmnibus.socket.on('connect', () => {
            setConnectionStatus('connected')
        })

        newOmnibus.socket.on('connect_error', (err) => {
            setErrorMessage('Failed to connect: ' + err.message)
            setConnectionStatus('error')
            newOmnibus.disconnect()
            omnibusRef.current = null
        })

        return () => {
            newOmnibus.disconnect()
            omnibusRef.current = null
        }
    }, [serverURL, reconnectCounter])

    const connect = useCallback((url: string) => {
        setServerURL(url)
        setReconnectCounter((c) => c + 1)
    }, [])

    const disconnect = useCallback(() => {
        omnibusRef.current?.disconnect()
        omnibusRef.current = null
        setServerURL(null)
        setConnectionStatus('disconnected')
    }, [])

    return (
        <OmnibusContext.Provider
            value={{
                connectionStatus,
                errorMessage,
                omnibus: omnibusRef.current,
                connect,
                disconnect,
            }}
        >
            {children}
        </OmnibusContext.Provider>
    )
}

export function useOmnibus(): OmnibusContextValue {
    const ctx = useContext(OmnibusContext)
    if (!ctx) throw new Error('useOmnibus must be used within OmnibusProvider')
    return ctx
}
