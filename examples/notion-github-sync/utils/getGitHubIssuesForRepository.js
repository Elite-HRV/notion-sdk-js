const { Octokit } = require("octokit")
const dotenv = require("dotenv")
dotenv.config()
const octokit = new Octokit({ auth: process.env.GITHUB_KEY })

/**
 * Gets issues from a GitHub repository. Pull requests are omitted.
 *
 * https://docs.github.com/en/rest/guides/traversing-with-pagination
 * https://docs.github.com/en/rest/reference/issues
 *
 * @returns {Promise<Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>>}
 */
module.exports = async function getGitHubIssuesForRepository() {
  const issues = []
  const iterator = octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO_NAME,
    state: "all",
    per_page: 100,
  })
  for await (const { data } of iterator) {
    for (const issue of data) {
      if (!issue.pull_request) {
        issues.push({
          nodeId: issue.node_id,
          number: issue.number,
          title: issue.title,
          comment_count: issue.comments,
          url: issue.html_url,
          updatedAt: issue.updated_at,
          assignees: issue.assignees,
        })
      }
    }
  }

  return issues
}
