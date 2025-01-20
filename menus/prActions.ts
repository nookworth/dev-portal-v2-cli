import { select } from '@inquirer/prompts'
import { fetchSinglePR } from '../utils'
import { theme } from '../constants'
import { cache } from '../cache'

export const prActions = async (prChoice: number) => {
  const cachedPr = cache.prs?.find(pr => pr.number === prChoice)
  if (!cachedPr) {
    const fetchedPR = await fetchSinglePR(prChoice)
    const { mergeable, number, status, title, url } = fetchedPR
    cache.prs = cache.prs.concat({
      mergeable,
      number,
      postedToSlack: false,
      status,
      title,
      url,
    })
    // means the PR was fetched in the main menu, which uses GH's "List Pull Requests" API, which does not return mergeable status
  } else if (cachedPr.mergeable === null || cachedPr.mergeable === undefined) {
    const fetchedPR = await fetchSinglePR(prChoice)
    const { mergeable } = fetchedPR
    cachedPr.mergeable = mergeable
    cachedPr.postedToSlack = false
  }

  const selectedPR = cache.prs?.find(pr => pr.number === prChoice)
  const { mergeable, postedToSlack } = selectedPR ?? {}
  const slackOption = postedToSlack ? 'Delete Slack Post' : 'Post to Slack'

  const actionChoice = await select({
    message: 'Select an action:',
    choices: [
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
