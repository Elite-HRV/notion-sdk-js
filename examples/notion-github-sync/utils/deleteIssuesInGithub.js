const { Octokit } = require("octokit")
const dotenv = require("dotenv")
dotenv.config()
const octokit = new Octokit({ auth: process.env.GITHUB_KEY })

module.exports = function deleteIssuesInGithub(issues) {
  const indexVars = require("../index")
  const gitHubIssuesIdToNotionPageId = indexVars.gitHubIssuesIdToNotionPageId

  issues.forEach(async issue => {
    if (!gitHubIssuesIdToNotionPageId[issue.number]) {
      console.log("deleting the issue:", issue)
      await octokit.graphql(
        `
        mutation($issueId:ID!) {
          deleteIssue(input: { issueId: $issueId }){clientMutationId}
        }`,
        { issueId: issue.nodeId }
      )
    }
  })
}
