import { styleText } from 'util'

enum SlackActions {
  post = 'post',
  delete = 'delete',
}

const devMode = process.argv[2]

const theme = {
  icon: {
    cursor: '👉',
  },
  style: {
    highlight: (text: string) => {
      const numberSubstring = text.match(/\s\(#\d+\)/)?.[0] ?? ''
      const rest = text.slice(0, text.length - numberSubstring.length)
      return styleText('green', rest) + styleText('gray', numberSubstring)
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
export { devMode, SlackActions as SlackActionsEnum, theme, urlConstants }
