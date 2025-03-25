import { createPr, mainMenu, prActions } from './menus'
import { getPRs, resolveActionChoice } from './utils'
import { cache } from './cache'
import process from 'node:process'
import { styleText } from 'util'
import { goodbyeMessages } from './constants'
import './events'
// import './webSocket'

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

const prChoice = await mainMenu()

if (prChoice === 0) {
  console.log(
    goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)]
  )
  process.exit(0)
} else if (prChoice === 1000) {
  await createPr()
} else {
  const actionChoice = await prActions(prChoice)
  await resolveActionChoice(actionChoice, prChoice)
}
