import { select } from '@inquirer/prompts'
import { fetchPRs, fetchSinglePR, postToSlack } from './utils'
import { exec } from 'child_process'
import { theme } from './constants'
import './webSocket'

const proceed = await select({
  message: 'Would you like to fetch PRs?',
  choices: [
    {
      name: 'Yes',
      value: true,
    },
    {
      name: 'No',
      value: false,
    },
  ],
})

if (!proceed) {
  console.log('Goodbye 👋')
  process.exit(0)
}

/** @todo pass some arg into the app when starting it to know which URL to use */
const prs = await fetchPRs()
const displayInfo = prs.map(({ number, status, title, url }) => ({
  number,
  status,
  title,
  url,
}))

const prChoice = await select({
  message: 'Select a PR for more actions:',
  choices: displayInfo.map(({ number, status, title }) => ({
    name: `${title} (#${number})`,
    value: number,
  })),
  theme,
})

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
    const prUrl = displayInfo.find(({ number }) => number === prChoice)?.url

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
    const { url, title } = displayInfo.find(({ number }) => number === prChoice)
    const response = await postToSlack({
      title,
      url,
    })
  }
}
