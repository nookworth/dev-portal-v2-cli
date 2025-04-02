import { readFileSync, existsSync } from 'fs'
import path from 'node:path'
import { homedir } from 'os'

type PR = {
  head: {
    ref: string
    sha: string
  }
  mergeable: boolean | null | undefined
  /**@desc see https://github.com/octokit/octokit.net/issues/1763 */
  mergeableState: string | null | undefined
  number: number
  postedToSlack?: boolean
  reviews?: Array<{
    body: string
    state: string
    user: string
  }>
  reviewTs?: string
  /**@desc the state of the PR */
  state: 'open' | 'closed'
  /**@desc the status of the head commit; needs to be 'success' for the PR to be mergeable */
  status: string
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
