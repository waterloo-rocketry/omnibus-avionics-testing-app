import { describe, expect, it, beforeEach } from 'vitest'
import { useCanSenderStore } from '@/store/canSenderStore'
import type { CANCommandMessage } from '@waterloorocketry/omnibus-ts'

const BASE_CMD: CANCommandMessage = {
    boardTypeId: 'SENSOR_BOARD',
    boardInstId: '0',
    msgType: 'ACTUATE',
    msgPrio: 'MEDIUM',
    canMsg: null,
    parsley: '',
    messageFormatVersion: 2,
}

function resetStore() {
    useCanSenderStore.setState({ history: [], favorites: [] })
}

describe('canSenderStore – history', () => {
    beforeEach(resetStore)

    it('starts with empty history', () => {
        expect(useCanSenderStore.getState().history).toHaveLength(0)
    })

    it('addToHistory prepends an entry with a generated id', () => {
        useCanSenderStore.getState().addToHistory({
            timestamp: 1000,
            command: BASE_CMD,
            status: 'success',
        })
        const { history } = useCanSenderStore.getState()
        expect(history).toHaveLength(1)
        expect(history[0].id).toBeTruthy()
        expect(history[0].status).toBe('success')
        expect(history[0].command).toEqual(BASE_CMD)
    })

    it('addToHistory prepends so newest entry is first', () => {
        useCanSenderStore.getState().addToHistory({ timestamp: 1000, command: BASE_CMD, status: 'success' })
        useCanSenderStore.getState().addToHistory({ timestamp: 2000, command: { ...BASE_CMD, msgType: 'SECOND' }, status: 'success' })
        const { history } = useCanSenderStore.getState()
        expect(history[0].command.msgType).toBe('SECOND')
        expect(history[1].command.msgType).toBe('ACTUATE')
    })

    it('stores error message on failed entries', () => {
        useCanSenderStore.getState().addToHistory({
            timestamp: 1000,
            command: BASE_CMD,
            status: 'error',
            errorMessage: 'Not connected',
        })
        expect(useCanSenderStore.getState().history[0].errorMessage).toBe('Not connected')
    })

    it('each entry has a unique id', () => {
        useCanSenderStore.getState().addToHistory({ timestamp: 1, command: BASE_CMD, status: 'success' })
        useCanSenderStore.getState().addToHistory({ timestamp: 2, command: BASE_CMD, status: 'success' })
        const { history } = useCanSenderStore.getState()
        expect(history[0].id).not.toBe(history[1].id)
    })

    it('caps history at 50 entries', () => {
        for (let i = 0; i < 55; i++) {
            useCanSenderStore.getState().addToHistory({ timestamp: i, command: BASE_CMD, status: 'success' })
        }
        expect(useCanSenderStore.getState().history).toHaveLength(50)
    })

    it('discards oldest entries when cap is exceeded', () => {
        for (let i = 0; i < 50; i++) {
            useCanSenderStore.getState().addToHistory({
                timestamp: i,
                command: { ...BASE_CMD, msgType: `MSG_${i}` },
                status: 'success',
            })
        }
        // Add one more — oldest (MSG_0) should be gone
        useCanSenderStore.getState().addToHistory({
            timestamp: 99,
            command: { ...BASE_CMD, msgType: 'NEWEST' },
            status: 'success',
        })
        const { history } = useCanSenderStore.getState()
        expect(history).toHaveLength(50)
        expect(history[0].command.msgType).toBe('NEWEST')
        expect(history.find((e) => e.command.msgType === 'MSG_0')).toBeUndefined()
    })

    it('clearHistory empties the list', () => {
        useCanSenderStore.getState().addToHistory({ timestamp: 1, command: BASE_CMD, status: 'success' })
        useCanSenderStore.getState().clearHistory()
        expect(useCanSenderStore.getState().history).toHaveLength(0)
    })
})

describe('canSenderStore – favorites', () => {
    beforeEach(resetStore)

    it('starts with empty favorites', () => {
        expect(useCanSenderStore.getState().favorites).toHaveLength(0)
    })

    it('addFavorite appends an entry with label and generated id', () => {
        useCanSenderStore.getState().addFavorite('Actuate valve', BASE_CMD)
        const { favorites } = useCanSenderStore.getState()
        expect(favorites).toHaveLength(1)
        expect(favorites[0].label).toBe('Actuate valve')
        expect(favorites[0].command).toEqual(BASE_CMD)
        expect(favorites[0].id).toBeTruthy()
    })

    it('can add multiple favorites', () => {
        useCanSenderStore.getState().addFavorite('First', BASE_CMD)
        useCanSenderStore.getState().addFavorite('Second', { ...BASE_CMD, msgType: 'OTHER' })
        expect(useCanSenderStore.getState().favorites).toHaveLength(2)
    })

    it('each favorite has a unique id', () => {
        useCanSenderStore.getState().addFavorite('A', BASE_CMD)
        useCanSenderStore.getState().addFavorite('B', BASE_CMD)
        const { favorites } = useCanSenderStore.getState()
        expect(favorites[0].id).not.toBe(favorites[1].id)
    })

    it('removeFavorite removes the entry with the given id', () => {
        useCanSenderStore.getState().addFavorite('Keep', BASE_CMD)
        useCanSenderStore.getState().addFavorite('Remove', BASE_CMD)
        const idToRemove = useCanSenderStore.getState().favorites.find((f) => f.label === 'Remove')!.id
        useCanSenderStore.getState().removeFavorite(idToRemove)
        const { favorites } = useCanSenderStore.getState()
        expect(favorites).toHaveLength(1)
        expect(favorites[0].label).toBe('Keep')
    })

    it('removeFavorite with unknown id is a no-op', () => {
        useCanSenderStore.getState().addFavorite('Keep', BASE_CMD)
        useCanSenderStore.getState().removeFavorite('nonexistent-id')
        expect(useCanSenderStore.getState().favorites).toHaveLength(1)
    })
})
