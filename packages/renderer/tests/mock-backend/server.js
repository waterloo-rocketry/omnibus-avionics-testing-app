const io = require('socket.io')(8081, {
    cors: { origin: '*' },
    parser: require('socket.io-msgpack-parser'),
});

io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    
    // Log all events for debugging
    socket.onAny((eventName, ...args) => {
        console.log(`📨 Event: ${eventName}`, args);
    });
    
    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

console.log('🚀 Mock Omnibus server running on http://localhost:8081');
console.log('   Using msgpack parser (matching omnibus-ts client)');