import { emitKeypressEvents } from 'readline'
import { saveCache } from './utils/file'

emitKeypressEvents(process.stdin)

if (process.stdin.isTTY) {
  process.stdin.setRawMode(true)
}

// Save cache on exit
process.on('exit', saveCache)
process.on('SIGINT', () => {
  saveCache()
  process.exit(0)
})
process.on('SIGTERM', () => {
  saveCache()
  process.exit(0)
})
