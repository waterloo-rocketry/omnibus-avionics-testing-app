import type { CANCommandMessage } from '@waterloorocketry/omnibus-ts'
import { useCanSenderStore } from '@/store/canSenderStore'
import { Button } from '@/components/ui/button'

interface Props {
    onLoad: (cmd: CANCommandMessage) => void
}

export function CommandHistory({ onLoad }: Props) {
    const { history, clearHistory } = useCanSenderStore()

    if (history.length === 0) return null

    return (
        <div className="bg-zinc-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-semibold text-sm">Command History</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-zinc-200 text-xs h-7"
                    onClick={clearHistory}
                >
                    Clear
                </Button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
                {history.map((entry) => (
                    <div
                        key={entry.id}
                        className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-zinc-800"
                    >
                        <span className={entry.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                            {entry.status === 'success' ? '✓' : '✗'}
                        </span>
                        <span className="text-zinc-500 w-20 shrink-0 tabular-nums">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-zinc-300 flex-1 truncate">
                            {entry.command.boardTypeId}/{entry.command.boardInstId}
                            {' · '}{entry.command.msgType}
                            {' · '}{entry.command.msgPrio}
                        </span>
                        {entry.errorMessage && (
                            <span className="text-red-400 truncate max-w-[120px]">{entry.errorMessage}</span>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-zinc-400 hover:text-white text-xs shrink-0"
                            onClick={() => onLoad(entry.command)}
                        >
                            ↑ Load
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
