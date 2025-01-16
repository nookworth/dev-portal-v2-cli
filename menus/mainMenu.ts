import { select } from '@inquirer/prompts'
import { fetchPRs } from '../utils'
import { cache, theme } from '../constants'

export const mainMenu = async () => {
  const prs = await fetchPRs()
  const prData = prs.map(({ number, status, title, url }) => ({
    number,
    status,
    title,
    url,
  }))

  // initialize cache with fetched data, will be updated later with webhook data
  if (!cache.prs) {
    cache.prs = prData
  }

  const prChoice = await select({
    message: 'Select a PR for more actions:',
    choices: prData.map(({ number, title }) => ({
      name: `${title} (#${number})`,
      value: number,
    })),
    theme,
  })

  return prChoice
}
