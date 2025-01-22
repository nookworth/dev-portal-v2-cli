import { WebSocket } from 'ws'
import { devMode } from './constants'

const url =
  devMode === 'true'
    ? 'ws://localhost:8080'
    : 'wss://tpg-dev-portal-server.fly.dev'
const ws = new WebSocket(url)

ws.onmessage = event => {
  console.log('Received message from server:', event.data)
}
