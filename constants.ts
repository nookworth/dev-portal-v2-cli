import { styleText } from 'util'

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
  domain: devMode
    ? 'http://localhost:3000'
    : 'https://tpg-dev-portal-server.fly.dev',
  owner: 'nookworth',
  repo: 'tpg-dev-portal',
  review: 'review-message',
}

export { devMode, theme, urlConstants }
