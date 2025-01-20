import axios from 'axios'
import { urlConstants } from './constants'
import { mainMenu, prActions } from './menus'
import { exec } from 'child_process'
import { cache } from './cache'
import { writeFileSync } from 'fs'

const { domain } = urlConstants

export const deleteSlackPost = async (ts: string) => {
  const response = await axios.delete(`${domain}/review-message`, {
    data: {
      ts,
    },
  })
  const { status, data } = response ?? {}
  return { status, data }
}

export const fetchPRs = async () => {
  try {
    const response = await axios.get(domain)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error(`HTTP Error: ${error.response.status}`)
      console.error('Response Data:', error.response.data)
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Error:', error.message)
    }
  }
}

export const fetchSinglePR = async (prNumber: number) => {
  try {
    const response = await axios.get(`${domain}/${prNumber}`)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error(`HTTP Error: ${error.response.status}`)
      console.error('Response Data:', error.response.data)
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Error:', error.message)
    }
  }
}

export const postToSlack = async (body: { title: string; url: string }) => {
  try {
    const response = await axios.post(`${domain}/review-message`, body)
    const { status, data } = response
    return { status, data }
  } catch (error) {
    if (error.response) {
      console.error(`HTTP Error: ${error.response.status}`)
      console.error('Response Data:', error.response.data)
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Error:', error.message)
    }
  }
}

export const resolveActionChoice = async (
  actionChoice: string,
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
    case 'slack': {
      const cachedPr = cache.prs?.find(({ number }) => number === prChoice)
      if (!cachedPr) {
        console.error('No cached PR found for the selected choice.')
        return
      }
      const { postedToSlack, reviewTs, url, title } = cachedPr

      if (title && url && !postedToSlack) {
        const response = await postToSlack({
          title,
          url,
        })
        const {
          status,
          data: { ts },
        } = response ?? {}
        if (status === 200) {
          cachedPr.postedToSlack = true
          cachedPr.reviewTs = ts
        } else {
          console.error('Error posting to Slack')
        }
      } else if (postedToSlack) {
        const { status } = await deleteSlackPost(reviewTs ?? '')
        if (status === 200) {
          cachedPr.postedToSlack = false
          cachedPr.reviewTs = undefined
        } else {
          console.error('Error deleting Slack post')
        }
      }

      const newAction = await prActions(prChoice)
      await resolveActionChoice(newAction, prChoice)
    }
    case 'url': {
      const prUrl = cache.prs?.find(({ number }) => number === prChoice)?.url

      if (prUrl) {
        // Determine the platform and execute the appropriate command
        const command =
          process.platform === 'win32'
            ? `start "" "${prUrl}"` // Windows
            : process.platform === 'darwin'
            ? `open "${prUrl}"` // macOS
            : `xdg-open "${prUrl}"` // Linux

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
  }
}

export const saveCache = () => {
  try {
    writeFileSync('cache.json', JSON.stringify(cache, null, 2), { flag: 'w' })
  } catch (error) {
    console.error('ERROR WRITING CACHE\n', error)
  }
}
