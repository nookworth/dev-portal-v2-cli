import { readFileSync, existsSync } from 'fs'

type PR = {
  mergeable?: boolean
  number: number
  postedToSlack?: boolean
  reviewTs?: string
  status: string
  title: string
  url: string
}

type PRCache = {
  prs: PR[]
}

const cache: PRCache = existsSync('./cache.json')
  ? JSON.parse(readFileSync('./cache.json', 'utf-8'))
  : {
      prs: [],
    }

export { cache }
export type { PR, PRCache }
