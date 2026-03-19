import { Server } from 'socket.io';
import msgpackParser from 'socket.io-msgpack-parser';

const io = new Server(8081, {
    cors: { origin: '*' },
    parser: msgpackParser,
});

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Log all events for debugging
    socket.onAny((eventName, ...args) => {
        console.log(`Event: ${eventName}`, args);
    });
    
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

process.on('SIGTERM', () => {
    io.close(() => process.exit(0));
});
process.on('SIGINT', () => {
    io.close(() => process.exit(0));
});

console.log('Mock Omnibus server running on http://localhost:8081');
console.log('   Using msgpack parser (matching omnibus-ts client)');