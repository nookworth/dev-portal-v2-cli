import { saveCache } from './utils'
import { fetchPRs } from './utils'
import { cache } from './cache'
import type { PR } from './cache'

// Fetch PRs and update cache on startup
try {
  const prs = await fetchPRs()
  const prData = prs.map(({ number, status, title, url }: PR) => ({
    number,
    status,
    title,
    url,
  }))
  if (!cache.prs.length) {
    cache.prs = prData
  } else {
    // if an existing PR has changed, update those properties
    cache.prs = prData.map(({ number, status, title, url }) => {
      const existingPr = cache.prs.find(p => p.number === number)
      if (existingPr) {
        return {
          ...existingPr,
          ...{ status, title, url },
        }
      }
      return { number, status, title, url }
    })
  }
} catch (err) {
  console.error('Error fetching PRs:', err)
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
