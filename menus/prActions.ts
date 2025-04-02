import { select } from '@inquirer/prompts'
import { fetchIndividualPR } from '../utils/api'
import { theme } from '../constants'
import { cache } from '../cache'
import { ActionChoice } from '../types'

// strategy: fetch the individual PR once upon first selecting it from the menu, then rely on webhooks to update the cache
export const prActions = async (prChoice: number): Promise<ActionChoice> => {
  const cachedPr = cache.prs[prChoice]

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

  const { mergeable, mergeableState, postedToSlack, reviews, status } =
    cachedPr ?? {}
  const slackOption = postedToSlack ? 'Delete Slack Post' : 'Post to Slack'
  const isMergeable =
    status === 'success' &&
    mergeable &&
    mergeableState === 'clean' &&
    reviews?.some(review => review.state === 'APPROVED')

  const actionChoice = await select({
    message: 'Select an action:',
    choices: [
      {
        name: 'Open GitHub',
        value: 'url',
      },
      {
        name: 'Generate Linear Report',
        value: 'linear',
      },
      {
        name: slackOption,
        value: 'slack',
      },
      {
        name: 'Merge',
        value: 'merge',
        disabled: !isMergeable,
      },
      {
        name: '⬅️  Go Back',
        value: 'back',
      },
    ],
    theme,
  })

  return actionChoice as ActionChoice
}
