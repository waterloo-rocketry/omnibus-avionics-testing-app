import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CanSender } from '@/components/CanSender/CanSender'

describe('CanSender Component', () => {
    it('renders all form fields', () => {
        render(<CanSender />)

        expect(screen.getByLabelText(/msg_type/i)).toBeDefined()
        expect(screen.getByLabelText(/msg_prio/i)).toBeDefined()
        expect(screen.getByLabelText(/board_type_id/i)).toBeDefined()
        expect(screen.getByLabelText(/board_inst_id/i)).toBeDefined()
        expect(screen.getByLabelText(/time/i)).toBeDefined()
        expect(screen.getByRole('button', { name: /send/i })).toBeDefined()
    })

    it('displays placeholders with JSON examples', () => {
        render(<CanSender />)

        expect(screen.getByPlaceholderText(/{"value": 1}/i)).toBeDefined()
        expect(screen.getByPlaceholderText(/{"priority": 2}/i)).toBeDefined()
        expect(screen.getByPlaceholderText(/{"id": "abc123"}/i)).toBeDefined()
        expect(screen.getByPlaceholderText(/{"inst": 5}/i)).toBeDefined()
        expect(screen.getByPlaceholderText(/{"seconds": 10}/i)).toBeDefined()
    })

    it('accepts valid JSON input', () => {
        render(<CanSender />)

        const msgTypeInput = screen.getByLabelText(/msg_type/i) as HTMLInputElement
        fireEvent.change(msgTypeInput, { target: { value: '{"type": 1}' } })

        expect(msgTypeInput.value).toBe('{"type": 1}')
    })

    it('shows validation error for invalid JSON', async () => {
        render(<CanSender />)

        const msgTypeInput = screen.getByLabelText(/msg_type/i)
        const submitButton = screen.getByRole('button', { name: /send/i })

        // Enter invalid JSON
        fireEvent.change(msgTypeInput, { target: { value: '{invalid json}' } })
        fireEvent.click(submitButton)

        // Wait for validation error to appear
        await waitFor(() => {
            expect(screen.getByText(/Invalid JSON format/i)).toBeDefined()
        })
    })

    it('allows empty fields', async () => {
        const consoleSpy = vi.spyOn(console, 'log')
        render(<CanSender />)

        const submitButton = screen.getByRole('button', { name: /send/i })
        fireEvent.click(submitButton)

        // Should submit without errors when all fields are empty
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith({
                msg_type: null,
                msg_prio: null,
                board_type_id: null,
                board_inst_id: null,
                time: null,
            })
        })

        consoleSpy.mockRestore()
    })

    it('parses and submits valid JSON data', async () => {
        const consoleSpy = vi.spyOn(console, 'log')
        render(<CanSender />)

        // Fill in all fields with valid JSON
        fireEvent.change(screen.getByLabelText(/msg_type/i), { target: { value: '{"type": 1}' } })
        fireEvent.change(screen.getByLabelText(/msg_prio/i), { target: { value: '{"priority": 2}' } })
        fireEvent.change(screen.getByLabelText(/board_type_id/i), { target: { value: '{"id": "abc123"}' } })
        fireEvent.change(screen.getByLabelText(/board_inst_id/i), { target: { value: '{"inst": 5}' } })
        fireEvent.change(screen.getByLabelText(/time \(s\)/i), { target: { value: '{"seconds": 10}' } })

        const submitButton = screen.getByRole('button', { name: /send/i })
        fireEvent.click(submitButton)

        // Verify parsed data is logged
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith({
                msg_type: { type: 1 },
                msg_prio: { priority: 2 },
                board_type_id: { id: "abc123" },
                board_inst_id: { inst: 5 },
                time: { seconds: 10 },
            })
        })

        consoleSpy.mockRestore()
    })

    it('accepts various JSON types (string, number, boolean, array)', async () => {
        const consoleSpy = vi.spyOn(console, 'log')
        render(<CanSender />)

        // Test different JSON types
        fireEvent.change(screen.getByLabelText(/msg_type/i), { target: { value: '"string_value"' } })
        fireEvent.change(screen.getByLabelText(/msg_prio/i), { target: { value: '123' } })
        fireEvent.change(screen.getByLabelText(/board_type_id/i), { target: { value: 'true' } })
        fireEvent.change(screen.getByLabelText(/board_inst_id/i), { target: { value: '[1, 2, 3]' } })
        fireEvent.change(screen.getByLabelText(/time \(s\)/i), { target: { value: 'null' } })

        const submitButton = screen.getByRole('button', { name: /send/i })
        fireEvent.click(submitButton)

        // Verify parsed data with different types
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith({
                msg_type: "string_value",
                msg_prio: 123,
                board_type_id: true,
                board_inst_id: [1, 2, 3],
                time: null,
            })
        })

        consoleSpy.mockRestore()
    })

    it('shows multiple validation errors when multiple fields have invalid JSON', async () => {
        render(<CanSender />)

        // Enter invalid JSON in multiple fields
        fireEvent.change(screen.getByLabelText(/msg_type/i), { target: { value: '{invalid}' } })
        fireEvent.change(screen.getByLabelText(/msg_prio/i), { target: { value: 'not json' } })

        const submitButton = screen.getByRole('button', { name: /send/i })
        fireEvent.click(submitButton)

        // Wait for validation errors to appear
        await waitFor(() => {
            const errorMessages = screen.getAllByText(/Invalid JSON format/i)
            expect(errorMessages.length).toBe(2)
        })
    })

    it('clears validation errors when valid JSON is entered', async () => {
        render(<CanSender />)

        const msgTypeInput = screen.getByLabelText(/msg_type/i)
        const submitButton = screen.getByRole('button', { name: /send/i })

        // Enter invalid JSON first
        fireEvent.change(msgTypeInput, { target: { value: '{invalid}' } })
        fireEvent.click(submitButton)

        // Wait for error to appear
        await waitFor(() => {
            expect(screen.getByText(/Invalid JSON format/i)).toBeDefined()
        })

        // Clear and enter valid JSON
        fireEvent.change(msgTypeInput, { target: { value: '{"type": 1}' } })

        // Error should disappear
        await waitFor(() => {
            expect(screen.queryByText(/Invalid JSON format/i)).toBeNull()
        })
    })
})
