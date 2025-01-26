import { readFileSync, existsSync } from 'fs'
import path from 'node:path'
import { homedir } from 'os'

type PR = {
  mergeable?: boolean
  number: number
  postedToSlack?: boolean
  reviewTs?: string
  status: string
  title: string
  url: string
}

type PortalCache = {
  headBranchName: string | null
  pathToHead: string | null
  prs: { [key: number]: PR }
}

const cache: PortalCache = existsSync(
  path.join(homedir(), '.portal-cache.json')
)
  ? JSON.parse(
      readFileSync(path.join(homedir(), '.portal-cache.json'), 'utf-8')
    )
  : {
      headBranchName: null,
      pathToHead: null,
      prs: {},
    }

export { cache }
export type { PR, PortalCache }
