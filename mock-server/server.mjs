/**
 * Mock Omnibus server for manual CAN sender testing.
 *
 * - Accepts connections from the app (connect to http://localhost:8081)
 * - Logs every CAN/Commands message the app sends
 * - Emits a handful of fake CAN/Parsley board-status messages on connect
 *   so the board status panel populates too
 *
 * Usage:
 *   cd mock-server && npm install && npm start
 *
 * Then in the app, click "Connect to Omnibus" and enter: http://localhost:8081
 */

import { createServer } from 'http'
import { Server } from 'socket.io'
import * as msgpackParser from 'socket.io-msgpack-parser'

const PORT = 8082

const httpServer = createServer()
const io = new Server(httpServer, {
    cors: { origin: '*' },
    parser: msgpackParser,
})

// ---------------------------------------------------------------------------
// Fake boards to populate the status dashboard on connect
// ---------------------------------------------------------------------------
const FAKE_BOARDS = [
    {
        board_type_id: 'SENSOR_BOARD',
        board_inst_id: '0',
        msg_prio: 'MEDIUM',
        msg_type: 'SENSOR_STATUS',
        data: { temperature: 23.4, pressure: 101325, voltage: 3.3 },
        parsley: '',
        message_format_version: 2,
    },
    {
        board_type_id: 'FLIGHT_COMPUTER',
        board_inst_id: '0',
        msg_prio: 'HIGH',
        msg_type: 'STATE',
        data: { state: 'IDLE', uptime_ms: 12345 },
        parsley: '',
        message_format_version: 2,
    },
    {
        board_type_id: 'INJECTOR_VALVE',
        board_inst_id: '1',
        msg_prio: 'HIGHEST',
        msg_type: 'VALVE_STATUS',
        data: { position: 'CLOSED', actuations: 0 },
        parsley: '',
        message_format_version: 2,
    },
]

// ---------------------------------------------------------------------------
// Connection handler
// ---------------------------------------------------------------------------
io.on('connection', (socket) => {
    console.log(`[mock] Client connected: ${socket.id}`)

    // Send fake board statuses so the dashboard has something to show
    for (const board of FAKE_BOARDS) {
        socket.emit('CAN/Parsley', Date.now(), board)
    }
    console.log(`[mock] Emitted ${FAKE_BOARDS.length} fake board status messages`)

    // Log every CAN/Commands message the app sends
    socket.onAny((channel, timestamp, payload) => {
        if (channel === 'CAN/Commands') {
            console.log('\n[mock] ← CAN/Commands received:')
            console.log('  timestamp:', timestamp)
            console.log('  payload:  ', JSON.stringify(payload, null, 4))

            // Echo it back as a CAN/Parsley update on the target board so the
            // board status panel reflects the command was "received"
        } else {
            console.log(`[mock] ← ${channel}:`, JSON.stringify(payload))
        }
    })

    socket.on('disconnect', () => {
        console.log(`[mock] Client disconnected: ${socket.id}`)
    })
})

httpServer.listen(PORT, () => {
    console.log(`\nOmnibus mock server running on http://localhost:${PORT}`)
    console.log(`In the app, click "Connect to Omnibus" and enter: http://localhost:${PORT}\n`)
})
