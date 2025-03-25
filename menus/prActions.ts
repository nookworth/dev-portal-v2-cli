import { select } from '@inquirer/prompts'
import { fetchSinglePR } from '../utils'
import { theme } from '../constants'
import { cache } from '../cache'

export const prActions = async (prChoice: number) => {
  const cachedPr = cache.prs[prChoice]
  if (!cachedPr) {
    const fetchedPR = await fetchSinglePR(prChoice)
    if (fetchedPR) {
      const { head, mergeable, number, state, title, url } = fetchedPR
      const { ref } = head
      cache.prs[number] = {
        ref,
        mergeable,
        number,
        postedToSlack: false,
        status: state,
        title,
        url,
      }
    }
    // means the PR was fetched in the main menu, which uses GH's "List Pull Requests" API, which does not return mergeable status
  } else if (!cachedPr.mergeable) {
    const fetchedPR = await fetchSinglePR(prChoice)
    const { mergeable } = fetchedPR ?? {}
    cachedPr.mergeable = mergeable
    cachedPr.postedToSlack = false
  }

  const { mergeable, postedToSlack } = cachedPr ?? {}
  const slackOption = postedToSlack ? 'Delete Slack Post' : 'Post to Slack'

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
        disabled: !mergeable,
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
