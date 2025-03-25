import 'dotenv/config'
import { styleText } from 'util'

enum SlackActions {
  post = 'post',
  delete = 'delete',
}

const goodbyeMessages = [
  'Goodbye 👋',
  'See you later 👋',
  'Au revoir 👋',
  'Auf wiedersehen 👋',
  'Have a great day 👋',
  'So long and thanks for all the fish 👋',
  'Adios 👋',
]

const theme = {
  icon: {
    cursor: '👉',
  },
  style: {
    highlight: (text: string) => {
      const isExit = text.includes('Exit')
      const isNewPR = text.includes('New pull request')
      if (isNewPR) {
        const branchName = text.split('New pull request from ')[1]
        const branchNameSubstr = styleText('greenBright', branchName)
        return styleText('green', text.replace(branchName, branchNameSubstr))
      }
      const numberSubstring = text.match(/\s\(#\d+\)/)?.[0] ?? ''
      const rest = text.slice(0, text.length - numberSubstring.length)
      return isExit
        ? styleText('red', text)
        : styleText('yellow', rest) + styleText('gray', numberSubstring)
    },
  },
}

// Command line arguments
let test = process.argv[2]
let owner = process.argv[3]
let repo = process.argv[4]
let user = process.argv[5]

// Constants
const baseRepo = owner === 'travelpassgroup' ? 'master' : 'main'
const baseUrl = 'https://api.github.com'
const devFrontendReviewsChannelId = 'C039QHRA6TA'
const deploymentBotTestChannelId = 'C089KFXCWJC'
const channelId =
  test === 'true' ? deploymentBotTestChannelId : devFrontendReviewsChannelId
const urlConstants = {
  domain:
    test === 'true'
      ? 'http://localhost:8080'
      : 'https://tpg-dev-portal-server.fly.dev',
  owner: 'nookworth',
  repo: 'tpg-dev-portal',
  review: 'review-message',
}

// Environment variables
const langchainApiKey = process.env.LANGCHAIN_API_KEY
const openAIKey = process.env.OPENAI_API_KEY
const nookworthPat = process.env.NOOKWORTH_PAT
const tpgPat = process.env.PAT
const linearApiKey = process.env.LINEAR_API_KEY
const auth =
  test === 'false'
    ? tpgPat
    : owner === 'travelpassgroup'
    ? tpgPat
    : nookworthPat

export type { SlackActions }
export {
  auth,
  baseRepo,
  baseUrl,
  channelId,
  goodbyeMessages,
  langchainApiKey,
  linearApiKey,
  openAIKey,
  owner,
  repo,
  SlackActions as SlackActionsEnum,
  theme,
  test,
  tpgPat,
  urlConstants,
  user,
}
