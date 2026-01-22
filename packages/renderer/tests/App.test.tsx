import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import App from '@/App';

describe('App Component', () => {
    it('renders without crashing', () => {
        const { getByText } = render(<App />);
        expect(getByText(/Disconnected/i)).toBeDefined();
    });
    
    it('shows Connect to Omnibus button initially', () => {
        const { getByText } = render(<App />);
        expect(getByText(/Connect to Omnibus/i)).toBeDefined();
    });
});
