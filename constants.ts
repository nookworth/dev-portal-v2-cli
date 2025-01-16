import { styleText } from 'util'

type PR = {
  number: number
  status: string
  title: string
  url: string
}

type Cache = {
  prs?: PR[]
  prDetails?: { [key: number]: any }
}

const cache: Cache = {}

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
      ? 'http://localhost:3000'
      : 'https://tpg-dev-portal-server.fly.dev',
  owner: 'nookworth',
  repo: 'tpg-dev-portal',
  review: 'review-message',
}

export type { PR, Cache }
export { cache, devMode, theme, urlConstants }
