import { owner, repo } from '../constants.ts'
import { DynamicStructuredTool, tool } from '@langchain/core/tools'
import { z } from 'zod'
import { linearClient, octokit } from '../init.ts'

const linearSchema = z.object({
  ticketNumber: z.string().describe('The Linear ticket number'),
})

const prNumberSchema = z.object({
  prNumber: z.string().describe('The number of the pull request to look up'),
})

const linearTool: DynamicStructuredTool<typeof linearSchema> = tool(
  async ({ ticketNumber }: { ticketNumber: string }) => {
    try {
      const ticket = await linearClient.issue(ticketNumber)
      if (!ticket) {
        return 'Ticket not found'
      }

      const description = ticket.description
      let commentData: string[] = []

      try {
        const fetchedComments = await ticket.comments()
        if (fetchedComments?.nodes) {
          commentData = fetchedComments.nodes.map(comment => comment.body)
        }
      } catch (commentError) {
        console.error('Error fetching comments:', commentError)
      }

      return { description, comments: commentData }
    } catch (error) {
      console.error('Error fetching ticket:', error)
      return 'Failed to retrieve ticket'
    }
  },
  {
    name: 'linear',
    description:
      'this returns the description and comments for a Linear ticket',
    schema: linearSchema,
  }
)

const commitTool: DynamicStructuredTool<typeof prNumberSchema> = tool(
  async ({ prNumber }: { prNumber: string }) => {
    const response = await octokit.rest.pulls.listCommits({
      owner,
      repo,
      pull_number: parseInt(prNumber),
    })
    const commitMessages = response.data.map(commit => commit.commit.message)
    if (response.status === 200) {
      return commitMessages
    } else {
      throw new Error(`Failed to list commits for PR #${prNumber}`)
    }
  },
  {
    name: 'commits',
    description: 'Use this to retrieve commit messages for a pull request',
    schema: prNumberSchema,
  }
)

/**@todo RAG (or otherwise compress/optimize) the full contents of each file for more LLM context */
const patchTool: DynamicStructuredTool<typeof prNumberSchema> = tool(
  async ({ prNumber }: { prNumber: string }) => {
    const response = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: parseInt(prNumber),
    })
    if (response.status === 200) {
      const filtered = response.data.filter(
        ({ filename }) => !filename.includes('__generated__')
      )
      const patches = filtered.map(file => file.patch)
      return patches
    } else {
      throw new Error(`Failed to retrieve patches for PR #${prNumber}`)
    }
  },
  {
    name: 'patches',
    description:
      'Use to retrive all of the patches introduced by a pull request',
    schema: prNumberSchema,
  }
)

export { linearTool, commitTool, patchTool }
