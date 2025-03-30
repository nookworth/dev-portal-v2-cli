import { prActions, mainMenu, createPr } from '../menus'
import { cache } from '../cache'
import { deleteSlackPost, fetchLinearReport, postToSlack } from './api'
import { exec } from 'child_process'
import { mergePullRequest } from './api'
import { goodbyeMessages } from '../constants'
import { ActionChoice } from '../types'

export const handleMenuFlow = async () => {
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
      const prChoice = await mainMenu()

      if (prChoice === 0) {
        console.log('Goodbye 👋')
        process.exit(0)
      }

      const newAction = await prActions(prChoice)
      await resolveActionChoice(newAction, prChoice)
    }

    case 'linear': {
      const cachedPr = cache.prs[prChoice]
      if (!cachedPr) {
        console.error('No cached PR found for the selected choice.')
        return
      }
      const { number, ref } = cachedPr

      await fetchLinearReport({
        branchName: ref ?? '',
        prNumber: number.toString(),
      })

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
