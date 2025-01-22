import { styleText } from 'util'

enum SlackActions {
  post = 'post',
  delete = 'delete',
}

const devMode = process.argv[2]
const goodbyeMessages = [
  'Goodbye 👋',
  'See you later 👋',
  'Au revoir 👋',
  'Auf wiedersehen 👋',
  'Have a great day 👋',
  'So long and thanks for all the fish 👋',
  'Adios 👋',
]
const newPRMessage = 'New pull request from HEAD'

const theme = {
  icon: {
    cursor: '👉',
  },
  style: {
    highlight: (text: string) => {
      const isExit = text.includes('Exit')
      const isNewPR = text.includes(newPRMessage)
      const numberSubstring = text.match(/\s\(#\d+\)/)?.[0] ?? ''
      const rest = text.slice(0, text.length - numberSubstring.length)
      return isExit
        ? styleText('redBright', text)
        : isNewPR
        ? styleText('greenBright', text)
        : styleText('yellowBright', rest) + styleText('gray', numberSubstring)
    },
  },
}

const urlConstants = {
  domain:
    devMode === 'true'
      ? 'http://localhost:8080'
      : 'https://tpg-dev-portal-server.fly.dev',
  owner: 'nookworth',
  repo: 'tpg-dev-portal',
  review: 'review-message',
}

export type { SlackActions }
export {
  devMode,
  goodbyeMessages,
  newPRMessage,
  SlackActions as SlackActionsEnum,
  theme,
  urlConstants,
}
