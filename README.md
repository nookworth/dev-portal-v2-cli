### Last update 4/9/2025

### Setup

- Clone the repository
- Create `.env` file
- Copy `TPG Portal .env` from 1Password into `.env`

### Usage

- start the process using `npm run prod` + your GitHub username. Example: `npm run prod nookoid`
  - recommended to set a shell alias. For example: `alias portal="cd ~/Documents/dev-portal-v2/cli && npm run prod nookoid"`
- enter path to your travelpass.com local repository (or whichever repository you plan to work in), starting AFTER your home directory
- when creating a pull request, the app looks at your current HEAD branch. The flow to create a new PR is:
  1. git add/git commit/git push as normal
  2. open portal app. you could also leave it running
  3. select "New pull request from `{HEAD branch}`"
  4. Enter the title and description or leave them blank
  5. caveat: the HEAD branch reference is not updated in real time. If you don't see the option to create a new PR, either:
  - restart the portal OR
  - enter a submenu and then go back to the main menu
- you can point the portal to a different repository by removing `~/.portal-cache.json` and restarting the application
- press ESC to go to the previous menu

### TODO / Planned Features

- watch for changes in HEAD branch
- better handling of PR mergeability
- use a real auth flow
- set up a service account for the GitHub personal access token
- desktop notifications when a PR changes state
- manage deployment flow from portal

