import { octokit, slackClient } from '../init'
import {
  baseRepo as base,
  channelId as channel,
  owner,
  repo,
  user,
} from '../constants'
import { cache } from '../cache'
import { formatSlackMessage, parseBranchName } from './string'
import { getLinearReport } from '../linear-agent/agent'

/**
 * GITHUB
 */
const createPullRequest = async ({
  body,
  head,
  title,
}: {
  body?: string
  head: string
  title: string
}) => {
  try {
    const response = await octokit.rest.pulls.create({
      owner,
      repo,
      base,
      body,
      head,
      title,
    })

    const { status, data } = response
    if (status === 201) {
      const {
        head: { ref, sha },
        number,
        title: prTitle,
        html_url: url,
        state,
      } = data
      cache.prs[number] = {
        head: { ref, sha },
        mergeable: null,
        mergeableState: null,
        number,
        state,
        status: 'pending',
        title: prTitle,
        url,
      }
    }
    return { status, data }
  } catch (error) {
    console.error('Error creating PR:', error)
  }
}

const fetchIndividualPR = async (prNumber: number) => {
  try {
    const pullRequest = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    })

    if (!pullRequest.data) {
      throw new Error(`Failed to fetch PR #${prNumber}`)
    }

    const reviews = await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number: prNumber,
    })
    const reviewData = reviews?.data?.map(({ body, state, user }) => ({
      body: body,
      state: state,
      user: user?.login ?? '',
    }))

    const status = await octokit.rest.repos.getCombinedStatusForRef({
      owner,
      repo,
      ref: pullRequest.data.head.sha,
    })

    return {
      ...pullRequest.data,
      reviews: reviewData,
      status: status?.data?.state,
    }
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

const getPRs = async () => {
  try {
    const response = await octokit.rest.pulls.list({
      owner,
      repo,
    })
    const status = response?.status

    if (status === 200) {
      const filteredPRs: Array<{
        number: number
        mergeable: string
        ref: string
        title: string
        url: string
        username: string
      }> = []
      const prData = response?.data?.map((pr: any) => ({
        head: pr.head,
        mergeable: pr.mergeable,
        number: pr.number,
        title: pr.title,
        url: pr.html_url,
        username: pr.user.login,
      }))
      if (prData?.length) {
        for await (const {
          head: { ref },
          mergeable,
          number,
          title,
          url,
          username,
        } of prData) {
          if (username !== user) continue

          filteredPRs.push({
            number,
            mergeable,
            ref,
            title,
            url,
            username,
          })
        }
      }
      return filteredPRs
    } else {
      throw new Error('Failed to fetch PRs')
    }
  } catch (e) {
    console.error(e)
  }
}

const mergePullRequest = async (prNumber: number) => {
  try {
    const response = await octokit.rest.pulls.merge({
      owner,
      repo,
      pull_number: prNumber,
      merge_method: 'squash',
    })

    if (response.status === 200) {
      console.log('PR merged 🎉')
      return true
    }

    return false
  } catch (error) {
    console.error('Error merging PR:', error)
    if (error.response) {
      console.error(`HTTP Error: ${error.response.status}`)
      console.error('Response Data:', error.response.data)
    }
    return false
  }
}

/**
 * LINEAR
 */
export const fetchLinearReport = async ({
  branchName,
  prNumber,
}: {
  branchName: string
  prNumber: string
}): Promise<void> => {
  try {
    const linearSearchTerm = parseBranchName(branchName)
    const report = await getLinearReport(prNumber, linearSearchTerm)

    try {
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: parseInt(prNumber),
        body: `### Linear Ticket Report\n\n${report}`,
      })
    } catch (error) {
      console.error(
        `Failed to add Linear report comment to PR #${prNumber}:`,
        error
      )
    }
  } catch (error) {
    console.error('Error generating Linear report:', error)
  }
}

/**
 * SLACK
 */
const deleteSlackPost = async (ts: string) => {
  try {
    const response = await slackClient.chat.delete({
      channel,
      ts,
    })

    if (response.ok) return true

    return false
  } catch (error) {
    console.error('Error deleting Slack message:', error)
    return false
  }
}

const postToSlack = async (body: { title: string; url: string }) => {
  try {
    const text = formatSlackMessage(body)
    const response = await slackClient.chat.postMessage({
      text,
      channel,
    })

    if (response.ok) {
      const { ts } = response.message ?? {}
      return ts
    }

    return false
  } catch (error) {
    console.error('Error posting to Slack:', error)
    if (error.response) {
      console.error(`HTTP Error: ${error.response.status}`)
      console.error('Response Data:', error.response.data)
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Error:', error.message)
    }
    return false
  }
}

export {
  createPullRequest,
  fetchIndividualPR,
  postToSlack,
  getPRs,
  deleteSlackPost,
  mergePullRequest,
}
