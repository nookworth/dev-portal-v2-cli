import { select } from '@inquirer/prompts'
import { fetchPRs } from './utils'
import { URL_CONSTANTS } from './constants'

const choice = await select({
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

if (!choice) process.exit(0)

/** @todo pass some arg into the app when starting it to know which URL to use */
const prs = await fetchPRs(URL_CONSTANTS.testBase)
console.log('PRS::::::::::', prs)
// const titles = prs.map(pr => pr.title)

// const prChoice = await select({
//   message: 'Select a PR to view:',
//   choices: titles,
// })

// if (prChoice) process.exit(0)
