import { styleText } from 'util'

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
  base: 'https://tpg-dev-portal-server.fly.dev',
  testBase: 'http://localhost:3000',
  owner: 'nookworth',
  repo: 'tpg-dev-portal',
  review: 'review-message',
}

export { theme, urlConstants }
