import { createPr, mainMenu, prActions } from './menus'
import { fetchPRs, resolveActionChoice } from './utils'
import { cache, PR } from './cache'
import process from 'node:process'
import { styleText } from 'util'
import { goodbyeMessages } from './constants'
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
  prData.forEach(({ number, status, title, url }) => {
    cache.prs[number] = { number, status, title, url }
  })
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
