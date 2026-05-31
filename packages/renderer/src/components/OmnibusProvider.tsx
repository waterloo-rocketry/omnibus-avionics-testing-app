import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { communicator } from '@waterloorocketry/omnibus-ts'
import type { CANCommandMessage, ParsleyHeartbeatMessage, ParsleyMessage } from '@waterloorocketry/omnibus-ts'
import { useOmnibusStore } from '@/store/omnibusStore'

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error'
type OmnibusCommunicator = ReturnType<typeof communicator>

interface OmnibusContextValue {
    connectionStatus: ConnectionStatus
    errorMessage: string
    parsleyInstances: string[]
    connect: (url: string) => void
    disconnect: () => void
    sendCommand: (cmd: CANCommandMessage) => void
}

const OmnibusContext = createContext<OmnibusContextValue | null>(null)

export function OmnibusProvider({ children }: { children: ReactNode }) {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [parsleyInstances, setParsleyInstances] = useState<string[]>([])
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

        newOmnibus.receiver.receive<ParsleyMessage>("CAN/Parsley", (msg) => {
            const typeID = msg.payload.boardTypeId
            const instID = msg.payload.boardInstId
            const key = `${typeID}-${instID}`
            useOmnibusStore.getState().updateSeries(key, msg.payload)
        })

        newOmnibus.receiver.receive<ParsleyHeartbeatMessage>("Parsley/Health", (msg) => {
            const { id, health } = msg.payload
            setParsleyInstances((prev) => {
                if (health === 'Healthy') {
                    return prev.includes(id) ? prev : [...prev, id]
                }
                return prev.filter((i) => i !== id)
            })
        })

        return () => {
            newOmnibus.disconnect()
            omnibusRef.current = null
            setParsleyInstances([])
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
        setParsleyInstances([])
    }, [])

    const sendCommand = useCallback((cmd: CANCommandMessage) => {
        if (!omnibusRef.current) throw new Error('Not connected to Omnibus')
        omnibusRef.current.sender.send<CANCommandMessage>({
            channel: 'CAN/Commands',
            timestamp: Date.now(),
            payload: cmd,
        })
    }, [])

    return (
        <OmnibusContext.Provider value={{ connectionStatus, errorMessage, parsleyInstances, connect, disconnect, sendCommand }}>
            {children}
        </OmnibusContext.Provider>
    )
}

export function useOmnibus(): OmnibusContextValue {
    const ctx = useContext(OmnibusContext)
    if (!ctx) throw new Error('useOmnibus must be used within OmnibusProvider')
    return ctx
}
