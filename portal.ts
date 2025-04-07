import { loopToMain } from './utils/menu'
import { cache } from './cache'
import { styleText } from 'util'
import { getPRs } from './utils/api'
import './process'

const onOpenMessage = styleText('gray', 'Fetching your PRs...')
console.log(onOpenMessage + '\n')

// Fetch PRs and update cache on startup
try {
  const prsFromGitHub = await getPRs()
  const cachedPRs = cache.prs
  const tempCache = {}

  prsFromGitHub?.forEach(pr => {
    const { number, ref, title, url } = pr
    tempCache[number] = { number, ref, title, url }
  })

  for (const pr in cachedPRs) {
    const latestPRData = tempCache[pr]
    if (latestPRData) {
      tempCache[pr] = {
        ...cachedPRs[pr],
        ...latestPRData,
      }
    }
  }

  cache.prs = tempCache
} catch (err) {
  console.error('Error fetching PRs:', err)
}

await loopToMain()
