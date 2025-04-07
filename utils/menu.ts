import { prActions, mainMenu, createPr } from '../menus'
import { cache } from '../cache'
import {
  deleteSlackPost,
  fetchLinearReport,
  postToSlack,
  fetchIndividualPR,
} from './api'
import { exec } from 'child_process'
import { mergePullRequest } from './api'
import { goodbyeMessages } from '../constants'
import { ActionChoice } from '../types'

export const getContext = (clearPromptOnDone: boolean = true) => {
  const abortController = new AbortController()

  process.stdin.on('keypress', async (_, key) => {
    if (key.name === 'escape') {
      process.stdin.removeAllListeners('keypress')
      abortController.abort()
    }
  })

  return {
    clearPromptOnDone,
    signal: abortController.signal,
  }
}

export const loopToMain = async () => {
  const prChoice = await mainMenu()

  if (prChoice === 0) {
    console.log(
      goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)]
    )
    process.exit(0)
  } else if (prChoice === 1000) {
    await createPr()
  } else {
    const actionChoice = await prActions(prChoice)
    await resolveActionChoice(actionChoice, prChoice)
  }
}

export const resolveActionChoice = async (
  actionChoice: ActionChoice,
  prChoice: number
) => {
  switch (actionChoice) {
    case 'back': {
      await loopToMain()
    }

    case 'linear': {
      const cachedPr = cache.prs[prChoice]
      if (!cachedPr) {
        console.error('No cached PR found for the selected choice.')
        return
      }
      const { head, number } = cachedPr

      await fetchLinearReport({
        branchName: head.ref ?? '',
        prNumber: number.toString(),
      })

      const newAction = await prActions(prChoice)
      await resolveActionChoice(newAction, prChoice)
    }

    case 'refresh': {
      const cachedPr = cache.prs[prChoice]
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
          postedToSlack: cachedPr?.postedToSlack,
          reviewTs: cachedPr?.reviewTs,
          state,
          status,
          title,
          url,
        }
      }

      const newAction = await prActions(prChoice)
      await resolveActionChoice(newAction, prChoice)
    }

    case 'slack': {
      const cachedPr = cache.prs[prChoice]
      if (!cachedPr) {
        console.error('No cached PR found for the selected choice.')
        return
      }
      const { postedToSlack, reviewTs, url, title } = cachedPr

      if (title && url && !postedToSlack) {
        const ts = await postToSlack({
          title,
          url,
        })
        if (ts) {
          cachedPr.postedToSlack = true
          cachedPr.reviewTs = ts
        } else {
          console.error('Error posting to Slack')
        }
      } else if (postedToSlack) {
        const deleted = await deleteSlackPost(reviewTs ?? '')
        if (deleted) {
          cachedPr.postedToSlack = false
          cachedPr.reviewTs = undefined
        }
      }

      const newAction = await prActions(prChoice)
      await resolveActionChoice(newAction, prChoice)
    }

    case 'url': {
      const prUrl = cache.prs[prChoice]?.url

      if (prUrl) {
        const command =
          process.platform === 'win32'
            ? `start "" "${prUrl}"`
            : process.platform === 'darwin'
            ? `open "${prUrl}"`
            : `xdg-open "${prUrl}"`

        exec(command, error => {
          if (error) {
            console.error('Failed to open URL:', error.message)
          }
        })
      } else {
        console.error('No matching PR URL found for the selected choice.')
      }

      const newAction = await prActions(prChoice)
      await resolveActionChoice(newAction, prChoice)
    }

    case 'merge': {
      const cachedPr = cache.prs[prChoice]
      if (!cachedPr) {
        console.error('No cached PR found for the selected choice.')
        return
      }

      const merged = await mergePullRequest(cachedPr.number)
      if (merged) {
        delete cache.prs[prChoice]
      }

      const newAction = await prActions(prChoice)
      await resolveActionChoice(newAction, prChoice)
    }
  }
}
