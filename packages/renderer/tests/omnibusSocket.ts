import { io } from 'socket.io-client';
import msgpackParser from 'socket.io-msgpack-parser';
import { useAvionicsStore } from '@/store/omnibusStore';
import type { LatestDataPoint } from '@/store/omnibusStore';

let socket: ReturnType<typeof io> | null = null;

export function connectAvionicsSocket() {
    if (socket) return; // already connected

    socket = io('http://localhost:8081', {
        parser: msgpackParser,
    });

    socket.on('connect', () => {
        console.log('Connected to avionics server:', socket?.id);
    });

    socket.on('avionics_update', (updates: Record<string, LatestDataPoint>) => {
        useAvionicsStore.getState().updateMultipleSeries(updates);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from avionics server');
    });

    socket.on('connect_error', (err) => {
        console.error('Connection error:', err.message);
    });
}

export function disconnectAvionicsSocket() {
    socket?.disconnect();
    socket = null;
}