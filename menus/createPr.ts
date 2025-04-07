import { cache } from '../cache'
import { input } from '@inquirer/prompts'
import { createPullRequest } from '../utils/api'
import { getContext, loopToMain } from '../utils/menu'
import { styleText } from 'util'

export const createPr = async () => {
  if (!cache.headBranchName) {
    console.error('No head branch name found')
    await loopToMain()
    return
  }

  const context = getContext()
  const styleESC = styleText('gray', '(ESC to cancel)')

  try {
    const title = await input(
      { message: `Enter PR title ${styleESC}:` },
      context
    )
    const body = await input({ message: `Enter PR body ${styleESC}:` }, context)

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

    await loopToMain()
  } catch (error) {
    if (error.message.includes('Prompt was aborted')) {
      await loopToMain()
    }
    console.error('An error occurred:', error)
    await loopToMain()
  }
}
