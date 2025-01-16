import { select } from '@inquirer/prompts'
import { fetchSinglePR } from '../utils'
import { cache, theme } from '../constants'

export const prActions = async (prChoice: number) => {
  if (!cache.prDetails?.[prChoice]) {
    const selectedPR = await fetchSinglePR(prChoice)
    cache.prDetails = {
      ...cache.prDetails,
      [prChoice]: selectedPR,
    }
  }

  const selectedPR = cache.prDetails[prChoice]
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
      {
        name: '⬅️  Go Back',
        value: 'back',
      },
    ],
    theme,
  })

  return actionChoice
}
