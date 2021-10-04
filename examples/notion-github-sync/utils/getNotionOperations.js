/**
 * Determines which issues already exist in the Notion database.
 *
 * @param {Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>} issues
 * @returns {{
 *   pagesToCreate: Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>;
 *   pagesToUpdate: Array<{ pageId: string, number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>
 * }}
 */

module.exports = async function getNotionOperations(issues) {
  const getIssueCard = require("./getIssueCard")

  const indexVars = require("../index")
  const gitHubIssuesIdToNotionPageId = indexVars.gitHubIssuesIdToNotionPageId

  const pagesToCreate = []
  const pagesToUpdate = []
  for (const issue of issues) {
    const pageId = gitHubIssuesIdToNotionPageId[issue.number]
    if (pageId) {
      const card = await getIssueCard(pageId)

      if (card) {
        issue.column_id = card.data.column_url.substring(
          card.data.column_url.lastIndexOf("/") + 1
        )
      }

      pagesToUpdate.push({
        ...issue,
        card,
        pageId,
      })
    } else {
      pagesToCreate.push(issue)
    }
  }
  return { pagesToCreate, pagesToUpdate }
}
