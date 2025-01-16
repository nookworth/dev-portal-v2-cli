import { select } from '@inquirer/prompts'
import { fetchPRs, fetchSinglePR, postToSlack } from './utils'
import { exec } from 'child_process'
import { cache, theme } from './constants'
import { mainMenu } from './menus/mainMenu'
import './webSocket'

const prChoice = await mainMenu()

const selectedPR = await fetchSinglePR(prChoice as number)
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
  ],
  theme,
})

switch (actionChoice) {
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
  }
  case 'slack': {
    const { url, title } =
      cache.prs?.find(({ number }) => number === prChoice) ?? {}
    if (title && url) {
      const response = await postToSlack({
        title,
        url,
      })
    }
  }
}
