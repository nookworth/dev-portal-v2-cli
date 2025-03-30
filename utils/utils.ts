// import {
//   baseRepo as base,
//   channelId as channel,
//   goodbyeMessages,
//   owner,
//   repo,
//   user,
// } from '../constants'
// import { createPr, mainMenu, prActions } from '../menus'
// import { exec } from 'child_process'
// import { cache, PortalCache } from '../cache'
// import { writeFileSync } from 'fs'
// import path from 'node:path'
// import { homedir } from 'os'
// import { input } from '@inquirer/prompts'
// import { readFileSync } from 'fs'
// import { octokit, slackClient } from '../init'
// import { getLinearReport } from '../linear-agent/agent'

// export const createPullRequest = async ({
//   body,
//   head,
//   title,
// }: {
//   body?: string
//   head: string
//   title: string
// }) => {
//   try {
//     const response = await octokit.rest.pulls.create({
//       owner,
//       repo,
//       base,
//       body,
//       head,
//       title,
//     })

//     const { status, data } = response
//     if (status === 201) {
//       const {
//         head: { ref },
//         number,
//         title: prTitle,
//         html_url: url,
//         state: prStatus,
//       } = data
//       cache.prs[number] = {
//         ref,
//         number,
//         title: prTitle,
//         url,
//         status: prStatus,
//       }
//     }
//     return { status, data }
//   } catch (error) {
//     console.error('Error creating PR:', error)
//   }
// }

// export const fetchLinearReport = async ({
//   branchName,
//   prNumber,
// }: {
//   branchName: string
//   prNumber: string
// }): Promise<void> => {
//   try {
//     const linearSearchTerm = parseBranchName(branchName)
//     const report = await getLinearReport(prNumber, linearSearchTerm)

//     try {
//       await octokit.rest.issues.createComment({
//         owner,
//         repo,
//         issue_number: parseInt(prNumber),
//         body: `### Linear Ticket Report\n\n${report}`,
//       })
//     } catch (error) {
//       console.error(
//         `Failed to add Linear report comment to PR #${prNumber}:`,
//         error
//       )
//     }
//   } catch (error) {
//     console.error('Error generating Linear report:', error)
//   }
// }

// export const fetchSinglePR = async (prNumber: number) => {
//   try {
//     const response = await octokit.rest.pulls.get({
//       owner,
//       repo,
//       pull_number: prNumber,
//     })
//     return response.data
//   } catch (error) {
//     if (error.response) {
//       console.error(`HTTP Error: ${error.response.status}`)
//       console.error('Response Data:', error.response.data)
//     } else if (error.request) {
//       console.error('No response received:', error.request)
//     } else {
//       console.error('Error:', error.message)
//     }
//   }
// }

// export const postToSlack = async (body: { title: string; url: string }) => {
//   try {
//     const text = formatSlackMessage(body)
//     const response = await slackClient.chat.postMessage({
//       text,
//       channel,
//     })

//     if (response.ok) {
//       const { ts } = response.message ?? {}
//       return ts
//     }

//     return false
//   } catch (error) {
//     console.error('Error posting to Slack:', error)
//     if (error.response) {
//       console.error(`HTTP Error: ${error.response.status}`)
//       console.error('Response Data:', error.response.data)
//     } else if (error.request) {
//       console.error('No response received:', error.request)
//     } else {
//       console.error('Error:', error.message)
//     }
//     return false
//   }
// }

// const formatSlackMessage = ({ title, url }: { title: string; url: string }) => {
//   return `*${user}* requests a review:\n${url}: ${title}`
// }

// export const getPRs = async () => {
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
//           head: { ref },
//           mergeable,
//           number,
//           title,
//           url,
//           username,
//         } of prData) {
//           if (username !== user) continue

//           filteredPRs.push({
//             number,
//             mergeable,
//             ref,
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

// export const deleteSlackPost = async (ts: string) => {
//   try {
//     const response = await slackClient.chat.delete({
//       channel,
//       ts,
//     })

//     if (response.ok) return true

//     return false
//   } catch (error) {
//     console.error('Error deleting Slack message:', error)
//     return false
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

// export const setHeadBranchName = async (cache: PortalCache) => {
//   if (!cache) {
//     console.error('No cache found')
//     return
//   }

//   const fetchHeadBranchName = (pathToHead: string) => {
//     const head = readFileSync(pathToHead, 'utf-8')
//     const headBranchName = head.split('ref: ')[1].split('/')[2].trim()
//     return headBranchName
//   }

//   if (!cache.pathToHead) {
//     const localRepo = await input({
//       message: `Enter the path to your local travelpass.com repo starting after your home directory:`,
//     })
//     try {
//       const pathToHead = path.join(homedir(), localRepo, '/.git/HEAD')
//       const headBranchName = fetchHeadBranchName(pathToHead)
//       cache.pathToHead = pathToHead
//       cache.headBranchName = headBranchName
//       return headBranchName
//     } catch (err) {
//       console.error('Error retrieving head branch name:', err)
//     }
//   } else {
//     const headBranchName = fetchHeadBranchName(cache.pathToHead)
//     cache.headBranchName = headBranchName
//     return headBranchName
//   }
// }

// const checkPRReviewStatus = async (prNumber: number): Promise<boolean> => {
//   try {
//     const response = await octokit.rest.pulls.listReviews({
//       owner,
//       repo,
//       pull_number: prNumber,
//     })

