import { select } from '@inquirer/prompts'
import { theme } from '../constants'
import { cache } from '../cache'

export const mainMenu = async () => {
  const prOptions = cache.prs?.map(({ number, title }) => ({
    name: `${title} (#${number})`,
    value: number,
  }))
  const noPRs = prOptions?.length === 0
  const choices = (prOptions ?? []).concat([{ name: 'Exit', value: 0 }])

  const prChoice: number = await select({
    message: noPRs ? 'No PRs found' : 'Select a PR for more actions:',
    choices,
    theme,
  })

  return prChoice
}
