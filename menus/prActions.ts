import { select } from '@inquirer/prompts'
import { fetchIndividualPR } from '../utils/api'
import { theme } from '../constants'
import { cache } from '../cache'
import { ActionChoice } from '../types'

// strategy: fetch the individual PR once upon first selecting it from the menu, then rely on webhooks to update the cache
export const prActions = async (prChoice: number): Promise<ActionChoice> => {
  console.log({ cache: JSON.stringify(cache, null, 2) })
  const cachedPr = cache.prs[prChoice]

  if (
    !cachedPr ||
    cachedPr.mergeable === null ||
    cachedPr.mergeable === undefined
  ) {
    const fetchedPR = await fetchIndividualPR(prChoice)

    if (fetchedPR) {
      const { head, mergeable, number, reviews, state, status, title, url } =
        fetchedPR
      const { ref, sha } = head

      cache.prs[number] = {
        head: { ref, sha },
        reviews,
        mergeable,
        number,
        postedToSlack: false,
        state,
        status,
        title,
        url,
      }
    }
  }

  const { mergeable, postedToSlack, reviews, status } = cachedPr ?? {}
  const slackOption = postedToSlack ? 'Delete Slack Post' : 'Post to Slack'
  const isMergeable =
    status === 'success' &&
    mergeable &&
    reviews?.some(review => review.state === 'approved')

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
