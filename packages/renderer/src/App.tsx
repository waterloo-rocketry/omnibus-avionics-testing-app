import { useEffect } from 'react'
import './App.css'
import type { BoardMessage } from '@/components/types.ts'
import BoardStatusDashboard from './components/BoardStatus/BoardStatusDashboard'
import ConnectToOmnibus from './components/ConnectToOmnibus'
import { connectAvionicsSocket, disconnectAvionicsSocket } from '../tests/omnibusSocket'
import { useAvionicsStore } from '@/store/omnibusStore'

function App() {
    // setting up zustand store
    const series = useAvionicsStore((state) => state.series)

    useEffect(() => {
        connectAvionicsSocket()
        return () => disconnectAvionicsSocket()
    }, [])

    const boardData: BoardMessage<Record<string, string | number>>[] = [
        {
            boardTypeId: 'FlightController',
            boardInstId: 'FC-01',
            msgPriority: String(series['FC-01']?.msgPrio ?? 1),
            msgType: 'telemetry',
            data: {
                status: series['FC-01']?.status ?? 'OK',
                temperature: series['FC-01']?.value ?? 36.5,
            },
        },
        {
            boardTypeId: 'Telemetry',
            boardInstId: 'TM-02',
            msgPriority: String(series['TM-02']?.msgPrio ?? 2),
            msgType: 'status',
            data: {
                status: series['TM-02']?.status ?? 'WARN',
                voltage: series['TM-02']?.value ?? 3.7,
            },
        },
    ]

    return (
        <div className="App">
            <ConnectToOmnibus />
            <BoardStatusDashboard boardInfoArray={boardData} />
        </div>
    )
}

export default App