//     return response.data.some(review => review.state === 'APPROVED')
//   } catch (error) {
//     console.error('Error checking PR review status:', error)
//     return false
//   }
// }

// const checkCommitStatus = async (prNumber: number): Promise<boolean> => {
//   try {
//     const pr = await octokit.rest.pulls.get({
//       owner,
//       repo,
//       pull_number: prNumber,
//     })

//     const mergeable = pr.data.mergeable
//     const sha = pr.data.head.sha

//     if (!mergeable) {
//       return false
//     }

//     const response = await octokit.rest.repos.getCombinedStatusForRef({
//       owner,
//       repo,
//       ref: sha,
//     })

//     /**@todo look into why the state is unexpectedly pending */
//     const state = response.data.state

//     console.log({ mergeable, sha, state })

//     return state === 'success'
//   } catch (error) {
//     console.error('Error checking PR status:', error)
//     return false
//   }
// }

// export const mergePullRequest = async (prNumber: number) => {
//   try {
//     const hasApproval = await checkPRReviewStatus(prNumber)
//     if (!hasApproval) {
//       console.error('Cannot merge: PR does not have an approving review')
//       return false
//     }

//     const checksPassed = await checkCommitStatus(prNumber)
//     if (!checksPassed) {
//       console.error(
//         'Cannot merge: Not all checks have passed or there are merge conflicts'
//       )
//       return false
//     }

//     const response = await octokit.rest.pulls.merge({
//       owner,
//       repo,
//       pull_number: prNumber,
//       merge_method: 'squash',
//     })

//     if (response.status === 200) {
//       console.log('PR merged successfully')
//       return true
//     }
//     return false
//   } catch (error) {
//     console.error('Error merging PR:', error)
//     if (error.response) {
//       console.error(`HTTP Error: ${error.response.status}`)
//       console.error('Response Data:', error.response.data)
//     }
//     return false
//   }
// }

// export const resolveActionChoice = async (
//   actionChoice: string,
//   prChoice: number
// ) => {
//   switch (actionChoice) {
//     case 'back': {
//       const prChoice = await mainMenu()

//       if (prChoice === 0) {
//         console.log('Goodbye 👋')
//         process.exit(0)
//       }

//       const newAction = await prActions(prChoice)
//       await resolveActionChoice(newAction, prChoice)
//     }
//     case 'linear': {
//       const cachedPr = cache.prs[prChoice]
//       if (!cachedPr) {
//         console.error('No cached PR found for the selected choice.')
//         return
//       }
//       const { number, ref } = cachedPr

//       await fetchLinearReport({
//         branchName: ref ?? '',
//         prNumber: number.toString(),
//       })

//       const newAction = await prActions(prChoice)
//       await resolveActionChoice(newAction, prChoice)
//     }
//     case 'slack': {
//       const cachedPr = cache.prs[prChoice]
//       if (!cachedPr) {
//         console.error('No cached PR found for the selected choice.')
//         return
//       }
//       const { postedToSlack, reviewTs, url, title } = cachedPr

//       if (title && url && !postedToSlack) {
//         const ts = await postToSlack({
//           title,
//           url,
//         })
//         if (ts) {
//           cachedPr.postedToSlack = true
//           cachedPr.reviewTs = ts
//         } else {
//           console.error('Error posting to Slack')
//         }
//       } else if (postedToSlack) {
//         const deleted = await deleteSlackPost(reviewTs ?? '')
//         if (deleted) {
//           cachedPr.postedToSlack = false
//           cachedPr.reviewTs = undefined
//         }
//       }

//       const newAction = await prActions(prChoice)
//       await resolveActionChoice(newAction, prChoice)
//     }
//     case 'url': {
//       const prUrl = cache.prs[prChoice]?.url

//       if (prUrl) {
//         const command =
//           process.platform === 'win32'
//             ? `start "" "${prUrl}"`
//             : process.platform === 'darwin'
//             ? `open "${prUrl}"`
//             : `xdg-open "${prUrl}"`

//         exec(command, error => {
//           if (error) {
//             console.error('Failed to open URL:', error.message)
//           }
//         })
//       } else {
//         console.error('No matching PR URL found for the selected choice.')
//       }

//       const newAction = await prActions(prChoice)
//       await resolveActionChoice(newAction, prChoice)
//     }
//     case 'merge': {
//       const cachedPr = cache.prs[prChoice]
//       if (!cachedPr) {
//         console.error('No cached PR found for the selected choice.')
//         return
//       }

//       const merged = await mergePullRequest(cachedPr.number)
//       if (merged) {
//         delete cache.prs[prChoice]
//       }

//       const newAction = await prActions(prChoice)
//       await resolveActionChoice(newAction, prChoice)
//     }
//   }
// }

// export const saveCache = () => {
//   try {
//     writeFileSync(
//       path.join(homedir(), '.portal-cache.json'),
//       JSON.stringify(cache, null, 2),
//       {
//         flag: 'w',
//       }
//     )
//   } catch (error) {
//     console.error('ERROR WRITING CACHE\n', error)
//   }
// }

// export const handleMenuFlow = async () => {
//   const prChoice = await mainMenu()

//   if (prChoice === 0) {
//     console.log(
//       goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)]
//     )
//     process.exit(0)
//   } else if (prChoice === 1000) {
//     await createPr()
//   } else {
//     const actionChoice = await prActions(prChoice)
//     await resolveActionChoice(actionChoice, prChoice)
//   }
// }
