import { mainMenu, prActions } from './menus'
import './webSocket'

const prChoice = await mainMenu()
if (prChoice === 0) {
  console.log('Goodbye 👋')
  process.exit(0)
}
await prActions(prChoice)
