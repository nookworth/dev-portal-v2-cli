import { select } from '@inquirer/prompts'
import { theme } from '../constants'
import { cache } from '../cache'
import { styleText } from 'util'
import { setHeadBranchName } from '../utils'

const mainMenu = async () => {
  const { prs: cachedPRs } = cache
  const cachedPrsArray = Object.entries(cachedPRs)
  const headBranchName = await setHeadBranchName(cache)
  const headBranchHasExistingPR = cachedPrsArray.some(
    ([_, value]) => value && value.ref?.trim() === headBranchName?.trim()
  )
  const newPRMessage = `New pull request from ${cache.headBranchName}`
  const mainMenuTail =
    headBranchHasExistingPR || headBranchName === 'master'
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

  const prChoice: number = await select({
    message: noPRs ? 'Select an action:' : 'Select a PR for more actions:',
    choices,
    theme,
  })

  return prChoice
}

export { mainMenu }
