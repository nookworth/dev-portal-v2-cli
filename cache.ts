import { readFileSync, existsSync } from 'fs'
import path from 'node:path'
import { homedir } from 'os'

/**@todo import real types */
type PR = {
  mergeable?: boolean | null | undefined
  number: number
  postedToSlack?: boolean
  ref: string
  reviewTs?: string
  status: 'open' | 'closed'
  title: string
  url: string
}

type PortalCache = {
  headBranchName: string | null
  pathToHead: string | null
  prs: { [key: number]: PR | null }
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
