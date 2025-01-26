import { cache } from '../cache'
import { input } from '@inquirer/prompts'
import { createPullRequest } from '../utils'
import { mainMenu } from '.'

export const createPr = async () => {
  if (!cache.headBranchName) {
    console.error('No head branch name found')
    return mainMenu()
  }
  const title = await input({ message: 'Enter the title of the PR:' })
  const body = await input({ message: 'Enter the body of the PR:' })
  const { status } = await createPullRequest({
    head: cache.headBranchName,
    title,
    body,
  })
  if (status === 200) {
    console.log('PR created successfully')
    return mainMenu()
  } else {
    console.error('Error creating PR')
    return mainMenu()
  }
}
