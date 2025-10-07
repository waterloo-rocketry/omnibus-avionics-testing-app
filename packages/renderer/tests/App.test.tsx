import { describe, expect, it } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import App from '@/App.tsx'

describe('app main apge', () => {
    it('renders app component', () => {
        const component = render(<App />)
        expect(component).toBeDefined()
        expect(component.getByText('Count is 0')).toBeDefined()
    })
    it('counter increments', () => {
        const component = render(<App />)
        expect(component.getByText('Increment')).toBeDefined()
        expect(component.getByText('Count is 0')).toBeDefined()
        const button = component.getByText('Increment')
        fireEvent.click(button)
        expect(component.getByText('Count is 1')).toBeDefined()
    })
})
