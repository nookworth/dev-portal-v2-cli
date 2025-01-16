import { select } from '@inquirer/prompts'
import { fetchSinglePR, postToSlack } from '../utils'
import { cache, theme } from '../constants'
import { exec } from 'child_process'
import { mainMenu } from './mainMenu'

export const prActions = async (prChoice: number) => {
  if (!cache.prDetails?.[prChoice]) {
    const selectedPR = await fetchSinglePR(prChoice)
    cache.prDetails = {
      ...cache.prDetails,
      [prChoice]: selectedPR,
    }
  }

  const selectedPR = cache.prDetails[prChoice]
  const { mergeable } = selectedPR

  const actionChoice = await select({
    message: 'Select an action:',
    choices: [
      {
        name: 'Post to Slack',
        value: 'slack',
      },
      {
        name: 'Merge',
        value: 'merge',
        disabled: !mergeable,
      },
      {
        name: 'Open GitHub',
        value: 'url',
      },
      {
        name: '⬅️  Go Back',
        value: 'back',
      },
    ],
    theme,
  })

  switch (actionChoice) {
    case 'back': {
      const prChoice = await mainMenu()
      if (prChoice === 0) {
        console.log('Goodbye 👋')
        process.exit(0)
      }
      return prActions(prChoice)
    }
    case 'slack': {
      const { url, title } =
        cache.prs?.find(({ number }) => number === prChoice) ?? {}
      if (title && url) {
        await postToSlack({
          title,
          url,
        })
      }
      return prActions(prChoice)
    }
    case 'url': {
      const prUrl = cache.prs?.find(({ number }) => number === prChoice)?.url

      if (prUrl) {
        // Determine the platform and execute the appropriate command
        const command =
          process.platform === 'win32'
            ? `start "" "${prUrl}"` // Windows
            : process.platform === 'darwin'
            ? `open "${prUrl}"` // macOS
            : `xdg-open "${prUrl}"` // Linux

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

      return prActions(prChoice)
    }
  }
}
