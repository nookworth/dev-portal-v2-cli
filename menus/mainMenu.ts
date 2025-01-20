import { select } from '@inquirer/prompts'
import { fetchPRs } from '../utils'
import { cache, PR, theme } from '../constants'

export const mainMenu = async () => {
  if (!cache.prs.length) {
    const prs = await fetchPRs()
    const prData = prs.map(({ number, status, title, url }: PR) => ({
      number,
      status,
      title,
      url,
    }))
    cache.prs = prData
  }

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
