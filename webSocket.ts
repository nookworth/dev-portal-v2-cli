import { WebSocket } from 'ws'
import { styleText } from 'util'
import { devMode } from './constants'

const url = devMode
  ? 'ws://localhost:3000'
  : 'wss://tpg-dev-portal-server.fly.dev'
const ws = new WebSocket(url)

ws.onopen = async () => {
  const onOpenMessage = styleText('gray', '(websocket connected)')
  console.log('\n' + onOpenMessage)
}

ws.onmessage = event => {
  console.log('Received message from server:', event.data)
}
