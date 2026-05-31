import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandHistory } from '@/components/CanSender/CommandHistory'
import { useCanSenderStore } from '@/store/canSenderStore'
import type { CANCommandMessage } from '@waterloorocketry/omnibus-ts'

vi.mock('@/store/canSenderStore', () => {
    const clearHistory = vi.fn()
    return {
        useCanSenderStore: Object.assign(
            vi.fn(() => ({ history: [], clearHistory })),
            { getState: vi.fn(() => ({ clearHistory })) }
        ),
    }
})

const mockCmd = (overrides: Partial<CANCommandMessage> = {}): CANCommandMessage => ({
    boardTypeId: 'SENSOR_BOARD',
    boardInstId: '0',
    msgType: 'ACTUATE',
    msgPrio: 'MEDIUM',
    canMsg: null,
    parsley: '',
    messageFormatVersion: 2,
    ...overrides,
})

describe('CommandHistory', () => {
    beforeEach(() => {
        vi.mocked(useCanSenderStore).mockReturnValue({
            history: [],
            clearHistory: vi.fn(),
        } as any)
    })

    it('renders nothing when history is empty', () => {
        const { container } = render(<CommandHistory onLoad={vi.fn()} />)
        expect(container.firstChild).toBeNull()
    })

    it('renders an entry for each history item', () => {
        vi.mocked(useCanSenderStore).mockReturnValue({
            history: [
                { id: '1', timestamp: Date.now(), command: mockCmd(), status: 'success' },
                { id: '2', timestamp: Date.now(), command: mockCmd({ boardTypeId: 'FLIGHT_COMPUTER' }), status: 'error', errorMessage: 'oops' },
            ],
            clearHistory: vi.fn(),
        } as any)
        render(<CommandHistory onLoad={vi.fn()} />)
        const loadButtons = screen.getAllByText('↑ Load')
        expect(loadButtons.length).toBe(2)
    })

    it('shows board/msg summary text', () => {
        vi.mocked(useCanSenderStore).mockReturnValue({
            history: [
                { id: '1', timestamp: Date.now(), command: mockCmd(), status: 'success' },
            ],
            clearHistory: vi.fn(),
        } as any)
        render(<CommandHistory onLoad={vi.fn()} />)
        expect(screen.getByText(/SENSOR_BOARD\/0/)).toBeDefined()
        expect(screen.getByText(/ACTUATE/)).toBeDefined()
        expect(screen.getByText(/MEDIUM/)).toBeDefined()
    })

    it('shows ✓ badge for successful entries', () => {
        vi.mocked(useCanSenderStore).mockReturnValue({
            history: [{ id: '1', timestamp: Date.now(), command: mockCmd(), status: 'success' }],
            clearHistory: vi.fn(),
        } as any)
        render(<CommandHistory onLoad={vi.fn()} />)
        expect(screen.getByText('✓')).toBeDefined()
    })

    it('shows ✗ badge for error entries', () => {
        vi.mocked(useCanSenderStore).mockReturnValue({
            history: [{ id: '1', timestamp: Date.now(), command: mockCmd(), status: 'error', errorMessage: 'failed' }],
            clearHistory: vi.fn(),
        } as any)
        render(<CommandHistory onLoad={vi.fn()} />)
        expect(screen.getByText('✗')).toBeDefined()
    })

    it('shows error message text when present', () => {
        vi.mocked(useCanSenderStore).mockReturnValue({
            history: [{ id: '1', timestamp: Date.now(), command: mockCmd(), status: 'error', errorMessage: 'Not connected' }],
            clearHistory: vi.fn(),
        } as any)
        render(<CommandHistory onLoad={vi.fn()} />)
        expect(screen.getByText('Not connected')).toBeDefined()
    })

    it('does not show error message text for successful entries', () => {
        vi.mocked(useCanSenderStore).mockReturnValue({
            history: [{ id: '1', timestamp: Date.now(), command: mockCmd(), status: 'success' }],
            clearHistory: vi.fn(),
        } as any)
        render(<CommandHistory onLoad={vi.fn()} />)
        expect(screen.queryByText('Not connected')).toBeNull()
    })

    it('calls onLoad with the command when Load button is clicked', () => {
        const cmd = mockCmd({ boardTypeId: 'FLIGHT_COMPUTER' })
        const onLoad = vi.fn()
        vi.mocked(useCanSenderStore).mockReturnValue({
            history: [{ id: '1', timestamp: Date.now(), command: cmd, status: 'success' }],
            clearHistory: vi.fn(),
        } as any)
        render(<CommandHistory onLoad={onLoad} />)
        fireEvent.click(screen.getByText('↑ Load'))
        expect(onLoad).toHaveBeenCalledOnce()
        expect(onLoad).toHaveBeenCalledWith(cmd)
    })

    it('calls clearHistory when Clear button is clicked', () => {
        const clearHistory = vi.fn()
        vi.mocked(useCanSenderStore).mockReturnValue({
            history: [{ id: '1', timestamp: Date.now(), command: mockCmd(), status: 'success' }],
            clearHistory,
        } as any)
        render(<CommandHistory onLoad={vi.fn()} />)
        fireEvent.click(screen.getByText('Clear'))
        expect(clearHistory).toHaveBeenCalledOnce()
    })
})
