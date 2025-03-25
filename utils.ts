import axios from 'axios'
import { urlConstants } from './constants'
import { mainMenu, prActions } from './menus'
import { exec } from 'child_process'
import { cache, PortalCache } from './cache'
import { writeFileSync } from 'fs'
import path from 'node:path'
import { homedir } from 'os'
import { input } from '@inquirer/prompts'
import { readFileSync } from 'fs'

const { domain } = urlConstants

// const createPullRequest = async (body: string, head: string, title: string) => {
//   const response = await octokit.rest.pulls.create({
//     owner,
//     repo,
//     base,
//     body,
//     head,
//     title,
//   })
//   const status = response?.status
//   if (status === 201) {
//     return response?.data
//   } else {
//     throw new Error(`Failed to create PR: ${status}`)
//   }
// }

// const formatSlackMessage = ({ title, url }: { title: string; url: string }) => {
//   return `*${user}* requests a review:\n${url}: ${title}`
// }

// // const getStatusOfCommit = async (ref: string) => {
// //   const response = await octokit.rest.repos.getCommit({
// //     owner,
// //     repo,
// //     ref,
// //   })
// //   const status = response?.status
// //   if (status === 200) {
// //     /**@todo find out how to check the status of the commit */
// //     const state = response?.data?.state
// //     return state
// //   } else {
// //     throw new Error(`Failed to fetch status for ${ref}`)
// //   }
// // }

// const getIndividualPR = async (prNumber: string) => {
//   const response = await octokit.rest.pulls.get({
//     owner,
//     repo,
//     pull_number: parseInt(prNumber),
//   })
//   if (response.status === 200) {
//     return response?.data
//   } else {
//     throw new Error(`Failed to fetch info for PR #${prNumber}`)
//   }
// }

// const getPRs = async () => {
//   try {
//     const response = await octokit.rest.pulls.list({
//       owner,
//       repo,
//     })
//     const status = response?.status

//     if (status === 200) {
//       const filteredPRs: Array<{
//         number: number
//         mergeable: string
//         ref: string
//         // status: string
//         title: string
//         url: string
//         username: string
//       }> = []
//       const prData = response?.data?.map((pr: any) => ({
//         head: pr.head,
//         mergeable: pr.mergeable,
//         number: pr.number,
//         title: pr.title,
//         url: pr.html_url,
//         username: pr.user.login,
//       }))
//       if (prData?.length) {
//         for await (const {
//           head: { ref, sha },
//           mergeable,
//           number,
//           title,
//           url,
//           username,
//         } of prData) {
//           if (username !== user) continue

//           // const status = await getStatusOfCommit(sha)

//           filteredPRs.push({
//             number,
//             mergeable,
//             ref,
//             // status,
//             title,
//             url,
//             username,
//           })
//         }
//       }
//       return filteredPRs
//     } else {
//       throw new Error('Failed to fetch PRs')
//     }
//   } catch (e) {
//     console.error(e)
//   }
// }

// const parseBranchName = (branchName: string) => {
//   const linearRegex = /[A-Za-z]+-[0-9]+/
//   const linearMatch = branchName.match(linearRegex)
//   if (linearMatch) {
//     return linearMatch[0].toUpperCase()
//   } else {
//     throw new Error('No matching pattern found in branch name')
//   }
// }

export const createPullRequest = async ({
  body,
  head,
  title,
}: {
  body?: string
  head: string
  title: string
}) => {
  try {
    const response = await axios.post(`${domain}/new`, {
      head,
      title,
      body,
    })
    const { status, data } = response
    if (status === 201) {
      const {
        head: { ref },
        number,
        title: prTitle,
        url,
        status: prStatus,
      } = data ?? {}
      cache.prs[number] = {
        ref,
        number,
        title: prTitle,
        url,
        status: prStatus,
      }
    }
    return { status, data }
  } catch (error) {
    console.error('Error creating PR:', error)
  }
}

export const deleteSlackPost = async (ts: string) => {
  const response = await axios.delete(`${domain}/review-message`, {
    data: {
      ts,
    },
  })
  const { status, data } = response ?? {}
  return { status, data }
}

export const setHeadBranchName = async (cache: PortalCache) => {
  if (!cache) {
    console.error('No cache found')
    return
  }

  const fetchHeadBranchName = (pathToHead: string) => {
    const head = readFileSync(pathToHead, 'utf-8')
    const headBranchName = head.split('ref: ')[1].split('/')[2].trim()
    return headBranchName
  }

  if (!cache.pathToHead) {
    const localRepo = await input({
      message: `Enter the path to your local travelpass.com repo starting after your home directory:`,
    })
    try {
      const pathToHead = path.join(homedir(), localRepo, '/.git/HEAD')
      const headBranchName = fetchHeadBranchName(pathToHead)
      cache.pathToHead = pathToHead
      cache.headBranchName = headBranchName
      return headBranchName
    } catch (err) {
      console.error('Error retrieving head branch name:', err)
    }
  } else {
    const headBranchName = fetchHeadBranchName(cache.pathToHead)
    cache.headBranchName = headBranchName
    return headBranchName
  }
}

export const fetchLinearReport = async (body: {
  branchName: string
  prNumber: string
}) => {
  const response = await axios.post(`${domain}/linear-report`, body)
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
    case 'linear': {
      const cachedPr = cache.prs[prChoice]
      if (!cachedPr) {
        console.error('No cached PR found for the selected choice.')
        return
      }
      const { number, ref } = cachedPr
      const linearReport = await fetchLinearReport({
        branchName: ref ?? '',
        prNumber: number.toString(),
      })
      console.log({ linearReport })
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
      const prUrl = cache.prs[prChoice]?.url

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
    writeFileSync(
      path.join(homedir(), '.portal-cache.json'),
      JSON.stringify(cache, null, 2),
      {
        flag: 'w',
      }
    )
  } catch (error) {
    console.error('ERROR WRITING CACHE\n', error)
  }
}
