import { Server } from 'socket.io';
import msgpackParser from 'socket.io-msgpack-parser';

const io = new Server(8081, {
    cors: { origin: '*' },
    parser: msgpackParser,
});

const STATUSES = ['OK', 'WARNING', 'ERROR'];

const SERIES_NAMES = ['FC-01', 'TM-02'];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function generateUpdates() {
    const updates = {};
    for (const name of SERIES_NAMES) {
        updates[name] = {
            msgPrio: randomInt(1, 10),
            status: STATUSES[randomInt(0, 2)],
            value: randomFloat(0.0, 100.0),
        };
    }
    return updates;
}

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    const interval = setInterval(() => {
        const updates = generateUpdates();
        socket.emit('avionics_update', updates);
    }, 500);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        clearInterval(interval);
    });
});

console.log('Mock Omnibus server running on http://localhost:8081');
console.log('   Using msgpack parser (matching omnibus-ts client)');