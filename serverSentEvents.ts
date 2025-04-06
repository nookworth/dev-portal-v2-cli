import { EventSource } from 'eventsource'
import { test, user } from './constants'

const serverSentEventsURL = test
  ? `http://localhost:8080/events/${user}`
  : `http://tpg-dev-portal-server.fly.dev/events/${user}`

const eventSource = new EventSource(serverSentEventsURL)

eventSource.onopen = () => {
  console.log('🔌 Connected to SSE stream.')
}

eventSource.onmessage = event => {
  try {
    const data = JSON.parse(event.data)
    console.log('📬 New event received:', data)
  } catch (err) {
    console.error('❌ Failed to parse SSE data:', err)
  }
}

eventSource.onerror = err => {
  console.error('⚠️ SSE connection error:', err)
}

process.on('SIGINT', () => {
  console.log('👋 Disconnecting SSE client...')
  eventSource.close()
  process.exit()
})
