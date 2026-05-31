import type { CANCommandMessage } from '@waterloorocketry/omnibus-ts'
import { useCanSenderStore } from '@/store/canSenderStore'
import { Button } from '@/components/ui/button'

interface Props {
    onLoad: (cmd: CANCommandMessage) => void
}

export function Favorites({ onLoad }: Props) {
    const { favorites, removeFavorite } = useCanSenderStore()

    if (favorites.length === 0) return null

    return (
        <div className="bg-zinc-900 rounded-lg p-4 min-w-[180px]">
            <h2 className="text-white font-semibold text-sm mb-3">Favorites</h2>
            <div className="space-y-1">
                {favorites.map((fav) => (
                    <div key={fav.id} className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 justify-start text-zinc-300 hover:text-white text-xs h-7 px-2 truncate"
                            onClick={() => onLoad(fav.command)}
                            title={fav.label}
                        >
                            {fav.label}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-zinc-500 hover:text-red-400 text-sm"
                            onClick={() => removeFavorite(fav.id)}
                            title="Remove favorite"
                        >
                            ×
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
