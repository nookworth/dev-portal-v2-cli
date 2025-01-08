import { select } from '@inquirer/prompts'
import { fetchPRs } from './utils'
import { URL_CONSTANTS } from './constants'
import { exec } from 'child_process'
import { styleText } from 'util'

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
const prs = await fetchPRs(URL_CONSTANTS.testBase)
const displayInfo = prs.map(({ number, title, url }) => ({
  number,
  title,
  url,
}))

const prChoice = await select({
  message: 'Select a PR for more actions:',
  choices: displayInfo.map(({ number, title }) => ({
    name: `${title} (#${number})`,
    value: number,
  })),
  theme: {
    icon: {
      cursor: '👉',
    },
    style: {
      highlight: (text: string) => {
        const numberSubstring = text.match(/\s\(#\d+\)/)?.[0] ?? ''
        const rest = text.slice(0, text.length - numberSubstring.length)
        return styleText('green', rest) + styleText('gray', numberSubstring)
      },
    },
  },
})

const checkSuites = prs.find(({ number }) => number === prChoice)?.checkSuites
const displayCheckSuites = checkSuites.map(
  ({ app, status, conclusion }) => `[${app}] ${status} - ${conclusion}`
)
console.log(' --- Check Suites ---')
console.group()
console.group()
console.table(displayCheckSuites.join('\n'))
console.groupEnd()

const actionChoice = await select({
  message: 'Select an action:',
  choices: [
    {
      name: 'Visit PR URL',
      value: 'url',
    },
    {
      name: 'Post to Slack',
      value: 'slack',
    },
    {
      name: 'Merge PR',
      value: 'merge',
    },
  ],
})

if (actionChoice === 'url') {
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
