import { select } from '@inquirer/prompts'
import { theme } from '../constants'
import { cache } from '../cache'
import { styleText } from 'util'
import { setHeadBranchName } from '../utils/file'
import { getContext } from '../utils/menu'

export const mainMenu = async () => {
  const context = getContext()
  const { prs: cachedPRs } = cache
  const cachedPrsArray = Object.entries(cachedPRs)
  const headBranchName = await setHeadBranchName(cache)
  const headBranchHasExistingPR = cachedPrsArray.some(
    ([_, value]) => value && value?.head?.ref?.trim() === headBranchName?.trim()
  )
  const newPRMessage = `New pull request from ${cache.headBranchName}`
  const mainMenuTail =
    headBranchHasExistingPR ||
    headBranchName === 'master' ||
    headBranchName === 'main'
      ? [{ name: 'Exit', value: 0 }]
      : [
          { name: newPRMessage, value: 1000 },
          { name: 'Exit', value: 0 },
        ]
  const prOptions: { name: string; value: number }[] = []

  const stylePRNumber = (number: number) => styleText('gray', `(#${number})`)

  for (const pr in cachedPRs) {
    const { title, number } = cachedPRs[pr] ?? {}
    if (title && number) {
      prOptions.push({
        name: `${title} ${stylePRNumber(number)}`,
        value: number,
      })
    }
  }

  const noPRs = prOptions?.length === 0
  const choices = (prOptions ?? []).concat(mainMenuTail)
  let prChoice: number = 0

  try {
    const choice = await select(
      {
        message: noPRs ? 'Select an action:' : 'Select a PR for more actions:',
        choices,
        theme,
      },
      context
    )
    prChoice = choice
  } catch (error) {
    if (error.message.includes('Prompt was aborted')) {
      process.exit(0)
    }
    console.error(error)
  }

  return prChoice
}
