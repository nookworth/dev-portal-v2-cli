import { LinearClient } from '@linear/sdk'
import { Octokit } from 'octokit'
import { graphql } from '@octokit/graphql'
import { linearApiKey, auth } from './constants.ts'
import { WebClient } from '@slack/web-api'

const { SLACK_TOKEN } = process.env

// API clients
const linearClient = new LinearClient({
  apiKey: linearApiKey,
})
const octokit = new Octokit({
  auth,
})
const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: auth,
  },
})
const slackClient = new WebClient(SLACK_TOKEN)

export { linearClient, octokit, graphqlWithAuth, slackClient }
