import { styleText } from 'util'

type PR = {
  mergeable?: boolean
  number: number
  postedToSlack?: boolean
  reviewTs?: string
  status: string
  title: string
  url: string
}

type Cache = {
  prs: PR[]
  // prDetails?: { [key: number]: any }
}

enum SlackActions {
  post = 'post',
  delete = 'delete',
}

const cache: Cache = {
  prs: [],
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

export type { PR, Cache, SlackActions }
export { cache, devMode, SlackActions as SlackActionsEnum, theme, urlConstants }
