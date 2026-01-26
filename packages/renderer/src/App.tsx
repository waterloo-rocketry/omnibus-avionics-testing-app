 import './App.css'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'

import { useState, useEffect } from 'react'

import { communicator } from '@waterloorocketry/omnibus-ts'

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error'
type OmnibusCommunicator = ReturnType<typeof communicator>
 function App() {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
    const [inputValue, setInputValue] = useState<string>('')
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [omnibus, setOmnibus] = useState<OmnibusCommunicator | null>(null)
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (omnibus) {
                omnibus.disconnect()
            }
        }
    }, [omnibus])
     return (
         <>
        <div className="App">
            <div className="header">
                {connectionStatus === 'connected' && omnibus ? (
                    <p className="text-sm text-green-600">🟢Connected to {inputValue}</p>
                ) : connectionStatus === 'connecting' ? (
                    <p className="text-sm text-blue-600">🔵Connecting...</p>
                ) : connectionStatus === 'error' ? (
                    <p className="text-sm text-red-600">🔴Connection Error</p>
                ) : (
                    <p className="text-sm text-gray-600">⚪Disconnected</p>
                )}
                {connectionStatus === 'connected' ? (<Button 
                        variant="outline"
                        onClick={() => {
                            if (omnibus) {
                                omnibus?.disconnect()
                                setOmnibus(null)
                            }
                            setConnectionStatus('disconnected')
                        }}
                    >
                        Disconnect
                    </Button>
                ) 
                : (<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                        onClick={() => setIsDialogOpen(true)}
                        variant = "outline">Connect to Omnibus</Button>
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

                                <Label htmlFor="port">Server Address</Label>
                                
                                <Input
                                    placeholder="e.g., localhost:8080 or http://192.168.1.100:8080"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />

                                {errorMessage && (
                                    <p className="text-sm text-red-600">{errorMessage}</p>
                                )}
                                {connectionStatus === 'connecting' && (
                                    <p className="text-sm text-blue-600">Connecting...</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={async () => {
                                        setConnectionStatus('connecting')
                                        setErrorMessage('')
                                        try {
                                            const newOmnibus = communicator({ 
                                                serverURL: inputValue,
                                                allowExposeSocket: true 
                                            })
                                            newOmnibus.socket?.on('connect_error', (err) => {
                                                setErrorMessage('Failed to connect: ' + err.message)
                                                setConnectionStatus('error')
                                                newOmnibus.disconnect()
                                            })
                                            newOmnibus.socket?.on('connect', () => {
                                                setConnectionStatus('connected')
                                                setIsDialogOpen(false)
                                                setOmnibus(newOmnibus);
                                            })
                                        } catch (error) {
                                            setErrorMessage('Failed to connect to Omnibus board.')
                                            setConnectionStatus('error')
                                        }
                                    }
                                }
                                disabled={connectionStatus === 'connecting'}
                            >
                                Connect
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                    
                )}
            </div>
            <div className="content">
                
            </div>
        </div>
         </>
     )
 }
    export default App