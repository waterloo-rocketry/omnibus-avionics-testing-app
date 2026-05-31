import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CanSender } from '@/components/CanSender/CanSender'
import { useCanSenderStore } from '@/store/canSenderStore'
import { useOmnibus } from '@/components/OmnibusProvider'
import type { CANCommandMessage } from '@waterloorocketry/omnibus-ts'

// ---------------------------------------------------------------------------
// Mock useOmnibus so we don't need a real socket connection
// ---------------------------------------------------------------------------
const mockSendCommand = vi.fn()

vi.mock('@/components/OmnibusProvider', () => ({
    useOmnibus: vi.fn(() => ({
        connectionStatus: 'connected',
        errorMessage: '',
        parsleyInstances: [],
        connect: vi.fn(),
        disconnect: vi.fn(),
        sendCommand: mockSendCommand,
    })),
}))

// Mock canSenderStore to isolate component from persistence side-effects
vi.mock('@/store/canSenderStore', () => {
    const addToHistory = vi.fn()
    const addFavorite = vi.fn()
    const removeFavorite = vi.fn()
    const clearHistory = vi.fn()
    return {
        useCanSenderStore: Object.assign(
            vi.fn(() => ({ history: [], favorites: [], addToHistory, addFavorite, removeFavorite, clearHistory })),
            {
                getState: vi.fn(() => ({ addToHistory, addFavorite, removeFavorite, clearHistory })),
            }
        ),
    }
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fillRequiredFields() {
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. SENSOR_BOARD/i), {
        target: { value: 'SENSOR_BOARD' },
    })
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 0/i), {
        target: { value: '0' },
    })
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. ACTUATE/i), {
        target: { value: 'ACTUATE' },
    })
    fireEvent.change(screen.getByPlaceholderText(/hostname\/usb\/COM3/i), {
        target: { value: 'myhostname/usb/COM3' },
    })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CanSender – rendering', () => {
    it('renders all form fields and SEND button', () => {
        render(<CanSender />)
        expect(screen.getByPlaceholderText(/e\.g\. SENSOR_BOARD/i)).toBeDefined()
        expect(screen.getByPlaceholderText(/e\.g\. 0/i)).toBeDefined()
        expect(screen.getByPlaceholderText(/e\.g\. ACTUATE/i)).toBeDefined()
        expect(screen.getByRole('combobox')).toBeDefined() // msg_prio select (no parsley instances → text input)
        expect(screen.getByPlaceholderText(/DEADBEEF/i)).toBeDefined()
        expect(screen.getByPlaceholderText(/hostname\/usb\/COM3/i)).toBeDefined()
        expect(screen.getByRole('button', { name: /^SEND$/ })).toBeDefined()
    })

    it('msg_prio select has all four priority options', () => {
        render(<CanSender />)
        const select = screen.getByRole('combobox') as HTMLSelectElement
        const options = Array.from(select.options).map((o) => o.value)
        expect(options).toEqual(['LOW', 'MEDIUM', 'HIGH', 'HIGHEST'])
    })

    it('SEND button is disabled when not connected', () => {
        vi.mocked(useOmnibus).mockReturnValueOnce({
            connectionStatus: 'disconnected',
            errorMessage: '',
            parsleyInstances: [],
            connect: vi.fn(),
            disconnect: vi.fn(),
            sendCommand: mockSendCommand,
        })
        render(<CanSender />)
        const btn = screen.getByRole('button', { name: /^SEND$/ }) as HTMLButtonElement
        expect(btn.disabled).toBe(true)
    })

    it('shows "Connect to Omnibus" hint when disconnected', () => {
        vi.mocked(useOmnibus).mockReturnValueOnce({
            connectionStatus: 'disconnected',
            errorMessage: '',
            parsleyInstances: [],
            connect: vi.fn(),
            disconnect: vi.fn(),
            sendCommand: mockSendCommand,
        })
        render(<CanSender />)
        expect(screen.getByText(/link to omnibus/i)).toBeDefined()
    })
})

describe('CanSender – collapsible', () => {
    it('hides form fields after clicking the toggle', () => {
        render(<CanSender />)
        fireEvent.click(screen.getByRole('button', { name: /CAN Sender/i }))
        expect(screen.queryByPlaceholderText(/e\.g\. SENSOR_BOARD/i)).toBeNull()
    })

    it('shows form fields again after toggling twice', () => {
        render(<CanSender />)
        const toggle = screen.getByRole('button', { name: /CAN Sender/i })
        fireEvent.click(toggle)
        fireEvent.click(toggle)
        expect(screen.getByPlaceholderText(/e\.g\. SENSOR_BOARD/i)).toBeDefined()
    })
})

