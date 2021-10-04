/* ================================================================================

	notion-github-sync.
  
  Glitch example: https://glitch.com/edit/#!/notion-github-sync
  Find the official Notion API client @ https://github.com/makenotion/notion-sdk-js/

================================================================================ */
// import updatePagesAndIssues from "./utils"
const updatePagesAndIssues = require("./utils/updatePagesAndIssues")
const getNotionOperations = require("./utils/getNotionOperations")
const getIssuesFromNotionDatabase = require("./utils/getIssuesFromNotionDatabase")
const createIssuesInGithub = require("./utils/createIssuesInGithub")
const getGitHubIssuesForRepository = require("./utils/getGitHubIssuesForRepository")

const { Client } = require("@notionhq/client")
const dotenv = require("dotenv")
const { Octokit } = require("octokit")
const _ = require("lodash")

dotenv.config()
const octokit = new Octokit({ auth: process.env.GITHUB_KEY })

let project = undefined
exports.tasks = tasks = []

exports.statusMap = {
  "00aa773c-e011-4d62-aded-ea70c3240cbf": 15892057, //ready for dev
  "08886f7a-7cc9-47bd-b767-ab749904a646": 15892071, //in progress
  "8e4df6b6-68fd-44e8-8a5c-c5c3d031d9c5": 15892078, // in QA
  "a1235c8b-92b6-4529-85b0-4bd28014f02b": 15892080, // Ready for prod
  "19cc88fc-6476-4e04-895f-152d8b482513": 15892084, // Released
}

exports.assigneeMap = {
  "3bab7949-d39b-45dc-bb30-520cb6116ad5": "fernandoelitehrv", //Fernando
  "62d4a6d9-0dd6-4519-88c9-110f1ded8e7f": "navasiloy", //Nick
  "b2df0edd-94d9-4369-ab1c-6524f1d657a2": "jennabradford", //Jenna
  "4368ca8f-e8cd-41f8-b030-7bc26b694cb1": "JefFryF", //Jef
}

/**
 * Local map to store  GitHub issue ID to its Notion pageId.
 * { [issueId: string]: string }
 */
exports.gitHubIssuesIdToNotionPageId = gitHubIssuesIdToNotionPageId = {}

const issuesToCreate = []

/**
 * Initialize local data store.
 * Then sync with GitHub.
 */
setInitialGitHubToNotionIdMap().then(syncNotionDatabaseWithGitHub)

/**
 * Get and set the initial data store with issues currently in the database.
 */
async function setInitialGitHubToNotionIdMap() {
  const projects = await octokit.rest.projects.listForOrg({
    org: process.env.GITHUB_REPO_OWNER,
  })

  exports.project = project = projects.data.find(
    element => element.number == process.env.PROJECT_NUMBER
  )

  exports.columns = await octokit.rest.projects.listColumns({
    project_id: project.id,
  })

  const currentIssues = await getIssuesFromNotionDatabase()
  for (const { pageId, issueNumber, data } of currentIssues) {
    if (issueNumber) {
      gitHubIssuesIdToNotionPageId[issueNumber] = pageId
      gitHubIssuesIdToNotionPageId[issueNumber] = pageId
    } else {
      issuesToCreate.push(data)
    }
    tasks.push(data)
  }
}

async function syncNotionDatabaseWithGitHub() {
  // Get all issues currently in the provided GitHub repository.
  console.log("\nFetching issues from Notion DB...")
  const issues = await getGitHubIssuesForRepository()
  console.log(`Fetched ${issues.length} issues from GitHub repository.`)

  // Group issues into those that need to be created or updated in the Notion database.
  const { pagesToCreate, pagesToUpdate } = await getNotionOperations(issues)

  console.log(`\n${issuesToCreate.length} issues to create in Github.`)
  await createIssuesInGithub(issuesToCreate)

  // Updates pages for existing issues.
  console.log(`\n${pagesToUpdate.length} issues to update in Notion.`)
  await updatePagesAndIssues(pagesToUpdate, tasks)

  // Success!
  console.log("\n✅ Notion database is synced with GitHub.")
}
