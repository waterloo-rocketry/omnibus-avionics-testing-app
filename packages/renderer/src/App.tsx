import { useState } from 'react'
import './App.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useOmnibus } from '@/components/OmnibusProvider'

function App() {
    const { connectionStatus, errorMessage, connect, disconnect } = useOmnibus()
    const [inputValue, setInputValue] = useState<string>('')
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

    const handleConnect = () => {
        if (!inputValue.trim()) return
        connect(inputValue)
        setIsDialogOpen(false)
    }

    return (
        <div className="App">
            <div className="header">
                {connectionStatus === 'connected' ? (
                    <p className="text-sm text-green-600">🟢 Connected to {inputValue}</p>
                ) : connectionStatus === 'connecting' ? (
                    <p className="text-sm text-blue-600">🔵 Connecting...</p>
                ) : connectionStatus === 'error' ? (
                    <p className="text-sm text-red-600">
                        🔴 Connection Error{errorMessage && `: ${errorMessage}`}
                    </p>
                ) : (
                    <p className="text-sm text-gray-600">⚪ Disconnected</p>
                )}

                {connectionStatus === 'connected' ? (
                    <Button variant="outline" onClick={disconnect}>
                        Disconnect
                    </Button>
                ) : (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">Connect to Omnibus</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Connect to Omnibus</DialogTitle>
                                <DialogDescription>
                                    Enter the server address to connect to the Omnibus board.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="serverAddress">Server Address</Label>
                                    <Input
                                        id="serverAddress"
                                        placeholder="e.g., http://192.168.1.100:8080"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                    {errorMessage && (
                                        <p className="text-sm text-red-600">{errorMessage}</p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleConnect}
                                    disabled={
                                        connectionStatus === 'connecting' || !inputValue.trim()
                                    }
                                >
                                    Connect
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            <div className="content" />
        </div>
    )
}

export default App
