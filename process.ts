import { saveCache } from './utils/file'

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
