import {describe, expect, it} from 'vitest';
import { render, fireEvent } from '@testing-library/react'
import App from '../src/App.tsx'

describe('app main apge', () => {
  it('renders app component', () => {
    const component = render(<App />)
    expect(component).toBeDefined()
    expect(component.getByText('Vite + React')).toBeDefined()
  })
  it('counter increments', () => {
    const component = render(<App />)
    expect(component.getByRole("button")).toBeDefined()
    expect(component.getByRole("button").textContent).toContain("0")
    fireEvent.click(component.getByRole("button"))
    expect(component.getByRole("button").textContent).toContain("1")
  })
})
