import { select } from '@inquirer/prompts'
import { theme } from '../constants'
import { cache } from '../cache'
import { styleText } from 'util'
import { setHeadBranchName } from '../utils'

const mainMenu = async () => {
  await setHeadBranchName(cache)
  const newPRMessage = `New pull request from ${cache.headBranchName}`
  const { prs: cachedPRs } = cache

  const mainMenuTail = [
    { name: newPRMessage, value: 1000 },
    { name: 'Exit', value: 0 },
  ]

  const styleNumber = (number: number) => styleText('gray', `(#${number})`)
  let prOptions: { name: string; value: number }[] = []
  for (const pr in cachedPRs) {
    const { title, number } = cachedPRs[pr]
    prOptions.push({
      name: `${title} ${styleNumber(number)}`,
      value: number,
    })
  }

  const noPRs = prOptions?.length === 0
  const choices = (prOptions ?? []).concat(mainMenuTail)

  const prChoice: number = await select({
    message: noPRs ? 'No PRs found 🥲' : 'Select a PR for more actions:',
    choices,
    theme,
  })

  return prChoice
}

export { mainMenu }
