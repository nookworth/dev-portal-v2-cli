import { cache } from '../cache'
import { input } from '@inquirer/prompts'
import { createPullRequest } from '../utils'
import { mainMenu, prActions } from '.'

const handleMenuFlow = async () => {
  const prChoice = await mainMenu()
  if (prChoice === 0) {
    console.log('Goodbye 👋')
    process.exit(0)
  }
  return await prActions(prChoice)
}

export const createPr = async () => {
  if (!cache.headBranchName) {
    console.error('No head branch name found')
    return handleMenuFlow()
  }

  const title = await input({ message: 'Enter the title of the PR:' })
  const body = await input({ message: 'Enter the body of the PR:' })

  const response = await createPullRequest({
    head: cache.headBranchName,
    title,
    body,
  })

  console.log(
    response?.status === 201 ? 'PR created successfully' : 'Error creating PR'
  )
  return handleMenuFlow()
}
