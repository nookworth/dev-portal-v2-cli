import { cache, PortalCache } from '../cache'
import { readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import path from 'path'
import { input } from '@inquirer/prompts'

const saveCache = () => {
  try {
    writeFileSync(
      path.join(homedir(), '.portal-cache.json'),
      JSON.stringify(cache, null, 2),
      {
        flag: 'w',
      }
    )
  } catch (error) {
    console.error('ERROR WRITING CACHE\n', error)
  }
}

const setHeadBranchName = async (cache: PortalCache) => {
  if (!cache) {
    console.error('No cache found')
    return
  }

  const fetchHeadBranchName = (pathToHead: string) => {
    const head = readFileSync(pathToHead, 'utf-8')
    const headBranchName = head.split('ref: ')[1].split('/')[2].trim()
    return headBranchName
  }

  if (!cache.pathToHead) {
    const localRepo = await input({
      message: `Enter the path to your local travelpass.com repo starting after your home directory:`,
    })
    try {
      const pathToHead = path.join(homedir(), localRepo, '/.git/HEAD')
      const headBranchName = fetchHeadBranchName(pathToHead)
      cache.pathToHead = pathToHead
      cache.headBranchName = headBranchName
      return headBranchName
    } catch (err) {
      console.error('Error retrieving head branch name:', err)
    }
  } else {
    const headBranchName = fetchHeadBranchName(cache.pathToHead)
    cache.headBranchName = headBranchName
    return headBranchName
  }
}

export { saveCache, setHeadBranchName }
