import { LinearClient } from '@linear/sdk'
import { Octokit } from 'octokit'
import { graphql } from '@octokit/graphql'
import { linearApiKey, auth } from './constants.ts'

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

export { linearClient, octokit, graphqlWithAuth }
