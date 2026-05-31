import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Favorites } from '@/components/CanSender/Favorites'
import { useCanSenderStore } from '@/store/canSenderStore'
import type { CANCommandMessage } from '@waterloorocketry/omnibus-ts'

vi.mock('@/store/canSenderStore', () => {
    const removeFavorite = vi.fn()
    return {
        useCanSenderStore: Object.assign(
            vi.fn(() => ({ favorites: [], removeFavorite })),
            { getState: vi.fn(() => ({ removeFavorite })) }
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

describe('Favorites', () => {
    beforeEach(() => {
        vi.mocked(useCanSenderStore).mockReturnValue({
            favorites: [],
            removeFavorite: vi.fn(),
        } as any)
    })

    it('renders nothing when favorites is empty', () => {
        const { container } = render(<Favorites onLoad={vi.fn()} />)
        expect(container.firstChild).toBeNull()
    })

    it('renders a button for each favorite label', () => {
        vi.mocked(useCanSenderStore).mockReturnValue({
            favorites: [
                { id: '1', label: 'Actuate valve', command: mockCmd() },
                { id: '2', label: 'Arm flight computer', command: mockCmd({ boardTypeId: 'FLIGHT_COMPUTER' }) },
            ],
            removeFavorite: vi.fn(),
        } as any)
        render(<Favorites onLoad={vi.fn()} />)
        expect(screen.getByText('Actuate valve')).toBeDefined()
        expect(screen.getByText('Arm flight computer')).toBeDefined()
    })

    it('calls onLoad with the command when a favorite label is clicked', () => {
        const cmd = mockCmd({ msgType: 'ARM' })
        const onLoad = vi.fn()
        vi.mocked(useCanSenderStore).mockReturnValue({
            favorites: [{ id: '1', label: 'Arm', command: cmd }],
            removeFavorite: vi.fn(),
        } as any)
        render(<Favorites onLoad={onLoad} />)
        fireEvent.click(screen.getByText('Arm'))
        expect(onLoad).toHaveBeenCalledOnce()
        expect(onLoad).toHaveBeenCalledWith(cmd)
    })

    it('calls removeFavorite with the correct id when × is clicked', () => {
        const removeFavorite = vi.fn()
        vi.mocked(useCanSenderStore).mockReturnValue({
            favorites: [{ id: 'abc-123', label: 'My fav', command: mockCmd() }],
            removeFavorite,
        } as any)
        render(<Favorites onLoad={vi.fn()} />)
        fireEvent.click(screen.getByTitle('Remove favorite'))
        expect(removeFavorite).toHaveBeenCalledOnce()
        expect(removeFavorite).toHaveBeenCalledWith('abc-123')
    })

    it('calls removeFavorite with the correct id for each respective × button', () => {
        const removeFavorite = vi.fn()
        vi.mocked(useCanSenderStore).mockReturnValue({
            favorites: [
                { id: 'id-1', label: 'First', command: mockCmd() },
                { id: 'id-2', label: 'Second', command: mockCmd() },
            ],
            removeFavorite,
        } as any)
        render(<Favorites onLoad={vi.fn()} />)
        const removeButtons = screen.getAllByTitle('Remove favorite')
        fireEvent.click(removeButtons[1])
        expect(removeFavorite).toHaveBeenCalledWith('id-2')
    })

    it('calls onLoad only for the clicked favorite, not others', () => {
        const onLoad = vi.fn()
        vi.mocked(useCanSenderStore).mockReturnValue({
            favorites: [
                { id: '1', label: 'First', command: mockCmd({ msgType: 'FIRST' }) },
                { id: '2', label: 'Second', command: mockCmd({ msgType: 'SECOND' }) },
            ],
            removeFavorite: vi.fn(),
        } as any)
        render(<Favorites onLoad={onLoad} />)
        fireEvent.click(screen.getByText('Second'))
        expect(onLoad).toHaveBeenCalledOnce()
        expect(onLoad.mock.calls[0][0].msgType).toBe('SECOND')
    })
})
