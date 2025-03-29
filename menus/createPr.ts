import { cache } from '../cache'
import { input } from '@inquirer/prompts'
import { handleMenuFlow, createPullRequest } from '../utils'

export const createPr = async () => {
  if (!cache.headBranchName) {
    console.error('No head branch name found')
    await handleMenuFlow()
    return
  }

  const title = await input({ message: 'Enter the title of the PR:' })
  const body = await input({ message: 'Enter the body of the PR:' })

  const { status } =
    (await createPullRequest({
      head: cache.headBranchName ?? '',
      title,
      body,
    })) ?? {}

  if (status === 201) {
    console.log('PR created successfully')
  } else {
    console.error('Error creating PR')
  }

  await handleMenuFlow()
}