describe('CanSender – validation', () => {
    beforeEach(() => {
        mockSendCommand.mockReset()
    })

    it('shows required errors when sending with empty fields', () => {
        render(<CanSender />)
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        const errors = screen.getAllByText('Required')
        expect(errors.length).toBe(4) // board_type_id, board_inst_id, msg_type, parsley_instance
    })

    it('shows payload error for invalid hex string', () => {
        render(<CanSender />)
        fillRequiredFields()
        fireEvent.change(screen.getByPlaceholderText(/DEADBEEF/i), {
            target: { value: 'ZZZZ' },
        })
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        expect(screen.getByText(/valid JSON or an even-length hex string/i)).toBeDefined()
    })

    it('shows payload error for odd-length hex string', () => {
        render(<CanSender />)
        fillRequiredFields()
        fireEvent.change(screen.getByPlaceholderText(/DEADBEEF/i), {
            target: { value: 'DEA' },
        })
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        expect(screen.getByText(/valid JSON or an even-length hex string/i)).toBeDefined()
    })

    it('shows payload error when hex exceeds 8 bytes', () => {
        render(<CanSender />)
        fillRequiredFields()
        fireEvent.change(screen.getByPlaceholderText(/DEADBEEF/i), {
            target: { value: 'DEADBEEFDEADBEEFFF' }, // 9 bytes
        })
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        expect(screen.getByText(/exceeds 8 bytes/i)).toBeDefined()
    })

    it('does not call sendCommand when validation fails', () => {
        render(<CanSender />)
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        expect(mockSendCommand).not.toHaveBeenCalled()
    })

    it('clears field error when user corrects the input', () => {
        render(<CanSender />)
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        expect(screen.getAllByText('Required').length).toBeGreaterThan(0)
        fireEvent.change(screen.getByPlaceholderText(/e\.g\. SENSOR_BOARD/i), {
            target: { value: 'BOARD' },
        })
        // Errors for other fields still shown but board_type_id error gone
        const remaining = screen.getAllByText('Required')
        expect(remaining.length).toBe(3)
    })
})

describe('CanSender – sending', () => {
    beforeEach(() => {
        mockSendCommand.mockReset()
    })

    it('calls sendCommand with correct structure on valid submit', () => {
        render(<CanSender />)
        fillRequiredFields()
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))

        expect(mockSendCommand).toHaveBeenCalledOnce()
        const cmd: CANCommandMessage = mockSendCommand.mock.calls[0][0]
        expect(cmd.boardTypeId).toBe('SENSOR_BOARD')
        expect(cmd.boardInstId).toBe('0')
        expect(cmd.msgType).toBe('ACTUATE')
        expect(cmd.msgPrio).toBe('MEDIUM') // default
        expect(cmd.canMsg).toBeNull()
        expect(cmd.parsley).toBe('myhostname/usb/COM3')
        expect(cmd.messageFormatVersion).toBe(2)
    })

    it('sends correct priority when changed', () => {
        render(<CanSender />)
        fillRequiredFields()
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'HIGH' } })
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        const cmd: CANCommandMessage = mockSendCommand.mock.calls[0][0]
        expect(cmd.msgPrio).toBe('HIGH')
    })

    it('parses hex payload into byte array', () => {
        render(<CanSender />)
        fillRequiredFields()
        fireEvent.change(screen.getByPlaceholderText(/DEADBEEF/i), {
            target: { value: '8FFF' },
        })
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        const cmd: CANCommandMessage = mockSendCommand.mock.calls[0][0]
        expect(cmd.canMsg).toEqual([0x8f, 0xff])
    })

    it('parses JSON payload into object', () => {
        render(<CanSender />)
        fillRequiredFields()
        fireEvent.change(screen.getByPlaceholderText(/DEADBEEF/i), {
            target: { value: '{"key": 42}' },
        })
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        const cmd: CANCommandMessage = mockSendCommand.mock.calls[0][0]
        expect(cmd.canMsg).toEqual({ key: 42 })
    })

    it('shows success status after send', () => {
        render(<CanSender />)
        fillRequiredFields()
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        expect(screen.getByText(/command sent/i)).toBeDefined()
    })

    it('shows error status when sendCommand throws', () => {
        mockSendCommand.mockImplementationOnce(() => {
            throw new Error('Not connected to Omnibus')
        })
        render(<CanSender />)
        fillRequiredFields()
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        expect(screen.getByText(/not connected to omnibus/i)).toBeDefined()
    })

    it('does not clear field values after a successful send', () => {
        render(<CanSender />)
        fillRequiredFields()
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        const input = screen.getByPlaceholderText(/e\.g\. SENSOR_BOARD/i) as HTMLInputElement
        expect(input.value).toBe('SENSOR_BOARD')
    })

    it('adds entry to history after successful send', () => {
        render(<CanSender />)
        fillRequiredFields()
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        expect(useCanSenderStore.getState().addToHistory).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'success' })
        )
    })

    it('adds error entry to history when sendCommand throws', () => {
        mockSendCommand.mockImplementationOnce(() => { throw new Error('oops') })
        render(<CanSender />)
        fillRequiredFields()
        fireEvent.click(screen.getByRole('button', { name: /^SEND$/ }))
        expect(useCanSenderStore.getState().addToHistory).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'error', errorMessage: 'oops' })
        )
    })
})

describe('CanSender – load command', () => {
    it('populates fields when loadCommand is called via history', () => {
        const cmd: CANCommandMessage = {
            boardTypeId: 'FLIGHT_COMPUTER',
            boardInstId: '1',
            msgType: 'ARM',
            msgPrio: 'HIGHEST',
            canMsg: null,
            parsley: '',
            messageFormatVersion: 2,
        }
        vi.mocked(useCanSenderStore).mockReturnValue({
            history: [{ id: '1', timestamp: Date.now(), command: cmd, status: 'success' }],
            favorites: [],
            addToHistory: vi.fn(),
            addFavorite: vi.fn(),
            removeFavorite: vi.fn(),
            clearHistory: vi.fn(),
        })
        render(<CanSender />)
        fireEvent.click(screen.getByText('↑ Load'))
        expect((screen.getByPlaceholderText(/e\.g\. SENSOR_BOARD/i) as HTMLInputElement).value).toBe('FLIGHT_COMPUTER')
        expect((screen.getByPlaceholderText(/e\.g\. 0/i) as HTMLInputElement).value).toBe('1')
        expect((screen.getByPlaceholderText(/e\.g\. ACTUATE/i) as HTMLInputElement).value).toBe('ARM')
        expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('HIGHEST')
    })
})
