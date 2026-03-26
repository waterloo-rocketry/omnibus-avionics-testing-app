import { useEffect } from 'react'
import './App.css'
import type { BoardMessage } from '@/components/types.ts'
import BoardStatusDashboard from './components/BoardStatus/BoardStatusDashboard'
import ConnectToOmnibus from './components/ConnectToOmnibus'
import { connectOmnibusSocket, disconnectOmnibusSocket } from '../tests/omnibusSocket'
import { useOmnibusStore } from '@/store/omnibusStore'
import { identifiers } from '@/components/types.ts'
import { useShallow } from 'zustand/react/shallow'

function App() {
    // setting up zustand store
    const series = useOmnibusStore(useShallow((state) => state.series))

    useEffect(() => {
        connectOmnibusSocket()
        return () => disconnectOmnibusSocket()
    }, [])

    const boardData = identifiers.map(({ type_id, inst_id }) => {
        const key = `${type_id}-${inst_id}`
        const msg = series[key]
        return {
            boardTypeId: type_id,
            boardInstId: inst_id,
            msgPriority: msg?.msgPrio ?? 'prio',
            msgType: msg?.msgType ?? 'type',
            data: (msg?.data as Record<string, number> | null) ?? null,
        }
    })

    return (
        <div className="App">
            <ConnectToOmnibus />
            <BoardStatusDashboard boardInfoArray={boardData} />
        </div>
    )
}

export default App
