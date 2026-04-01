import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '@/App'

describe('App Component', () => {
    it('renders without crashing', () => {
        render(<App />)
        expect(screen.getByText(/Disconnected/i)).toBeDefined()
    })
})
