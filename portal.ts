import { select } from '@inquirer/prompts'
import { fetchPRs, fetchSinglePR, postToSlack } from './utils'
import { exec } from 'child_process'
import { theme } from './constants'
import './webSocket'

const cache: {
  prs?: any[]
  prDetails?: { [key: number]: any }
} = {}

async function mainMenu() {
  const proceed = await select({
    message: 'Would you like to fetch PRs?',
    choices: [
      { name: 'Yes', value: true },
      { name: 'No', value: false },
    ],
    theme,
  })

  if (!proceed) {
    console.log('Goodbye 👋')
    process.exit(0)
  }

  await prsMenu()
}

async function prsMenu() {
  if (!cache.prs) {
    /**@todo some kind of loading indicator */
    cache.prs = await fetchPRs()
  }

  const displayInfo =
    cache.prs?.map(({ number, status, title, url }) => ({
      number,
      status,
      title,
      url,
    })) ?? []

  const prChoice = await select({
    message: 'Select a PR for more actions or go back:',
    choices: [
      ...displayInfo.map(({ number, title }) => ({
        name: `${title} (#${number})`,
        value: number,
      })),
      { name: '⬅️  Go Back', value: 'back' },
    ],
    theme,
  })

  if (prChoice === 'back') {
    return mainMenu()
  }

  await prActionsMenu(prChoice, displayInfo)
}

async function prActionsMenu(prChoice: number, displayInfo: any[]) {
  if (!cache.prDetails) {
    cache.prDetails = {}
  }

  if (!cache.prDetails[prChoice]) {
    /**@todo loading indicator */
    cache.prDetails[prChoice] = await fetchSinglePR(prChoice)
  }

  const selectedPR = cache.prDetails[prChoice]
  const { mergeable } = selectedPR ?? {}

  const actionChoice = await select({
    message: 'Select an action or go back:',
    choices: [
      { name: 'Post to Slack', value: 'slack' },
      { name: 'Merge', value: 'merge', disabled: !mergeable },
      { name: 'Open GitHub', value: 'url' },
      { name: '⬅️  Go Back', value: 'back' },
    ],
    theme,
  })

  if (actionChoice === 'back') {
    return prsMenu()
  }

  switch (actionChoice) {
    case 'url': {
      const prUrl = displayInfo.find(({ number }) => number === prChoice)?.url
      if (prUrl) {
        const command =
          process.platform === 'win32'
            ? `start "" "${prUrl}"`
            : process.platform === 'darwin'
            ? `open "${prUrl}"`
            : `xdg-open "${prUrl}"`

        exec(command, error => {
          if (error) {
            console.error('Failed to open URL:', error.message)
          } else {
            console.log(`Opened URL: ${prUrl}`)
          }
        })
      } else {
        console.error('No matching PR URL found for the selected choice.')
      }
      break
    }
    case 'slack': {
      const { url, title } = displayInfo.find(
        ({ number }) => number === prChoice
      )
      const response = await postToSlack({ title, url })
      console.log('Posted to Slack:', response)
      break
    }
  }

  return prActionsMenu(prChoice, displayInfo)
}

mainMenu()
