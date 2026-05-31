import { useState } from 'react'
import type { CANCommandMessage } from '@waterloorocketry/omnibus-ts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useOmnibus } from '@/components/OmnibusProvider'
import { useCanSenderStore } from '@/store/canSenderStore'
import { CommandHistory } from './CommandHistory'
import { Favorites } from './Favorites'

const MSG_PRIOS = ['LOW', 'MEDIUM', 'HIGH', 'HIGHEST'] as const
type MsgPrio = (typeof MSG_PRIOS)[number]

interface FormState {
    board_type_id: string
    board_inst_id: string
    msg_type: string
    msg_prio: MsgPrio
    can_msg: string
    parsley_instance: string
}

interface FormErrors {
    board_type_id?: string
    board_inst_id?: string
    msg_type?: string
    can_msg?: string
    parsley_instance?: string
}

const DEFAULT_FORM: FormState = {
    board_type_id: '',
    board_inst_id: '',
    msg_type: '',
    msg_prio: 'MEDIUM',
    can_msg: '',
    parsley_instance: '',
}

function parsePayload(raw: string): unknown {
    const trimmed = raw.trim()
    if (!trimmed) return null
    try {
        return JSON.parse(trimmed)
    } catch {}
    const hex = trimmed.replace(/^0x/i, '').replace(/\s+/g, '')
    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
        throw new Error('Payload must be valid JSON or an even-length hex string (e.g. DEADBEEF)')
    }
    if (hex.length / 2 > 8) {
        throw new Error('CAN payload exceeds 8 bytes')
    }
    const bytes: number[] = []
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.slice(i, i + 2), 16))
    }
    return bytes
}

function validate(fields: FormState): FormErrors {
    const errors: FormErrors = {}
    if (!fields.board_type_id.trim()) errors.board_type_id = 'Required'
    if (!fields.board_inst_id.trim()) errors.board_inst_id = 'Required'
    if (!fields.msg_type.trim()) errors.msg_type = 'Required'
    if (!fields.parsley_instance.trim()) errors.parsley_instance = 'Required'
    if (fields.can_msg.trim()) {
        try {
            parsePayload(fields.can_msg)
        } catch (e) {
            errors.can_msg = e instanceof Error ? e.message : 'Invalid payload'
        }
    }
    return errors
}

function buildCommand(fields: FormState): CANCommandMessage {
    return {
        boardTypeId: fields.board_type_id.trim(),
        boardInstId: fields.board_inst_id.trim(),
        msgType: fields.msg_type.trim(),
        msgPrio: fields.msg_prio,
        canMsg: fields.can_msg.trim() ? parsePayload(fields.can_msg) : null,
        parsley: fields.parsley_instance.trim(),
        messageFormatVersion: 2,
    }
}

