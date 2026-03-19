import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OmnibusProvider } from '@/components/OmnibusProvider';
import App from '@/App';
import { spawn } from 'child_process';

describe('App Integration Tests with Mock Server', () => {
    let serverProcess: any;

    beforeAll(async () => {
        // Start the mock server
        serverProcess = spawn('node', ['tests/mock-backend/server.js'], {
            cwd: process.cwd(),
            detached: true,
            stdio: 'ignore'
        });
        
        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    afterAll(() => {
    // Stop the mock server
    if (serverProcess) {
        try {
            process.kill(-serverProcess.pid);
        } catch (err) {
            // Server already stopped, that's fine
        }
    }
});

    it('successfully connects to mock server', async () => {
        render(
            <OmnibusProvider>
                <App />
            </OmnibusProvider>
        );
        
        // Open dialog
        const connectButton = screen.getByText(/Connect to Omnibus/i);
        fireEvent.click(connectButton);
        
        // Enter server address
        const input = screen.getByLabelText(/Server Address/i);
        fireEvent.change(input, { target: { value: 'http://localhost:8081' } });
        
        // Click connect
        const dialogConnectButton = screen.getByRole('button', { name: /^Connect$/i });
        fireEvent.click(dialogConnectButton);
        
        // Wait for connection
        await waitFor(() => {
            expect(screen.getByText(/Connected to http:\/\/localhost:8081/i)).toBeDefined();
        }, { timeout: 5000 });
    });

    it('successfully disconnects from mock server', async () => {
        render(
            <OmnibusProvider>
                <App />
            </OmnibusProvider>
        );
        
        // Connect first
        const connectButton = screen.getByText(/Connect to Omnibus/i);
        fireEvent.click(connectButton);
        
        const input = screen.getByLabelText(/Server Address/i);
        fireEvent.change(input, { target: { value: 'http://localhost:8081' } });
        
        const dialogConnectButton = screen.getByRole('button', { name: /^Connect$/i });
        fireEvent.click(dialogConnectButton);
        
        // Wait for connection
        await waitFor(() => {
            expect(screen.getByText(/Connected/i)).toBeDefined();
        }, { timeout: 5000 });
        
        // Now disconnect
        const disconnectButton = screen.getByText(/Disconnect/i);
        fireEvent.click(disconnectButton);
        
        // Verify disconnected
        await waitFor(() => {
            expect(screen.getByText(/Disconnected/i)).toBeDefined();
        });
    });
});