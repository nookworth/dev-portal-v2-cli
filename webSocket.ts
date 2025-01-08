import { WebSocket } from 'ws'
import { styleText } from 'util'

const ws = new WebSocket('ws://localhost:3000')

ws.onopen = async () => {
  const onOpenMessage = styleText('gray', '(websocket connected)')
  console.log('\n' + onOpenMessage)
}

ws.onmessage = event => {
  console.log('Received message from server:', event.data)
}
