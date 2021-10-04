/**
 * Returns the GitHub issue to conform to this database's schema properties.
 *
 * @param {{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }} issue
 */
module.exports = function getPropertiesFromIssue(issue) {
  const indexVars = require("../index")
  const assigneeMap = indexVars.assigneeMap
  const statusMap = indexVars.statusMap
  const { number, state, comment_count, url, assignees, column_id } = issue

  let assignee = []
  assignees.forEach((userLogin, key) => {
    let notionUserId = Object.keys(assigneeMap).find(
      key => userLogin.login == assigneeMap[key]
    )
    assignee.push({ object: "user", id: notionUserId })
  })

  return {
    "Issue Number": {
      number,
    },
    "GitHub Status": {
      select: { name: state },
    },
    "Number of Comments": {
      number: comment_count,
    },
    "Issue URL": {
      url,
    },
    Assignee: {
      people: assignee,
    },
    Status: {
      select: {
        id: Object.keys(statusMap).find(key => statusMap[key] == column_id),
      },
    },
  }
}
