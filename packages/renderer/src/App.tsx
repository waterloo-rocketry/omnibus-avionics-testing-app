import './App.css'
import BoardStatusDashboard from './components/BoardStatus/BoardStatusDashboard'
import ConnectToOmnibus from './components/ConnectToOmnibus'
import { useOmnibusStore } from '@/store/omnibusStore'
import { identifiers } from '@/components/types.ts'
import { useShallow } from 'zustand/react/shallow'
import { OmnibusProvider } from './components/OmnibusProvider'

function AppContent() {
    // setting up zustand store
    const series = useOmnibusStore(useShallow((state) => state.series))

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
