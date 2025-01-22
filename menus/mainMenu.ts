import { select } from '@inquirer/prompts'
import { newPRMessage, theme } from '../constants'
import { cache } from '../cache'
import { styleText } from 'util'

export const mainMenu = async () => {
  const mainMenuTail = [
    { name: newPRMessage, value: 1000 },
    { name: 'Exit', value: 0 },
  ]

  const styleNumber = (number: number) => styleText('gray', `(#${number})`)
  const prOptions = cache.prs?.map(({ number, title }) => ({
    name: `${title} ${styleNumber(number)}`,
    value: number,
  }))

  const noPRs = prOptions?.length === 0
  const choices = (prOptions ?? []).concat(mainMenuTail)

  const prChoice: number = await select({
    message: noPRs ? 'No PRs found 🥲' : 'Select a PR for more actions:',
    choices,
    theme,
  })

  return prChoice
}
