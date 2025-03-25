import { WebSocket } from 'ws'
import { test } from './constants'

const url =
  test === 'true'
    ? 'ws://localhost:8080'
    : 'wss://tpg-dev-portal-server.fly.dev'
const ws = new WebSocket(url)

ws.onmessage = event => {
  console.log('Received message from server:', event.data)
}
