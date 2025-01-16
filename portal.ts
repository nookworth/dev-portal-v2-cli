import { mainMenu, prActions } from './menus'
import { resolveActionChoice } from './utils'
import './webSocket'

const prChoice = await mainMenu()
if (prChoice === 0) {
  console.log('Goodbye 👋')
  process.exit(0)
}
const actionChoice = await prActions(prChoice)
await resolveActionChoice(actionChoice, prChoice)
