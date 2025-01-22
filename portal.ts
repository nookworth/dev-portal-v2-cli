import { mainMenu, prActions } from './menus'
import { fetchPRs, resolveActionChoice } from './utils'
import { cache, PR } from './cache'
import process from 'node:process'
import { styleText } from 'util'
import './events'
import './webSocket'

const onOpenMessage = styleText('gray', 'Fetching your PRs...')
console.log(onOpenMessage + '\n')

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

const prChoice = await mainMenu()

if (prChoice === 0) {
  console.log('Goodbye 👋')
  process.exit(0)
}

const actionChoice = await prActions(prChoice)
await resolveActionChoice(actionChoice, prChoice)