export function CanSender() {
    const { sendCommand, connectionStatus, parsleyInstances } = useOmnibus()
    const [fields, setFields] = useState<FormState>(DEFAULT_FORM)
    const [errors, setErrors] = useState<FormErrors>({})
    const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [favLabel, setFavLabel] = useState('')
    const [favDialogOpen, setFavDialogOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFields((prev) => ({ ...prev, [key]: e.target.value }))
        setErrors((prev) => ({ ...prev, [key]: undefined }))
    }

    const handleSend = () => {
        const errs = validate(fields)
        if (Object.keys(errs).length > 0) {
            setErrors(errs)
            return
        }

        let cmd: CANCommandMessage
        try {
            cmd = buildCommand(fields)
        } catch (e) {
            setSendStatus({ type: 'error', message: e instanceof Error ? e.message : 'Invalid payload' })
            return
        }

        try {
            sendCommand(cmd)
            useCanSenderStore.getState().addToHistory({ timestamp: Date.now(), command: cmd, status: 'success' })
            setSendStatus({ type: 'success', message: 'Command sent' })
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to send'
            useCanSenderStore.getState().addToHistory({ timestamp: Date.now(), command: cmd, status: 'error', errorMessage: msg })
            setSendStatus({ type: 'error', message: msg })
        }
    }

    const loadCommand = (cmd: CANCommandMessage) => {
        setFields({
            board_type_id: cmd.boardTypeId,
            board_inst_id: cmd.boardInstId,
            msg_type: cmd.msgType,
            msg_prio: cmd.msgPrio,
            can_msg: cmd.canMsg != null ? JSON.stringify(cmd.canMsg) : '',
            parsley_instance: cmd.parsley,
        })
        setErrors({})
        setSendStatus(null)
    }

    const saveFavorite = () => {
        const errs = validate(fields)
        if (Object.keys(errs).length > 0) return
        try {
            const cmd = buildCommand(fields)
            useCanSenderStore.getState().addFavorite(
                favLabel.trim() || `${fields.board_type_id}/${fields.msg_type}`,
                cmd,
            )
        } catch {
            return
        }
        setFavLabel('')
        setFavDialogOpen(false)
    }

    const inputClass = 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
    const labelClass = 'text-xs text-zinc-400'
    const errorClass = 'text-xs text-red-400 mt-1'

    return (
        <div className="p-4 space-y-4">
            <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className="flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition-colors"
            >
                <span className={`transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}>▾</span>
                CAN Sender
            </button>

            {!collapsed && (
                <>
                    <div className="flex gap-4 flex-wrap items-start">
                        {/* Form */}
                        <div className="flex flex-col gap-3 bg-zinc-900 p-4 rounded-lg flex-1 min-w-[260px]">
                            <div>
                                <Label className={labelClass}>board_type_id</Label>
                                <Input
                                    className={inputClass}
                                    placeholder="e.g. SENSOR_BOARD"
                                    value={fields.board_type_id}
                                    onChange={set('board_type_id')}
                                />
                                {errors.board_type_id && <p className={errorClass}>{errors.board_type_id}</p>}
                            </div>

                            <div>
                                <Label className={labelClass}>board_inst_id</Label>
                                <Input
                                    className={inputClass}
                                    placeholder="e.g. 0"
                                    value={fields.board_inst_id}
                                    onChange={set('board_inst_id')}
                                />
                                {errors.board_inst_id && <p className={errorClass}>{errors.board_inst_id}</p>}
                            </div>

                            <div>
                                <Label className={labelClass}>msg_type</Label>
                                <Input
                                    className={inputClass}
                                    placeholder="e.g. ACTUATE"
                                    value={fields.msg_type}
                                    onChange={set('msg_type')}
                                />
                                {errors.msg_type && <p className={errorClass}>{errors.msg_type}</p>}
                            </div>

                            <div>
                                <Label className={labelClass}>msg_prio</Label>
                                <select
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md h-9 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500"
                                    value={fields.msg_prio}
                                    onChange={set('msg_prio')}
                                >
                                    {MSG_PRIOS.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label className={labelClass}>payload — JSON or hex, max 8 bytes (optional)</Label>
                                <Input
                                    className={`${inputClass} font-mono`}
                                    placeholder='{"key": 1}  or  DEADBEEF'
                                    value={fields.can_msg}
                                    onChange={set('can_msg')}
                                />
                                {errors.can_msg && <p className={errorClass}>{errors.can_msg}</p>}
                            </div>

                            <div>
                                <Label className={labelClass}>parsley instance</Label>
                                {parsleyInstances.length > 0 ? (
                                    <select
                                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md h-9 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500"
                                        value={fields.parsley_instance}
                                        onChange={set('parsley_instance')}
                                    >
                                        <option value="">Select parsley instance…</option>
                                        {parsleyInstances.map((id) => (
                                            <option key={id} value={id}>{id}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <Input
                                        className={inputClass}
                                        placeholder="e.g. hostname/usb/COM3"
                                        value={fields.parsley_instance}
                                        onChange={set('parsley_instance')}
                                    />
                                )}
                                {errors.parsley_instance && <p className={errorClass}>{errors.parsley_instance}</p>}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    className="bg-zinc-700 hover:bg-zinc-600 text-white flex-1"
                                    disabled={connectionStatus !== 'connected'}
                                    onClick={handleSend}
                                >
                                    SEND
                                </Button>

                                <Dialog open={favDialogOpen} onOpenChange={setFavDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                                            title="Save as favorite"
                                        >
                                            ★
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Save as Favorite</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-3 py-2">
                                            <Label htmlFor="fav-label">Label</Label>
                                            <Input
                                                id="fav-label"
                                                value={favLabel}
                                                onChange={(e) => setFavLabel(e.target.value)}
                                                placeholder="e.g. Actuate valve"
                                                onKeyDown={(e) => e.key === 'Enter' && saveFavorite()}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={saveFavorite}>Save</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {sendStatus && (
                                <p className={`text-xs ${sendStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                    {sendStatus.type === 'success' ? '✓' : '✗'} {sendStatus.message}
                                </p>
                            )}

                            {connectionStatus !== 'connected' && (
                                <p className="text-xs text-zinc-500">Link to Omnibus above to send commands</p>
                            )}
                        </div>

                        <Favorites onLoad={loadCommand} />
                    </div>

                    <CommandHistory onLoad={loadCommand} />
                </>
            )}
        </div>
    )
}
