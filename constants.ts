import { styleText } from 'util'

enum SlackActions {
  post = 'post',
  delete = 'delete',
}

const devMode = process.argv[2]
const newPRMessage = 'New PR from current branch'

const theme = {
  icon: {
    cursor: '👉',
  },
  style: {
    highlight: (text: string) => {
      const isNewPR = text.includes(newPRMessage)
      const numberSubstring = text.match(/\s\(#\d+\)/)?.[0] ?? ''
      const rest = text.slice(0, text.length - numberSubstring.length)
      return isNewPR
        ? styleText('yellow', text)
        : styleText('green', rest) + styleText('gray', numberSubstring)
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
  newPRMessage,
  SlackActions as SlackActionsEnum,
  theme,
  urlConstants,
}
