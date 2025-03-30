import { user } from '../constants'

const formatSlackMessage = ({ title, url }: { title: string; url: string }) => {
  return `*${user}* requests a review:\n${url}: ${title}`
}

const parseBranchName = (branchName: string) => {
  const linearRegex = /[A-Za-z]+-[0-9]+/
  const linearMatch = branchName.match(linearRegex)
  if (linearMatch) {
    return linearMatch[0].toUpperCase()
  } else {
    throw new Error('No matching pattern found in branch name')
  }
}

export { formatSlackMessage, parseBranchName }
