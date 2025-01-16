import axios from 'axios'
import { cache, urlConstants } from './constants'
import { mainMenu, prActions } from './menus'
import { exec } from 'child_process'

const { domain } = urlConstants

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
      const { url, title } =
        cache.prs?.find(({ number }) => number === prChoice) ?? {}
      if (title && url) {
        await postToSlack({
          title,
          url,
        })
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
          } else {
            console.log(`Opened URL: ${prUrl}`)
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
