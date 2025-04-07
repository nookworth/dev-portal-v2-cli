import { select } from '@inquirer/prompts'
import { fetchIndividualPR } from '../utils/api'
import { theme } from '../constants'
import { cache } from '../cache'
import { ActionChoice } from '../types'
import { getContext } from '../utils/menu'

// strategy: fetch the individual PR once upon first selecting it from the menu, then rely on webhooks to update the cache
export const prActions = async (prChoice: number) => {
  const cachedPr = cache.prs[prChoice]
  const context = getContext()

  if (
    !cachedPr ||
    cachedPr.mergeable === null ||
    cachedPr.mergeable === undefined
  ) {
    const fetchedPR = await fetchIndividualPR(prChoice)

    if (fetchedPR) {
      const {
        head,
        html_url: url,
        mergeable,
        mergeable_state: mergeableState,
        number,
        reviews,
        state,
        status,
        title,
      } = fetchedPR
      const { ref, sha } = head

      cache.prs[number] = {
        head: { ref, sha },
        reviews,
        mergeable,
        mergeableState,
        number,
        postedToSlack: false,
        state,
        status,
        title,
        url,
      }
    }
  }

  let actionChoice: ActionChoice = 'back'
  const { mergeable, mergeableState, postedToSlack, reviews, status } =
    cachedPr ?? {}
  const slackOption = postedToSlack
    ? 'Delete Slack Post 🔗'
    : 'Post to Slack 🔗'
  const isMergeable =
    status === 'success' &&
    mergeable &&
    mergeableState === 'clean' &&
    reviews?.some(review => review.state === 'APPROVED')

  const reasons = () => {
    const reasons: string[] = []

    if (status !== 'success') {
      reasons.push('    • not all checks successful')
    }
    if (!mergeable) {
      reasons.push('    • has conflicts')
    }
    if (mergeableState !== 'clean') {
      reasons.push('    • behind master')
    }
    if (!reviews?.some(review => review.state === 'APPROVED')) {
      reasons.push('    • needs approval')
    }
    return 'Not mergeable: \n' + reasons.join('\n')
  }

  const mergeDisplayOption = isMergeable ? 'Merge ☑️' : reasons()

  try {
    const action: ActionChoice = await select(
      {
        message: 'Select an action:',
        choices: [
          {
            name: 'Open GitHub 🛠️',
            value: 'url',
          },
          {
            name: 'Generate Linear Report 📃',
            value: 'linear',
          },
          {
            name: slackOption,
            value: 'slack',
          },
          {
            name: mergeDisplayOption,
            value: 'merge',
            disabled: !isMergeable,
          },
          {
            name: 'Refresh 🔄',
            value: 'refresh',
          },
          {
            name: 'Go Back ⬅️',
            value: 'back',
          },
        ],
        theme,
      },
      context
    )
    actionChoice = action
  } catch (error) {
    if (error.message.includes('Prompt was aborted')) {
      return actionChoice
    }
    console.error(error)
  }

  return actionChoice
}
