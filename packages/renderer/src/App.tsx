import './App.css'
import BoardStatusDashboard from './components/BoardStatus/BoardStatusDashboard'
import ConnectToOmnibus from './components/ConnectToOmnibus'
import { useOmnibusStore } from '@/store/omnibusStore'
import { identifiers } from '@/components/types.ts'
import type { Identifier } from '@/components/types.ts'
import { useShallow } from 'zustand/react/shallow'
import { OmnibusProvider } from './components/OmnibusProvider'

function AppContent() {
    // setting up zustand store
    const series = useOmnibusStore(useShallow((state) => state.series))

    for (const key of Object.keys(series)) {
        const msg = series[key]
        const type = msg.boardTypeId
        const inst = msg.boardInstId
        const id: Identifier = { type_id: type, inst_id: inst }
        if (!identifiers.some(
                (existingId) =>
                    existingId.type_id === id.type_id && existingId.inst_id === id.inst_id
            )
        ) {
            identifiers.push(id)
        }
    }

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

function App() {
    return (
        <OmnibusProvider>
            <AppContent />
        </OmnibusProvider>
    )
}

export default App
